import axios from "axios";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  try {
    const { aiResponse, email } = req.body;

    if (!aiResponse || !email) {
      return res.status(400).json({ erro: "Falta dados" });
    }

    const resposta = aiResponse.respostaAutomaticaSugerida;

    if (!resposta) {
      return res.status(200).json({ enviado: false });
    }

    await resend.emails.send({
      from: "Condomínio <no-reply@condomanager.ai>",
      to: email.from,
      subject: resposta.assunto,
      html: resposta.corpoTexto
    });

    return res.status(200).json({ enviado: true });

  } catch (e) {
    console.error("Erro autoresponder:", e);
    return res.status(500).json({ erro: "Erro autoresponder", detalhe: e.message });
  }
}

