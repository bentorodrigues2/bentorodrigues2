import axios from "axios";
import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GMAIL_CLIENT_EMAIL,
        private_key: process.env.GMAIL_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://mail.google.com/"],
    });

    const gmail = google.gmail({ version: "v1", auth });

    const messages = await obterEmails(gmail);

    for (const msg of messages) {
      await processarEmail(msg);
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
    q: "is:unread",
  });

  return res.data.messages || [];
}

async function processarEmail(msg) {
  await axios.post(
    `${process.env.VERCEL_URL}/api/autoresponder`,
    { id: msg.id }
  );
}
