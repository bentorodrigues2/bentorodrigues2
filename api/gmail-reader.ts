import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function extractEmail(fromField) {
  if (!fromField) return null;
  const match = String(fromField).match(/<([^>]+)>/);
  return match ? match[1].trim() : String(fromField).trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const { aiResponse, email } = req.body || {};

    if (!aiResponse || !email) {
      return res.status(400).json({ erro: "Falta dados" });
    }

    const resposta = aiResponse.respostaAutomaticaSugerida;

    if (!resposta || !resposta.assunto || !resposta.corpoTexto) {
      return res.status(200).json({ enviado: false });
    }

    const recipientEmail = extractEmail(email.from);

    if (!recipientEmail || !recipientEmail.includes("@")) {
      return res.status(400).json({ erro: "Email inválido" });
    }

    const formattedHtml = resposta.corpoTexto.replace(/\n/g, "<br/>");

    const sender = process.env.RESEND_FROM_EMAIL || "Condomínio <onboarding@resend.dev>";

    const data = await resend.emails.send({
      from: sender,
      to: [recipientEmail],
      subject: resposta.assunto,
      html: formattedHtml,
      text: resposta.corpoTexto
    });

    return res.status(200).json({ enviado: true, id: data.id || data.data?.id });

  } catch (e) {
    console.error("Erro autoresponder:", e);
    return res.status(500).json({ erro: "Erro autoresponder", detalhe: e.message });
  }
}
