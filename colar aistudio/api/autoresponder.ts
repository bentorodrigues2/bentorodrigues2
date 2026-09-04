import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY || "AIzaSy_placeholder_key";
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido. Utilize POST." });
  }

  const apiKey = (req.headers["x-api-key"] as string) || "";
  const serverSecret = process.env.CONDOMANAGER_API_SECRET;
  if (serverSecret && apiKey && apiKey !== serverSecret) {
    return res.status(401).json({ error: "Chave API não autorizada." });
  }

  try {
    const { tipo, destinatario, dados, predioNome } = req.body || {};

    const prompt = `Gera um e-mail de resposta automático para o condomínio "${predioNome || "Bento Rodrigues"}":
Tipo: ${tipo || "CONFIRMACAO_PAGAMENTO"}
Destinatário: ${destinatario || "condomino@email.pt"}
Dados relevantes: ${JSON.stringify(dados || {})}

Retorna um JSON estrito com:
{
  "assunto": "Assunto do e-mail",
  "corpoHtml": "<p>Corpo formatado em HTML</p>",
  "corpoTexto": "Corpo em texto simples",
  "anexosRecomendados": ["nome_do_anexo.pdf"]
}`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.status(200).json({
      success: true,
      autoresponder: parsed,
    });
  } catch (error: any) {
    console.error("Erro no autoresponder:", error);
    return res.status(500).json({
      error: error.message || "Erro no processamento do autoresponder.",
    });
  }
}
