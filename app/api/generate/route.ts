import {
  countGenerationsSince,
  createGeneration,
  utcMonthStart,
} from "@/db/generations";
import { getMonthlyGenerationLimit } from "@/lib/generation-quota";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";

import * as Sentry from "@sentry/nextjs";
import { geminiClient } from "@/lib/GoogleGemini";
import { ACCEPTED_SOURCE_IMAGE_MIME_TYPES } from "@/lib/constants";
import { getStylePreset } from "@/lib/style-presets";

import { uploadBufferToImageKit } from "@/lib/imagekit";

export const runtime = "nodejs";

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (err: any) {
      if (err?.status === 503 || err?.error?.code === 503) {
        attempt++;
        if (attempt >= retries) throw err;
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        throw err;
      }
    }
  }
  throw new Error("Unreachable");
}



type GenerateImageRequest = {
  sourceImageUrl?: string;
  sourceMimeType?: string;
  originalFileName?: string;
  styleSlug?: string;
  model?: string;
};



export async function POST(request: Request) {
  const { userId, has } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const monthlyLimit = getMonthlyGenerationLimit(has);
  const usedThisMonth = await countGenerationsSince(userId, utcMonthStart());

  if (usedThisMonth >= monthlyLimit) {
    Sentry.logger.warn("generation.quota_exceeded", {
      limit: monthlyLimit,
      used: usedThisMonth,
    });

    return NextResponse.json(
      {
        error: `Monthly generation limit reached (${monthlyLimit} images). Upgrade your plan or try again next month.`,
        code: "QUOTA_EXCEEDED" as const,
        limit: monthlyLimit,
        used: usedThisMonth,
      },
      { status: 429 },
    );
  }

  if (!geminiClient) {
    return NextResponse.json(
      { error: "Missing GEMINI_API_KEY." },
      { status: 500 },
    );
  }

  if (!process.env.HF_TOKEN) {
    return NextResponse.json(
      { error: "Missing HF_TOKEN in environment variables." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as GenerateImageRequest;

  const { model, originalFileName, sourceImageUrl, sourceMimeType, styleSlug } =
    body;

  if (!sourceImageUrl) {
    return NextResponse.json(
      { error: "Please upload an image first." },
      { status: 400 },
    );
  }

  if (
    typeof sourceMimeType !== "string" ||
    !ACCEPTED_SOURCE_IMAGE_MIME_TYPES.has(sourceMimeType)
  ) {
    return NextResponse.json(
      { error: "Only JPG, PNG, and WEBP files are supported." },
      { status: 400 },
    );
  }

  if (typeof styleSlug !== "string") {
    return NextResponse.json(
      { error: "Please choose a style." },
      { status: 400 },
    );
  }

  if (!model) {
    return NextResponse.json(
      { error: "Please choose a model." },
      { status: 400 },
    );
  }

  const preset = getStylePreset(styleSlug);
  if (!preset) {
    return NextResponse.json(
      { error: "Unknown style preset." },
      { status: 400 },
    );
  }

  const imageResponse = await fetch(sourceImageUrl);
  if (!imageResponse.ok) {
    return NextResponse.json(
      { error: "Could not fetch the uploaded source image." },
      { status: 404 },
    );
  }

  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

  const prompt = [
    preset.prompt,
    "Do not add extra people, extra limbs, duplicate subjects, or change the overall camera angle.",
  ].join("\n\n");

  try {
    // generateImage =>

    const result = await Sentry.startSpan(
      {
        name: `image edit ${model}`,
        op: "gen_ai.request",
        attributes: {
          "gen_ai.request.model": model,
          "gen_ai.operation.name": "request",
          "gen_ai.request.messages": JSON.stringify([
            { role: "user", content: prompt },
            { role: "user", content: "[source image attachment omitted]" },
          ]),
        },
      },
      async (span) => {
        // Step 1: Describe
        const descriptionResponse = await withRetry(() => geminiClient!.models.generateContent({
          model: 'gemini-flash-latest',
          contents: [
            {
              role: 'user',
              parts: [
                { text: 'Describe this image in extreme detail. Focus on the main subjects, composition, lighting, and overall scene. Do not describe any style.' },
                { inlineData: { data: imageBuffer.toString("base64"), mimeType: sourceMimeType as string } }
              ]
            }
          ]
        }));

        const description = descriptionResponse.text;

        // Step 2: Redraw
        const combinedPrompt = `${description}\n\nStyle: ${prompt}`;

        const hf = new HfInference(process.env.HF_TOKEN);
        const hfBase64 = await withRetry(async () => {
          try {
            const res = (await hf.textToImage({
              model,
              inputs: combinedPrompt,
            })) as unknown as Blob;
            const arrayBuffer = await res.arrayBuffer();
            return Buffer.from(arrayBuffer).toString("base64");
          } catch (err: any) {
            if (err?.httpResponse?.status === 503 || err?.status === 503) {
              throw { status: 503 };
            }
            throw new Error(`Hugging Face API error: ${err.message || err}`);
          }
        });

        span.setAttribute(
          "gen_ai.response.text",
          JSON.stringify([
            "[image/png generated; pixel data not sent to Sentry]",
          ]),
        );

        return hfBase64;
      },
    );

    const imageBase64 = result;

    const resultBuffer = Buffer.from(imageBase64, "base64");

    const { url: resultImageUrl } = await uploadBufferToImageKit({
      buffer: resultBuffer,
      fileName: `${preset.slug}-result.png`,
      folder: `/users/${userId}/results`,
      mimeType: "image/png",
    });

    const savedGeneration = await createGeneration({
      clerkUserId: userId,
      originalFileName:
        typeof originalFileName === "string" ? originalFileName : null,
      sourceImageUrl,
      resultImageUrl,
      styleSlug: preset.slug,
      styleLabel: preset.label,
      model,
      promptUsed: prompt,
    });

    Sentry.logger.info("generation.completed", {
      generationId: savedGeneration.id,
      styleSlug: preset.slug,
      model,
    });

    return NextResponse.json({
      imageBase64,
      mimeType: "image/png",
      promptUsed: prompt,
      style: { slug: preset.slug, label: preset.label },
      model,
      savedGeneration,
    });
  } catch (error: any) {
    console.error("generate-image route failed", error);

    if (error?.status === 503 || error?.error?.code === 503) {
      return NextResponse.json(
        { error: "The AI model is currently busy or loading. Please try again in a few moments." },
        { status: 503 },
      );
    }

    if (error?.status === 429 || error?.error?.code === 429) {
      return NextResponse.json(
        { error: "AI rate limit exceeded. Please wait a moment and try again." },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { error: "Image generation failed. Please try again." },
      { status: 500 },
    );
  }
}
