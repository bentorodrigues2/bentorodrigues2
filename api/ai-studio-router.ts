import axios from "axios";

async function callGeminiWithRetry(payload, retries = 5, delay = 1500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(
        process.env.AI_STUDIO_MODEL_URL,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.AI_STUDIO_API_KEY
          },
          timeout: 30000
        }
      );

      return response.data;

    } catch (err) {
      const status = err?.response?.status;

      // Erros temporários do Google → retry
      const retryable =
        status === 503 || // Service Unavailable
        status === 429 || // Too Many Requests
        status === 500;   // Internal Error

      console.error(
        `[AI Studio] Erro na tentativa ${attempt}/${retries}:`,
        status,
        err.message
      );

      if (!retryable || attempt === retries) {
        throw err;
      }

      // Backoff exponencial
      await new Promise((res) => setTimeout(res, delay * attempt));
    }
  }
}

export default async function handler(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ erro: "Falta email" });
    }

    // Sanitização do corpo
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

    // Chamada com retry/backoff
    const result = await callGeminiWithRetry(payload);

    return res.status(200).json(result);

  } catch (e) {
    console.error("Erro no AI Studio (final):", e);
    return res.status(500).json({ erro: "Erro no AI Studio", detalhe: e.message });
  }
}
