import { generateImage } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import 'dotenv/config';
import fs from 'fs';

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  try {
    const { image } = await generateImage({
      model: google.imageModel('imagen-3.0-generate-002'),
      prompt: {
        text: 'A cute cat',
        images: [fs.readFileSync('./public/logo.png')],
      }
    });
    console.log('Success, base64 length:', image.base64.length);
  } catch (e) {
    console.error('Error:', e);
  }
}
main();
