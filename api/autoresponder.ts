import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const { aiResponse, email } = req.body;

    if (!aiResponse || !email) {
      return res.status(400).json({ erro: "Falta dados" });
    }

    const resposta = aiResponse.respostaAutomaticaSugerida;

    if (!resposta) {
      return res.status(200).json({ enviado: false });
    }

    // ⭐ Enviar para o destinatário correto
    const recipient = email.to;

    await resend.emails.send({
      from: "Condomínio <no-reply@condomanager.ai>",
      to: recipient,
      subject: resposta.assunto,
      html: resposta.corpoTexto
    });

    return res.status(200).json({ enviado: true });

  } catch (e) {
    console.error("Erro autoresponder:", e);
    return res.status(500).json({ erro: "Erro autoresponder", detalhe: e.message });
  }
}
