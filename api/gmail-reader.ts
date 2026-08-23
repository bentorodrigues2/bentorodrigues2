import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const {
      GMAIL_CLIENT_ID,
      GMAIL_CLIENT_SECRET,
      GMAIL_REFRESH_TOKEN,
      EMAIL_FROM_ADDRESS,
      VERCEL_URL
    } = process.env;

    if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) {
      return res.status(500).json({ error: "Missing Gmail OAuth credentials" });
    }

    // OAuth2
    const oauth2Client = new google.auth.OAuth2(
      GMAIL_CLIENT_ID,
      GMAIL_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
      refresh_token: GMAIL_REFRESH_TOKEN
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Buscar emails não lidos
    const messages = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread"
    });

    if (!messages.data.messages || messages.data.messages.length === 0) {
      return res.status(200).json({ ok: true, msg: "Nenhum email novo." });
    }

    for (const msg of messages.data.messages) {
      const full = await gmail.users.messages.get({
        userId: "me",
        id: msg.id
      });

      const payload = full.data.payload;

      // Extrair corpo do email
      let body = "";
      if (payload.parts) {
        const part = payload.parts.find(p => p.mimeType === "text/plain");
        if (part?.body?.data) {
          body = Buffer.from(part.body.data, "base64").toString("utf8");
        }
      } else if (payload.body?.data) {
        body = Buffer.from(payload.body.data, "base64").toString("utf8");
      }

      // Extrair headers
      const headers = payload.headers || [];
      const from = headers.find(h => h.name === "From")?.value || "";
      const subject = headers.find(h => h.name === "Subject")?.value || "";

      // Chamar autoresponder
      await fetch(`${VERCEL_URL}/api/autoresponder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: EMAIL_FROM_ADDRESS,
          subject,
          text: body
        })
      });

      // Marcar como lido
      await gmail.users.messages.modify({
        userId: "me",
        id: msg.id,
        resource: { removeLabelIds: ["UNREAD"] }
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("gmail-reader error:", err);
    return res.status(500).json({ error: err.message });
  }
}
