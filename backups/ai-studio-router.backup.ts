import axios from "axios";

export default async function handler(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ erro: "Falta email" });
    }

    const response = await axios.post(
      process.env.AI_STUDIO_MODEL_URL,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: JSON.stringify(email) }]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.AI_STUDIO_API_KEY
        }
      }
    );

    return res.status(200).json(response.data);
  } catch (e) {
    console.error("Erro no AI Studio:", e);
    return res.status(500).json({ erro: "Erro no AI Studio" });
  }
}

