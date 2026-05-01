export const openAiImageModels = ["dall-e-2", "dall-e-3"] as const;

export type OpenAiImageModel = (typeof openAiImageModels)[number];

export const openAiImageModelLabels: Record<OpenAiImageModel, string> = {
  "dall-e-2": "DALL-E 2",
  "dall-e-3": "DALL-E 3",
};
