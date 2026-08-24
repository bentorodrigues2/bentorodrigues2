import { createClient } from '@supabase/supabase-js';
import { AnexoProcessado, AnaliseDocumentoIA } from './anexosParser';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function arquivarEIntegrarNoSupabase(
  idPredio: string,
  anexo: AnexoProcessado,
  analise: AnaliseDocumentoIA,
  remetenteEmail: string
) {
  const buffer = Buffer.from(
    anexo.base64Data.replace(/^data:.*;base64,/, ''),
    'base64'
  );

  const nomeFicheiroLimpo = anexo.nome.replace(/[^a-zA-Z0-9.-]/g, '_');
  const pathStorage = ${idPredio}/_;

  const { error: uploadError } = await supabase.storage
    .from('condomanager-ficheiros')
    .upload(pathStorage, buffer, {
      contentType: anexo.mimeType,
      upsert: true
    });

  if (uploadError) throw new Error(Falha no upload: );

  const { data: publicUrlData } = supabase.storage
    .from('condomanager-ficheiros')
    .getPublicUrl(pathStorage);

  const fileUrl = publicUrlData.publicUrl;
  const idDocumento = doc-;

  await supabase.from('documentos').insert({
    id_documento: idDocumento,
    id_predio: idPredio,
    titulo: anexo.nome,
    categoria:
      analise.tipoDocumento === 'COMPROVATIVO_PAGAMENTO'
        ? 'Recibos/Comprovativos'
        : analise.tipoDocumento === 'FATURA_DESPESA'
        ? 'Faturas'
        : analise.tipoDocumento === 'OCORRENCIA_FOTO'
        ? 'Vistorias/Ocorrências'
        : 'Geral',
    ano: new Date().getFullYear(),
    data_carregamento: new Date().toISOString().split('T')[0],
    ficheiro_url: fileUrl,
    mime_type: anexo.mimeType,
    visivel_condominos: true
  });

  if (analise.tipoDocumento === 'COMPROVATIVO_PAGAMENTO' && analise.valorDetetado) {
    await supabase.from('movimentos').insert({
      id_mov: mov-,
      id_predio: idPredio,
      data: analise.dataDocumento || new Date().toISOString().split('T')[0],
      tipo: 'Receita',
      categoria: 'Quotas de Condomínio',
      descricao: Pagamento recebido []: ,
      valor: analise.valorDetetado,
      forma_pagamento: 'Transferência Bancária',
      documento_suporte_url: fileUrl,
      conciliado_banco: false
    });
  }

  if (analise.tipoDocumento === 'OCORRENCIA_FOTO') {
    await supabase.from('ocorrencias').insert({
      id_ocorrencia: oco-,
      id_predio: idPredio,
      titulo: Registo de Anomalia [IA]: ,
      descricao: ${analise.descricaoResumo} (Enviado por: ),
      gravidade: analise.urgencia || 'Media',
      estado: 'Pendente',
      data_registo: new Date().toISOString(),
      fotos_urls: [fileUrl]
    });
  }

  return { idDocumento, fileUrl };
}
