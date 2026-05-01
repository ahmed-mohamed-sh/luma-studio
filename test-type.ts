import { HfInference } from "@huggingface/inference";
const hf = new HfInference("dummy");
const res = hf.textToImage({ model: "dummy", inputs: "dummy" });
