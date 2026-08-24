import type { VercelRequest, VercelResponse } from "@vercel/node";
import { google } from "googleapis";
import { encaminharEmailParaAutoresponder } from "./modules/emailRouter";

// Extrair anexos
async function extrairAnexos(gmail, msgId, payload) {
  const anexos = [];

  if (!payload?.parts) return anexos;

  for (const part of payload.parts) {
    if (part.filename && part.body?.attachmentId) {
      const attachRes = await gmail.users.messages.attachments.get({
        userId: "me",
        messageId: msgId,
        id: part.body.attachmentId,
      });

      anexos.push({
        filename: part.filename,
        mimeType: part.mimeType || "application/octet-stream",
        data: attachRes.data.data,
      });
    }
  }

  return anexos;
}

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

    // Buscar emails não lidos
    const listRes = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread",
    });

    const messages = listRes.data.messages || [];

    if (messages.length === 0) {
      return res.status(200).json({ ok: true, msg: "Nenhum email novo." });
    }

    const msg = messages[0];

    // Buscar conteúdo do email
    const msgRes = await gmail.users.messages.get({
      userId: "me",
      id: msg.id!,
    });

    const payload = msgRes.data.payload;
    const anexosExtraidos = await extrairAnexos(gmail, msg.id!, payload);
    const headers = payload?.headers || [];

    const subject = headers.find((h) => h.name === "Subject")?.value || "";
    const from = headers.find((h) => h.name === "From")?.value || "";
    const body =
      payload?.parts?.[0]?.body?.data
        ? Buffer.from(payload.parts[0].body.data, "base64").toString("utf8")
        : "";

    // Marcar como lido
    await gmail.users.messages.modify({
      userId: "me",
      id: msg.id!,
      requestBody: {
        removeLabelIds: ["UNREAD"],
      },
    });

    // Enviar ao autoresponder
    await encaminharEmailParaAutoresponder(
      from,
      "bentorodrigues2@gmail.com",
      subject,
      body,
      anexosExtraidos
    );

    return res.status(200).json({ ok: true, subject, from, body });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
