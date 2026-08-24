import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
});

export interface AnexoProcessado {
  nome: string;
  mimeType: string;
  base64Data: string;
}

export interface AnaliseDocumentoIA {
  tipoDocumento: 'COMPROVATIVO_PAGAMENTO' | 'FATURA_DESPESA' | 'OCORRENCIA_FOTO' | 'DOCUMENTO_GERAL';
  identificacaoFracao?: string;
  valorDetetado?: number;
  ibanOrigem?: string;
  dataDocumento?: string;
  descricaoResumo: string;
  urgencia?: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
}

export async function analisarAnexoComGemini(
  anexo: AnexoProcessado,
  contextoPredio: string
): Promise<AnaliseDocumentoIA> {

  const promptSistema = \
És o Auditor Documental do condomínio \.
Analisa o anexo e devolve JSON com:
{
"tipoDocumento": "...",
"identificacaoFracao": "...",
"valorDetetado": ...,
"ibanOrigem": "...",
"dataDocumento": "...",
"descricaoResumo": "...",
"urgencia": "..."
}
\;

  const base64Limpo = anexo.base64Data.replace(/^data:.*;base64,/, '');

  const inlineDataPart = {
    inlineData: {
      data: base64Limpo,
      mimeType: anexo.mimeType
    }
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          inlineDataPart,
          { text: 'Analisa este anexo e devolve JSON.' }
        ]
      }
    ],
    config: {
      systemInstruction: promptSistema,
      responseMimeType: 'application/json',
      temperature: 0.1
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch {
    return {
      tipoDocumento: 'DOCUMENTO_GERAL',
      descricaoResumo: 'Documento recebido e arquivado para validação manual.'
    };
  }
}
