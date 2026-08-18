import { ai } from "./AIStudioClient";

export async function askAI(prompt: string) {
  const response = await ai.responses.create({
    model: "gpt-4o-mini",
    input: prompt,
  });

  return response.output_text;
}
