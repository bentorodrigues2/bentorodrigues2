import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const secret = req.headers["x-api-key"];
    if (!secret || secret !== process.env.CONDOMANAGER_API_SECRET) {
      return res.status(401).json({ error: "API secret inválida" });
    }

    const payload = req.body;

    // 🔥 Enviar para o AI Studio
    const aiResponse = await fetch(process.env.AI_STUDIO_MODEL_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.AI_STUDIO_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const aiResult = await aiResponse.json();

    // 🔥 Devolver ao Worker exatamente o que ele espera
    return res.status(200).json(aiResult);

  } catch (err: any) {
    console.error("Erro em /api/reconhecer-recibo:", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
