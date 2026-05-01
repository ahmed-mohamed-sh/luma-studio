import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';
import fs from 'fs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  try {
    console.log("Describing...");
    const imageBuffer = fs.readFileSync('./public/logo.png');
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: 'Describe this image briefly.' },
            { inlineData: { data: imageBuffer.toString("base64"), mimeType: 'image/png' } }
          ]
        }
      ]
    });
    console.log("Description:", response.text);

    console.log("Generating image...");
    const imgResponse = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: response.text + ' style: Cyberpunk',
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      }
    });
    console.log('Success, base64 length:', imgResponse.generatedImages[0].image.imageBytes.length);
  } catch (e) {
    console.error('Error:', e);
  }
}
main();
