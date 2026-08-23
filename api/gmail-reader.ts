import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GMAIL_CLIENT_EMAIL,
        private_key: process.env.GMAIL_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
    });

    const gmail = google.gmail({ version: 'v1', auth });

    const messages = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
    });

    if (!messages.data.messages) {
      return res.status(200).json({ ok: true, msg: 'Nenhum email novo.' });
    }

    for (const msg of messages.data.messages) {
      const full = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
      });

      const parts = full.data.payload.parts || [];
      const body = parts[0]?.body?.data
        ? Buffer.from(parts[0].body.data, 'base64').toString('utf8')
        : '';

      const headers = full.data.payload.headers;
      const from = headers.find(h => h.name === 'From')?.value || '';
      const subject = headers.find(h => h.name === 'Subject')?.value || '';

      await fetch(${process.env.VERCEL_URL}/api/autoresponder, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to: process.env.EMAIL_FROM_ADDRESS,
          subject,
          text: body,
        }),
      });

      await gmail.users.messages.modify({
        userId: 'me',
        id: msg.id,
        resource: { removeLabelIds: ['UNREAD'] },
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

