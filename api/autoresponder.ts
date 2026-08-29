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

    // ⭐ Limpar o corpo do email para HTML válido
    const safeHtml = resposta.corpoTexto
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br/>");

    await resend.emails.send({
      from: "Condomínio <no-reply@condomanager.ai>",
      to: email.to,   // ← ENVIA PARA TI
      subject: resposta.assunto,
      html: safeHtml
    });

    return res.status(200).json({ enviado: true });

  } catch (e) {
    console.error("Erro autoresponder:", e);
    return res.status(500).json({ erro: "Erro autoresponder", detalhe: e.message });
  }
}
