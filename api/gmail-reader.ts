export const config = {
  runtime: "nodejs"
};

import { ImapFlow } from "imapflow";
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  let client;
  let lock;

  try {
    client = new ImapFlow({
      host: "imap.gmail.com",
      port: 993,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await client.connect();
    lock = await client.getMailboxLock("INBOX");

    const searchResult = await client.search({ seen: false });

    if (!searchResult || searchResult.length === 0) {
      lock.release();
      await client.logout();
      return res.status(200).json({ status: "no-new-emails" });
    }

    for (const seq of searchResult) {
      const msg = await client.fetchOne(seq, { envelope: true });

      if (!msg || !msg.envelope) continue;

      const from = msg.envelope.from?.[0]?.address || "";
      const fromName = msg.envelope.from?.[0]?.name || "Condómino";
      const to = msg.envelope.to?.[0]?.address || "";
      const subject = msg.envelope.subject || "Sem Assunto";

      if (!from) continue;

      const corpoResposta = `Estimado(a) ${fromName},

Confirmamos a receção do seu e-mail com o assunto: "${subject}".

A sua mensagem foi registada no sistema de gestão do condomínio e será analisada com a maior brevidade possível pela Administração.

Com os melhores cumprimentos,
Administração do Condomínio`;

      await axios.post(
        "https://bentorodrigues2.vercel.app/api/autoresponder",
        {
          aiResponse: {
            respostaAutomaticaSugerida: {
              assunto: `Re: ${subject} [Confirmado]`,
              corpoTexto: corpoResposta
            }
          },
          email: {
            from, // condómino
            to    // condomínio
          }
        }
      );

      await client.messageFlagsAdd(seq, ["\\Seen"]);
    }

    lock.release();
    await client.logout();

    res.status(200).json({ status: "ok", emailsProcessados: searchResult.length });
  } catch (error) {
    if (lock) lock.release();
    if (client) await client.logout().catch(() => {});
    console.error("Erro no gmail-reader:", error);
    res.status(500).json({ error: "Erro no gmail-reader", detalhe: error.message });
  }
}
