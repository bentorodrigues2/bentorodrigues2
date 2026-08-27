import { google } from "googleapis";
import axios from "axios";

function extractBody(payload) {
  // 1. Se existir text/plain direto
  const plain = payload.parts?.find(p => p.mimeType === "text/plain");
  if (plain?.body?.data) {
    return Buffer.from(plain.body.data, "base64").toString("utf8");
  }

  // 2. Se existir text/html direto
  const html = payload.parts?.find(p => p.mimeType === "text/html");
  if (html?.body?.data) {
    return Buffer.from(html.body.data, "base64").toString("utf8");
  }

  // 3. Se existir multipart/alternative
  const alt = payload.parts?.find(p => p.mimeType === "multipart/alternative");
  if (alt?.parts) {
    const altPlain = alt.parts.find(p => p.mimeType === "text/plain");
    if (altPlain?.body?.data) {
      return Buffer.from(altPlain.body.data, "base64").toString("utf8");
    }

    const altHtml = alt.parts.find(p => p.mimeType === "text/html");
    if (altHtml?.body?.data) {
      return Buffer.from(altHtml.body.data, "base64").toString("utf8");
    }
  }

  // 4. Último recurso: snippet
  return payload.snippet || "";
}

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

    const list = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread",
      maxResults: 10,
    });

    const messages = list.data.messages || [];

    const baseUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;

    for (const msg of messages) { Start-Sleep -Seconds 3
      const full = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "full",
      });

      const email = {
        id: msg.id,
        from: full.data.payload.headers.find(h => h.name === "From")?.value || "",
        subject: full.data.payload.headers.find(h => h.name === "Subject")?.value || "",
        date: full.data.payload.headers.find(h => h.name === "Date")?.value || "",
        snippet: full.data.snippet || "",
        body: extractBody(full.data.payload)
      };

      const aiResponse = await axios.post(
        `${baseUrl}/api/ai-studio-router`,
        { email }
      );

      await axios.post(
        `${baseUrl}/api/autoresponder`,
        { aiResponse: aiResponse.data, email }
      );
    }

    return res.status(200).json({ ok: true });

  } catch (e) {
    console.error("Erro gmail-reader:", e);
    return res.status(500).json({ erro: "Erro gmail-reader", detalhe: e.message });
  }
}


