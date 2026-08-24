import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "./lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const {
    remetenteEmail,
    destinatarioEmail,
    assunto,
    corpoTexto,
    anexos
  } = req.body;

  try {
    const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const modelo = client.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `
Analisa o email abaixo e os anexos.
Gera:
1) Tipo de documento (comprovativo, avaria, outro)
2) Dados extraídos
3) Resposta automática formal para o condómino

Email:
Remetente: ${remetenteEmail}
Destinatário: ${destinatarioEmail}
Assunto: ${assunto}
Corpo: ${corpoTexto}
    `;

    const respostaGemini = await modelo.generateContent(prompt);
    const textoGerado = respostaGemini.response.text();

    await supabase.from("mensagens_recebidas").insert({
      remetente: remetenteEmail,
      destinatario: destinatarioEmail,
      assunto,
      corpo: corpoTexto,
      resposta_gerada: textoGerado,
    });

    return res.status(200).json({
      sucesso: true,
      resposta: textoGerado,
    });

  } catch (erro) {
    console.error("Erro ao processar email:", erro);
    return res.status(500).json({ erro: "Erro interno ao processar email" });
  }
}