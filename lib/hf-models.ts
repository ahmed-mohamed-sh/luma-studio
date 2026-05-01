export const hfImageModels = [
  "stabilityai/stable-diffusion-xl-base-1.0",
];

export type HfImageModel = (typeof hfImageModels)[number];

export const hfImageModelLabels: Record<HfImageModel, string> = {
  "stabilityai/stable-diffusion-xl-base-1.0": "Stable Diffusion XL",
};
