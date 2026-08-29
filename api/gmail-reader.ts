export const config = {
  runtime: "nodejs"
};

import { ImapFlow } from "imapflow";
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const client = new ImapFlow({
      host: "imap.gmail.com",
      port: 993,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await client.connect();

    let lock = await client.getMailboxLock("INBOX");

    // ⭐ Processar apenas emails NÃO lidos
    const searchResult = await client.search({ seen: false });

    if (!searchResult || searchResult.length === 0) {
      lock.release();
      await client.logout();
      return res.status(200).json({ status: "no-new-emails" });
    }

    for (const seq of searchResult) {
      const msg = await client.fetchOne(seq, { envelope: true, source: true, bodyStructure: true });

      if (!msg || !msg.envelope) continue;

      const from = msg.envelope.from?.[0]?.address || "";
      const to = msg.envelope.to?.[0]?.address || "";
      const subject = msg.envelope.subject || "";

      // ⭐ Snippet seguro (não inclui anexos nem HTML perigoso)
      const snippet = msg.source?.toString().slice(0, 500) || "";

      // ⭐ Metadados dos anexos (sem conteúdo)
      const attachments =
        msg.bodyStructure?.childNodes
          ?.filter(n => n.disposition?.type === "attachment")
          ?.map(n => ({
            filename: n.disposition?.params?.filename || "anexo",
            size: n.size || 0,
            mime: `${n.type}/${n.subtype}`
          })) || [];

      // ⭐ Enviar apenas dados seguros para o autoresponder
      await axios.post(
        "https://bentorodrigues2.vercel.app/api/autoresponder",
        {
          aiResponse: {
            respostaAutomaticaSugerida: {
              assunto: subject,
              corpoTexto: snippet,
              anexos: attachments
            }
          },
          email: {
            from,
            to
          }
        }
      );

      // Marcar como lido
      await client.messageFlagsAdd(seq, ["\\Seen"]);
    }

    // ⭐ Limpar lixo IMAP (emails apagados no Gmail Web)
    await client.expunge();

    lock.release();
    await client.logout();

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Erro no gmail-reader:", error);
    res.status(500).json({ error: "Erro no gmail-reader" });
  }
}
