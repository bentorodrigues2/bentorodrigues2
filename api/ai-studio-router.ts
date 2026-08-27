import axios from "axios";

async function chamarGeminiComRetry(payload: any, retries = 3, delayMs = 3000) {
  try {
    return await axios.post(
      process.env.AI_STUDIO_MODEL_URL!,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY!
        }
      }
    );
  } catch (error: any) {
    const status = error.response?.status;

    if ((status === 429 || status === 503) && retries > 0) {
      console.warn(`AI Studio: limite atingido. Aguardar ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return chamarGeminiComRetry(payload, retries - 1, delayMs * 2);
    }

    console.warn("AI Studio indisponível. Fallback para gemini-1.5-flash.");

    return await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY!
        }
      }
    );
  }
}

export default async function handler(req: any, res: any) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ erro: "Falta email" });
    }

    const cleanBody = email.body
      ?.replace(/<[^>]*>/g, "")
      .replace(/\r?\n|\r/g, " ")
      .replace(/\s+/g, " ")
      .trim() || "";

    const safeEmail = {
      id: email.id,
      from: email.from,
      subject: email.subject,
      date: email.date,
      snippet: email.snippet,
      body: cleanBody
    };

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: JSON.stringify(safeEmail) }]
        }
      ]
    };

    const result = await chamarGeminiComRetry(payload);

    return res.status(200).json(result.data);

  } catch (e: any) {
    console.error("Erro no AI Studio:", e);
    return res.status(500).json({ erro: "Erro no AI Studio", detalhe: e.message });
  }
}
