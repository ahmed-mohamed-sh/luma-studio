import { createOpenAI } from "@ai-sdk/openai";

const apiKey = process.env.GEMINI_API_KEY;

export const openaiProvider = apiKey ? createOpenAI({ apiKey }) : null;
