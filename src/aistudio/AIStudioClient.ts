import { Client } from "@microsoft/copilot-sdk";

export const ai = new Client({
  apiKey: import.meta.env.VITE_AISTUDIO_KEY,
});
