import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  try {
    const { to, subject, body } = req.body;

    await resend.emails.send({
      from: "Condomínio <no-reply@bentorodrigues2.pt>",
      to,
      subject,
      html: body,
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("Erro ao enviar email:", e);
    return res.status(500).json({ erro: "Erro ao enviar email" });
  }
}
