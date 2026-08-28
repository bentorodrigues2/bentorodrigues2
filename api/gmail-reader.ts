import axios from "axios";
import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    // 1. Ler o JSON completo da Service Account
    const credentials = JSON.parse(
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || "{}"
    );

    // 2. Criar autenticação Google sem mexer na chave privada
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/gmail.modify"
      ]
    });

    const gmail = google.gmail({ version: "v1", auth });

    // 3. Obter emails não lidos
    const messages = await obterEmails(gmail);

    // 4. Processar cada email
    for (const msg of messages) {
      await processarEmail(msg);

      // Delay de 3 segundos entre emails
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Erro no gmail-reader:", error);
    res.status(500).json({ error: "Erro no gmail-reader" });
  }
}

async function obterEmails(gmail) {
  const res = await gmail.users.messages.list({
    userId: "me",
    q: "is:unread"
  });

  return res.data.messages || [];
}

async function processarEmail(msg) {
  await axios.post(
    `${process.env.VERCEL_URL}/api/autoresponder`,
    { id: msg.id }
  );
}
