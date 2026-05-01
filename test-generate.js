const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function testModel(modelName) {
  try {
    const response = await ai.models.generateContent({
        model: modelName,
        contents: "Describe a cat."
    });
    console.log(`Success with ${modelName}`);
  } catch (err) {
    console.error(`Failed with ${modelName}:`, err.message);
  }
}

async function main() {
  await testModel('gemini-2.5-flash');
  await testModel('gemini-flash-latest');
  await testModel('gemini-3.1-flash-lite-preview');
}
main();
