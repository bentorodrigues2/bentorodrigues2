import { getAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const ai = getAI();

    const contents = [
      {
        role: "user",
        parts: [
          {
            text: req.body.texto || "Analisa este documento."
          }
        ]
      }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents
    });

    const result = response?.response?.text() || null;

    return res.status(200).json({
      sucesso: true,
      ia: result
    });

  } catch (e) {
    console.error("Erro IA:", e);
    return res.status(500).json({ erro: e.message });
  }
}
