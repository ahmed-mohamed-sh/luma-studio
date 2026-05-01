import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";
dotenv.config();

const hf = new HfInference(process.env.HF_TOKEN);
async function test() {
  try {
    const response = await hf.textToImage({
      model: 'stabilityai/stable-diffusion-xl-base-1.0',
      inputs: 'award winning photo of a cat'
    });
    console.log("Success! Blob size:", response.size);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
