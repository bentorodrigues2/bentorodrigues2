import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

import { analisarAnexoComGemini } from '../server/modules/anexosParser';
import { arquivarEIntegrarNoSupabase } from '../server/modules/supabaseIntegrator';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Método não permitido' });

  try {
    const {
      remetenteEmail,
      destinatarioEmail,
      assunto,
      corpoTexto,
      anexos
    } = req.body;

    // 1. Identificar prédio pelo email
    const { data: predio } = await supabase
      .from('predios')
      .select('*, gestores_carteira(*)')
      .or(email_predio.eq., email_predio.eq.bentorodrigues2@gmail.com)
      .single();

    const idPredio = predio?.id_predio || 'PREDIO_PRINCIPAL';
    const nomePredio = predio?.nome || 'Condomínio';
    const gestor = predio?.gestores_carteira?.[0] || {
      nome: 'Administração',
      telefone_direto: '210 000 000'
    };

    let relatorioAnexosTexto = "";
    const resultadosProcessamento: any[] = [];

    // 2. Processar anexos
    if (Array.isArray(anexos) && anexos.length > 0) {
      for (const anexo of anexos) {
        const analise = await analisarAnexoComGemini(anexo, nomePredio);

        const { fileUrl } = await arquivarEIntegrarNoSupabase(
          idPredio,
          anexo,
          analise,
          remetenteEmail
        );

        resultadosProcessamento.push({ anexo: anexo.nome, analise, url: fileUrl });

        if (analise.tipoDocumento === 'COMPROVATIVO_PAGAMENTO') {
          relatorioAnexosTexto += \n- Comprovativo identificado (Fração: , Valor: €);
        } else if (analise.tipoDocumento === 'OCORRENCIA_FOTO') {
          relatorioAnexosTexto += \n- Fotografia de anomalia registada para intervenção.;
        } else {
          relatorioAnexosTexto += \n- Documento "" arquivado.;
        }
      }
    }

    // 3. Gerar resposta automática
    const promptResposta = 
És o Assistente Oficial da Administração do .
Gestor Responsável:  (Tel: )
E-mail do Condómino: 

Assunto: 

RESUMO DOS ANEXOS PROCESSADOS:


MENSAGEM DO CONDÓMINO:


Instruções:
1. Responde em PT-PT formal.
2. Confirma processamento de comprovativos.
3. Confirma registo de avarias.
4. Assina com nome do condomínio.
;

    const respostaGemini = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: 'Gera o e-mail formal.' }] }],
      config: { systemInstruction: promptResposta, temperature: 0.3 }
    });

    const textoFinalResposta =
      respostaGemini.text ||
      'Agradecemos o seu envio. A mensagem e os anexos foram processados com sucesso.';

    // 4. Gravar auditoria
    await supabase.from('mensagens_recebidas').insert({
      id_predio: idPredio,
      remetente_email: remetenteEmail,
      destinatario_email: destinatarioEmail || 'bentorodrigues2@gmail.com',
      assunto,
      corpo_texto: corpoTexto,
      anexos: resultadosProcessamento,
      dados_extraidos_ia: resultadosProcessamento.map(r => r.analise),
      status_resposta: 'RESPONDIDO_IA',
      resposta_gerada: textoFinalResposta,
      data_resposta: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      anexosProcessados: resultadosProcessamento.length,
      respostaGerada: textoFinalResposta,
      detalhes: resultadosProcessamento
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
