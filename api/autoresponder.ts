import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const { aiResponse, email } = req.body || {};

    if (!aiResponse || !email || !email.from) {
      return res.status(400).json({ erro: "Falta dados obrigatórios (email.from ou aiResponse)" });
    }

    const resposta = aiResponse.respostaAutomaticaSugerida;

    if (!resposta || !resposta.corpoTexto) {
      return res.status(200).json({ enviado: false, motivo: "Sem texto de resposta sugerido" });
    }

    const safeHtml = String(resposta.corpoTexto)
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br/>");

    const layoutHtml = `
      <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; max-width: 600px;">
        <p>${safeHtml}</p>
        <hr style="margin-top: 24px; margin-bottom: 12px; border: 0; border-top: 1px solid #e2e8f0;" />
        <p style="font-size: 11px; color: #94a3b8;">
          Mensagem automática de confirmação enviada pelo sistema <strong>CondoManager AI</strong>.
        </p>
      </div>
    `;

    const sender = process.env.RESEND_FROM_EMAIL || "Condomínio <onboarding@resend.dev>";

    const result = await resend.emails.send({
      from: sender,
      to: email.from, // condómino
      subject: resposta.assunto || "Confirmação de Receção",
      html: layoutHtml,
      text: resposta.corpoTexto
    });

    console.log("✅ E-mail enviado com sucesso:", result);
    return res.status(200).json({ enviado: true, result });

  } catch (e) {
    console.error("Erro autoresponder:", e);
    return res.status(500).json({ erro: "Erro autoresponder", detalhe: e.message });
  }
}
