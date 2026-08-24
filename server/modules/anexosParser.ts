export function analisarAnexos(anexos: any[]) {
  const resultados = [];

  for (const anexo of anexos) {
    resultados.push({
      nome: anexo.filename,
      tipo: anexo.mimeType,
      tamanho: anexo.data?.length || 0,
    });
  }

  return resultados;
}
