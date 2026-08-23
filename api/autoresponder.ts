import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const EMAIL_API_KEY = process.env.EMAIL_PROVIDER_API_KEY!;
    const FROM = process.env.EMAIL_FROM_ADDRESS!;
    const REPLY_TO = process.env.EMAIL_REPLY_TO!;

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { from, to, subject, text } = req.body;

    const { data, error } = await supabase
      .from('mensagens_recebidas')
      .insert({
        remetente_email: from,
        destinatario_email: to,
        assunto: subject,
        corpo_texto: text,
        status_resposta: 'PENDENTE'
      })
      .select()
      .single();

    if (error) throw error;

    const autoresp = await fetch(${SUPABASE_URL}/functions/v1/autoresponder-ia, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: Bearer 
      },
      body: JSON.stringify({
        id_mensagem: data.id,
        texto: text,
        remetente: from
      })
    });

    const respostaIA = await autoresp.json();

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: Bearer ${SERVICE_ROLE},
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM,
        to: from,
        reply_to: REPLY_TO,
        subject: Re: ${subject},
        text: respostaIA.resposta
      })
    });

    await supabase
      .from('mensagens_recebidas')
      .update({
        status_resposta: 'RESPONDIDO_IA',
        resposta_gerada: respostaIA.resposta,
        data_resposta: new Date(),
        remetente_resposta_utilizado: FROM
      })
      .eq('id', data.id);

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

