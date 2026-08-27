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

    // Enviar email automático
    await sendEmail({
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
