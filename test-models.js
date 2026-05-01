const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function main() {
  const response = await ai.models.list();
  for await (const model of response) {
    if (model.name && model.name.includes('flash')) {
      console.log(model.name);
    }
  }
}
main().catch(console.error);
