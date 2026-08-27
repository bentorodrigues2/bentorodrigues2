import axios from "axios";

export default async function handler(req, res) {
  try {
    const emails = await getUnreadEmails();

    for (const email of emails) {
      const aiResponse = await axios.post(
        "/api/ai-studio-router",
        { email }
      );

      await axios.post(
        "/api/autoresponder",
        { aiResponse: aiResponse.data, email }
      );
    }

    return res.status(200).json({ ok: true });

  } catch (e) {
    console.error("Erro gmail-reader:", e);
    return res.status(500).json({ erro: "Erro gmail-reader", detalhe: e.message });
  }
}
