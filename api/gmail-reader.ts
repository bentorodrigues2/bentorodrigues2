import { google } from "googleapis";
import axios from "axios";

export default async function handler(req, res) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_OAUTH_CLIENT_ID,
      process.env.GMAIL_OAUTH_CLIENT_SECRET,
      process.env.GMAIL_OAUTH_REDIRECT
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // ⚠️ Reduzido para evitar 429 no Gemini
    const list = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread",
      maxResults: 1,
    });

    const messages = list.data.messages || [];

    if (messages.length === 0) {
      return res.status(200).json({ ok: true, total: 0 });
    }

    const processed = [];

    for (const msg of messages) {
      const full = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "full",
      });

      const headers = full.data.payload.headers || [];
      const get = (name) =>
        headers.find((h) => h.name === name)?.value || "";

      const bodyPart =
        full.data.payload.parts?.find((p) => p.mimeType === "text/plain") ??
        full.data.payload;

      const bodyData = bodyPart?.body?.data || "";
      const body = bodyData
        ? Buffer.from(bodyData, "base64").toString("utf8")
        : "";

      const email = {
        id: msg.id,
        from: get("From"),
        subject: get("Subject"),
        date: get("Date"),
        snippet: full.data.snippet,
        body,
      };

      // ⚠️ Chamada ao AI Studio
      const aiResponse = await axios.post(
        `${process.env.APP_BASE_URL}/api/ai-studio-router`,
        { email }
      );

      const reaction = aiResponse.data;

      // ⚠️ Se o AI Studio pedir resposta → envia email
      if (reaction?.sendEmail) {
        await axios.post(
          `${process.env.APP_BASE_URL}/api/autoresponder`,
          {
            to: email.from,
            subject: reaction.subject,
            body: reaction.body,
          }
        );
      }

      // ⚠️ Marca como lido → evita processar o mesmo email infinitamente
      await gmail.users.messages.modify({
        userId: "me",
        id: msg.id,
        requestBody: {
          removeLabelIds: ["UNREAD"],
        },
      });

      processed.push({ email, reaction });
    }

    return res.status(200).json({
      ok: true,
      total: processed.length,
      processed,
    });
  } catch (e) {
    console.error("Erro ao ler emails:", e);
    return res.status(500).json({ erro: "Erro interno ao ler emails" });
  }
}
