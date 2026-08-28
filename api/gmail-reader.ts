import { ImapFlow } from "imapflow";
import axios from "axios";

export default async function handler(req, res) {
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

    // ⭐ A tua conta usa "All Mail" sem prefixo
    let lock = await client.getMailboxLock("All Mail");

    const searchResult = await client.search({ seen: false });

    if (!searchResult || searchResult.length === 0) {
      lock.release();
      await client.logout();
      return res.status(200).json({ status: "no-unread-emails" });
    }

    for (const seq of searchResult) {
      const msg = await client.fetchOne(seq, { envelope: true, source: true });

      if (!msg || !msg.envelope) {
        continue;
      }

      const from = msg.envelope.from?.[0]?.address || "";
      const subject = msg.envelope.subject || "";
      const raw = msg.source?.toString() || "";

      await axios.post(
        `https://${process.env.VERCEL_URL}/api/autoresponder`,
        { from, subject, raw }
      );

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
