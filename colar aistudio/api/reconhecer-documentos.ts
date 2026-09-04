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
    const { documentos, fileBase64, mimeType, nome } = req.body || {};

    const docs = Array.isArray(documentos)
      ? documentos
      : fileBase64
      ? [{ base64: fileBase64, mimeType: mimeType || "application/pdf", nome: nome || "documento.pdf" }]
      : [];

    if (!docs.length) {
      return res.status(400).json({ error: "Nenhum documento fornecido." });
    }

    const ai = getAI();
    const contents: any[] = [
      "Analisa o(s) documento(s) em anexo do condomínio e extrai as informações estruturadas em JSON: tipo, entidade emissora, NIF, valor total, valor do IVA, data e IBAN."
    ];

    for (const doc of docs) {
      if (doc.base64) {
        const cleanBase64 = doc.base64.replace(/^data:[^;]+;base64,/, "");
        contents.push({
          inlineData: {
            mimeType: doc.mimeType || "application/pdf",
            data: cleanBase64,
          },
        });
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.status(200).json({
      success: true,
      documentosProcessados: docs.length,
      resultado: parsed,
    });
  } catch (error: any) {
    console.error("Erro no reconhecimento de documentos:", error);
    return res.status(500).json({
      error: error.message || "Erro no processamento de documentos.",
    });
  }
}
