import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const CONDOMANAGER_API_SECRET = process.env.CONDOMANAGER_API_SECRET!;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

type Documento = {
  nome: string;
  mimeType: string;
  base64: string;
};

type Payload = {
  email: {
    from: string;
    to: string;
    subject: string;
    messageId?: string;
  };
  predioId: string;
  documentos: Documento[];
  secret?: string;
};

async function reconhecerDocumento(doc: Documento) {
  const res = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              data: doc.base64,
              mimeType: doc.mimeType,
            },
          },
          {
            text: "Analisa este documento (recibo, fatura, extrato bancário, contrato, etc.) e devolve JSON estruturado."
          }
        ],
      },
    ],
  });

  return res.response.text();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body as Payload;

    if (!body || !body.predioId || !body.documentos?.length) {
      return res.status(400).json({ error: 'Payload inválido" });
    }

    if (!body.secret || body.secret !== CONDOMANAGER_API_SECRET) {
      return res.status(401).json({ error: 'API secret inválida' });
    }

    const resultados = [];
    for (const doc of body.documentos) {
      const resultado = await reconhecerDocumento(doc);
      resultados.push({
        nome: doc.nome,
        mimeType: doc.mimeType,
        resultado,
      });
    }

    const { error } = await supabase
      .from('documentos')
      .insert({
        predio_id: body.predioId,
        email_from: body.email.from,
        email_to: body.email.to,
        email_subject: body.email.subject,
        documentos: resultados,
      });

    if (error) {
      console.error('Erro Supabase:', error);
      return res.status(500).json({ error: 'Erro ao gravar no Supabase' });
    }

    return res.status(200).json({
      success: true,
      predioId: body.predioId,
      documentosReconhecidos: resultados,
      email: body.email,
    });
  } catch (e: any) {
    console.error('Erro em /api/reconhecer-documentos:', e);
    return res.status(500).json({ error: 'Erro interno no reconhecimento' });
  }
}
