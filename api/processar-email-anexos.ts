import { GoogleGenerativeAI } from "@google/genai";
import { supabase } from "../backend/supabaseClient";

export async function processarEmailComAnexos(
  remetenteEmail: string,
  destinatarioEmail: string,
  assunto: string,
  corpoTexto: string,
  anexos: any[]
) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const modelo = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = 
Analisa o email abaixo e os anexos.
Gera:
1) Tipo de documento (comprovativo, avaria, outro)
2) Dados extraídos
3) Resposta automática formal para o condómino
;

  const respostaGemini = await modelo.generateContent([
    {
      role: "user",
      parts: [
        { text: prompt }
      ],
    },
  ]);

  const textoGerado = respostaGemini.response.text();

  await supabase.from("mensagens_recebidas").insert({
    remetente: remetenteEmail,
    destinatario: destinatarioEmail,
    assunto,
    corpo: corpoTexto,
    resposta_gerada: textoGerado,
  });

  return textoGerado;
}
// rebuild test
