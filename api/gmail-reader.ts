import type { VercelRequest, VercelResponse } from "@vercel/node";
import { google } from "googleapis";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      return res.status(500).json({ error: "Missing Gmail OAuth credentials" });
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // 1. List unread messages
    const listRes = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread"
    });

    const messages = listRes.data.messages || [];

    if (messages.length === 0) {
      return res.status(200).json({ ok: true, msg: "Nenhum email novo." });
    }

    const msg = messages[0];

    // 2. Get message details
    const msgRes = await gmail.users.messages.get({
      userId: "me",
      id: msg.id!
    });

    const payload = msgRes.data.payload;
    const headers = payload?.headers || [];

    const subject = headers.find((h) => h.name === "Subject")?.value || "";
    const from = headers.find((h) => h.name === "From")?.value || "";
    const body =
      payload?.parts?.[0]?.body?.data
        ? Buffer.from(payload.parts[0].body.data, "base64").toString("utf8")
        : "";

    // 3. Mark email as read
    await gmail.users.messages.modify({
      userId: "me",
      id: msg.id!,
      requestBody: {
        removeLabelIds: ["UNREAD"]
      }
    });

    return res.status(200).json({ ok: true, subject, from, body });

  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
