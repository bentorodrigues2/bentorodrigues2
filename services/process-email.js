export default async function handler(req, res) {
  try {
    const { from, subject, body } = req.body;

    // 1. Construir o texto para enviar ao AI Studio
    const input = JSON.stringify({
      from,
      subject,
      body
    });

    // 2. Chamar o AI Studio (Gemini 3)
    const aiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=" + process.env.AI_STUDIO_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: input }]
            }
          ]
        })
      }
    );

    const data = await aiResponse.json();

    // 3. Extrair JSON estruturado devolvido pelo AI Studio
    const jsonText = data.candidates[0].content.parts[0].text;
    const emailData = JSON.parse(jsonText);

    // 4. Guardar no Supabase
    const supabaseRes = await fetch(process.env.SUPABASE_URL + "/rest/v1/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": process.env.SUPABASE_SERVICE_ROLE,
        "Authorization": "Bearer " + process.env.SUPABASE_SERVICE_ROLE
      },
      body: JSON.stringify(emailData)
    });

    // 5. Enviar resposta automática ao condómino
    await fetch(process.env.MAIL_API_URL + "/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: emailData.from,
        subject: emailData.subject,
        body: emailData.resposta_sugerida
      })
    });

    // 6. Devolver status ao PowerShell
    res.status(200).json({
      status: "ok",
      autoresponder: "sent",
      saved: supabaseRes.status === 201
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no processamento do email" });
  }
}

