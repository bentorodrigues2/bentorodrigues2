import { askAI } from "./aistudio/useAI";

async function testAI() {
  const reply = await askAI("Olá, quem és tu?");
  console.log("AI Studio:", reply);
}

testAI();
