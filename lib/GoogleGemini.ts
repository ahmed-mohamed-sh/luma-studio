import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const geminiClient = apiKey ? new GoogleGenAI({ apiKey }) : null;
