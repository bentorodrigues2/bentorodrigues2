export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = req.body;

    // Estrutura típica do webhook da Resend:
    // event.type → "email.delivered", "email.opened", "email.clicked"
    // event.data → { to, from, subject, messageId, timestamp }

    console.log('Webhook Resend recebido:', event.type, event.data);

    // Aqui podes guardar logs no Supabase se quiseres:
    // await supabase.from('email_logs').insert({
    //   tipo: event.type,
    //   email: event.data.to,
    //   assunto: event.data.subject,
    //   timestamp: event.data.timestamp
    // });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro no webhook Resend:', error);
    return res.status(500).json({ success: false, error });
  }
}
