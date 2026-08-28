import { ImapFlow } from "imapflow";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  try {
    // 1. Ligação IMAP para ler emails
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

    // Abrir inbox
    let lock = await client.getMailboxLock("INBOX");

    // Procurar emails não lidos
    const messages = await client.search({ seen: false });

    for (const seq of messages) {
      const msg = await client.fetchOne(seq, { envelope: true });

      // Enviar resposta automática
      await enviarRespostaAutomatica(msg.envelope.from[0].address);

      // Marca como lido
      await client.messageFlagsAdd(seq, ["\\Seen"]);
    }

    lock.release();
    await client.logout();

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Erro no gmail-reader:", error);
    res.status(500).json({ error: "Erro no gmail-reader" });
  }
}

// 2. Enviar resposta automática
async function enviarRespostaAutomatica(destino) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"CondoManager AI" <${process.env.GMAIL_USER}>`,
    to: destino,
    subject: "Recebemos o seu email",
    text: "O seu email foi recebido e está a ser processado automaticamente.",
  });
}
