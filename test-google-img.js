import { generateImage } from 'ai';
import { google } from '@ai-sdk/google';
import 'dotenv/config';

async function main() {
  try {
    const { image } = await generateImage({
      model: google.imageModel('imagen-3.0-generate-002'),
      prompt: 'A cute cat',
    });
    console.log('Success, base64 length:', image.base64.length);
  } catch (e) {
    console.error('Error:', e);
  }
}
main();
