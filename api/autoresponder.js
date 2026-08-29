import { Resend } from 'resend';

import comprovativo from './email/templates/comprovativo.js';
import ocorrencia from './email/templates/ocorrencia.js';
import geral from './email/templates/geral.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tipo, dados } = req.body;

    let html;

    switch (tipo) {
      case 'COMPROVATIVO_PAGAMENTO':
        html = comprovativo(dados);
        break;

      case 'OCORRENCIA_AVARIA':
        html = ocorrencia(dados);
        break;

      default:
        html = geral(dados);
        break;
    }

    const data = await resend.emails.send({
      from: 'no-reply@condomanagerai.com',
      to: dados.email,
      subject: dados.assuntoOriginal || 'Condomínio',
      html,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error });
  }
}
