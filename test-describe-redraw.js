import { generateText, generateImage } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import 'dotenv/config';
import fs from 'fs';

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  try {
    const imageBuffer = fs.readFileSync('./public/logo.png');
    
    // Step 1: Describe
    console.log("Describing image...");
    const { text: description } = await generateText({
      model: google('gemini-1.5-flash'),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Describe this image in detail. Focus on the main subjects and composition. Do not describe any style.' },
            { type: 'image', image: imageBuffer },
          ]
        }
      ]
    });
    
    console.log("Description:", description);
    
    // Step 2: Redraw
    console.log("Redrawing image...");
    const stylePrompt = "Cyberpunk neon city style";
    const combinedPrompt = `${description}\n\nStyle: ${stylePrompt}`;
    
    const { image } = await generateImage({
      model: google.imageModel('imagen-3.0-generate-002'),
      prompt: combinedPrompt,
    });
    console.log('Success, base64 length:', image.base64.length);
  } catch (e) {
    console.error('Error:', e);
  }
}
main();
