import Imap from 'imap';
import { simpleParser } from 'mailparser';

const IMAP_HOST = process.env.GMAIL_IMAP_HOST || 'imap.gmail.com';
const IMAP_USER = process.env.GMAIL_IMAP_USER;      // ex: condomanagerai@gmail.com
const IMAP_PASS = process.env.GMAIL_IMAP_PASS;      // App Password

function classifyEmail(body) {
  const text = body.toLowerCase();

  if (text.includes('comprovativo') || text.includes('iban') || text.includes('mbway')) {
    return 'COMPROVATIVO_PAGAMENTO';
  }

  if (text.includes('avaria') || text.includes('elevador') || text.includes('infiltração') || text.includes('portão')) {
    return 'OCORRENCIA_AVARIA';
  }

  return 'GERAL';
}

async function callAutoresponder(tipo, dados) {
  const res = await fetch(`${process.env.VERCEL_URL || ''}/api/autoresponder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo, dados }),
  });

  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const imap = new Imap({
    user: IMAP_USER,
    password: IMAP_PASS,
    host: IMAP_HOST,
    port: 993,
    tls: true,
  });

  imap.once('ready', () => {
    imap.openBox('INBOX', false, (err) => {
      if (err) {
        imap.end();
        return res.status(500).json({ error: 'IMAP openBox error' });
      }

      imap.search(['UNSEEN'], (err, results) => {
        if (err || !results || results.length === 0) {
          imap.end();
          return res.status(200).json({ success: true, processed: 0 });
        }

        const f = imap.fetch(results, { bodies: '' });

        let processed = 0;

        f.on('message', (msg) => {
          msg.on('body', (stream) => {
            simpleParser(stream, async (err, parsed) => {
              if (err) return;

              const from = parsed.from?.text || '';
              const emailMatch = from.match(/<(.+?)>/);
              const email = emailMatch ? emailMatch[1] : from;

              const subject = parsed.subject || '';
              const body = parsed.text || '';

              const tipo = classifyEmail(body);

              const dados = {
                nome: email,
                email,
                assuntoOriginal: subject,
                fracao: '',
                nomeFicheiro: '',
              };

              try {
                await callAutoresponder(tipo, dados);
                processed++;
              } catch (e) {
                // silencioso
              }
            });
          });

          msg.once('attributes', (attrs) => {
            const { uid } = attrs;
            imap.addFlags(uid, '\\Seen', () => {});
          });
        });

        f.once('end', () => {
          imap.end();
          return res.status(200).json({ success: true, processed });
        });
      });
    });
  });

  imap.once('error', (err) => {
    return res.status(500).json({ error: 'IMAP error', detail: err.message });
  });

  imap.connect();
}
