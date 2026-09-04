import { Fracao, Aviso, ExtratoTransacao } from "../types";

/**
 * Normalizes text for robust matching (removes accents, lowercase, extra spaces).
 */
export function normalizeBankText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parses OFX (Open Financial Exchange) format commonly exported by Portuguese banks.
 */
export function parseOFXContent(ofxText: string): Array<{
  data: string;
  tipo: "CREDITO" | "DEBITO";
  valor: number;
  descricao: string;
  fitid?: string;
  memo?: string;
}> {
  const transactions: Array<{
    data: string;
    tipo: "CREDITO" | "DEBITO";
    valor: number;
    descricao: string;
    fitid?: string;
    memo?: string;
  }> = [];

  // Match all <STMTTRN> blocks
  const stmttrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  let match: RegExpExecArray | null;

  while ((match = stmttrnRegex.exec(ofxText)) !== null) {
    const block = match[1];

    const trntypeMatch = block.match(/<TRNTYPE>([^\r\n<]+)/i);
    const dtpostedMatch = block.match(/<DTPOSTED>([^\r\n<]+)/i);
    const trnamtMatch = block.match(/<TRNAMT>([^\r\n<]+)/i);
    const fitidMatch = block.match(/<FITID>([^\r\n<]+)/i);
    const nameMatch = block.match(/<NAME>([^\r\n<]+)/i);
    const memoMatch = block.match(/<MEMO>([^\r\n<]+)/i);

    const rawAmt = trnamtMatch ? parseFloat(trnamtMatch[1].trim().replace(",", ".")) : 0;
    const rawDate = dtpostedMatch ? dtpostedMatch[1].trim() : "";
    
    // Parse OFX date format YYYYMMDD or YYYYMMDDHHMMSS
    let isoDate = new Date().toISOString().split("T")[0];
    if (rawDate.length >= 8) {
      const yyyy = rawDate.substring(0, 4);
      const mm = rawDate.substring(4, 6);
      const dd = rawDate.substring(6, 8);
      isoDate = `${yyyy}-${mm}-${dd}`;
    }

    const name = nameMatch ? nameMatch[1].trim() : "";
    const memo = memoMatch ? memoMatch[1].trim() : "";
    const fullDesc = [name, memo].filter(Boolean).join(" - ") || "Transação Bancária OFX";
    const tipo = rawAmt >= 0 ? "CREDITO" : "DEBITO";

    transactions.push({
      data: isoDate,
      tipo,
      valor: Math.abs(rawAmt),
      descricao: fullDesc,
      fitid: fitidMatch ? fitidMatch[1].trim() : undefined,
      memo
    });
  }

  return transactions;
}

/**
 * Parses CSV/TXT bank exports (supporting delimiter ; , \t, European amounts 1.250,50€ or 45.00).
 */
export function parseCSVContent(csvText: string): Array<{
  data: string;
  tipo: "CREDITO" | "DEBITO";
  valor: number;
  descricao: string;
}> {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  // Determine delimiter from first few lines
  const firstLine = lines[0];
  const semiCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;
  
  const delimiter = semiCount >= commaCount && semiCount >= tabCount ? ";" : tabCount >= commaCount ? "\t" : ",";

  const transactions: Array<{
    data: string;
    tipo: "CREDITO" | "DEBITO";
    valor: number;
    descricao: string;
  }> = [];

  // Skip headers or introductory lines
  let startIdx = 0;
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const l = lines[i].toLowerCase();
    if (l.includes("data") || l.includes("descri") || l.includes("movimento") || l.includes("valor") || l.includes("montante") || l.includes("credito")) {
      startIdx = i + 1;
      break;
    }
  }

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    if (!line || line.startsWith("#") || line.toLowerCase().includes("saldo final") || line.toLowerCase().includes("saldo inicial")) continue;

    const cols = line.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ""));
    if (cols.length < 2) continue;

    // Detect date column (e.g. DD-MM-YYYY, YYYY-MM-DD, DD/MM/YYYY)
    let dateStr = "";
    let descStr = "";
    let valor = 0;
    let tipo: "CREDITO" | "DEBITO" = "CREDITO";

    for (let c = 0; c < cols.length; c++) {
      const colVal = cols[c];
      
      // Match dates like 02/05/2026 or 2026-05-02 or 02-05-2026
      const dateMatch = colVal.match(/^(\d{1,4})[/-](\d{1,2})[/-](\d{2,4})$/);
      if (dateMatch && !dateStr) {
        if (dateMatch[1].length === 4) {
          dateStr = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
        } else {
          dateStr = `${dateMatch[3]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`;
        }
        continue;
      }

      // Match numeric amounts like 46,13 or -145.50 or 46.13 EUR
      const cleanNumStr = colVal.replace(/EUR|€/gi, "").replace(/\s/g, "").replace(/\.(?=\d{3})/g, "").replace(",", ".");
      const parsedNum = parseFloat(cleanNumStr);
      if (!isNaN(parsedNum) && (cleanNumStr.includes(".") || Math.abs(parsedNum) > 0.01) && valor === 0) {
        valor = Math.abs(parsedNum);
        tipo = parsedNum < 0 ? "DEBITO" : "CREDITO";
        continue;
      }

      // Collect textual descriptions
      if (colVal.length > descStr.length && isNaN(Number(colVal))) {
        descStr = colVal;
      }
    }

    if (dateStr && valor > 0) {
      transactions.push({
        data: dateStr,
        tipo,
        valor,
        descricao: descStr || "Movimento Bancário"
      });
    }
  }

  return transactions;
}

/**
 * Intelligent Matching Engine:
 * Cross-references raw bank transactions against pending condo notices (Avisos) and Fractions.
 */
export function matchBankTransactions(
  rawTransactions: Array<{
    data: string;
    tipo: "CREDITO" | "DEBITO";
    valor: number;
    descricao: string;
  }>,
  fracoes: Fracao[],
  avisosPendentes: Aviso[]
): ExtratoTransacao[] {
  return rawTransactions.map((tx, idx) => {
    const normDesc = normalizeBankText(tx.descricao);
    let matchedFracao: Fracao | null = null;
    let confidence = 0;
    let matchReason = "";
    let associatedAvisos: string[] = [];

    // Only credits are quotas payments
    if (tx.tipo === "CREDITO") {
      // 1. Look for direct fraction name or code (e.g. "rc esq", "3 dto", "fracao a", "rb23e")
      for (const f of fracoes) {
        const normFrac = normalizeBankText(f.fracao_nome);
        const normPiso = normalizeBankText(f.piso);
        const normOwner = normalizeBankText(f.proprietario?.nome || "");
        const ownerFirstLast = normOwner.split(" ").filter(w => w.length > 2);

        // Check exact fraction code match (e.g., "3º Dto" -> "3 dto", "RC Esq" -> "rc esq")
        const hasFracName = normFrac.length > 0 && normDesc.includes(normFrac);
        const hasPiso = normPiso.length > 0 && normDesc.includes(normPiso);
        
        // Check owner name matches
        const hasOwnerName = ownerFirstLast.length >= 2 && ownerFirstLast.every(namePart => normDesc.includes(namePart));
        const hasOwnerPartial = ownerFirstLast.some(namePart => normDesc.includes(namePart));

        // Find pending avisos for this fraction
        const fracaoAvisos = avisosPendentes.filter(a => a.id_fracao === f.id_fracao);
        const totalAvisosValor = fracaoAvisos.reduce((sum, a) => sum + a.valor, 0);
        const exactAmountMatch = fracaoAvisos.some(a => Math.abs(a.valor - tx.valor) < 0.05) || Math.abs(totalAvisosValor - tx.valor) < 0.05;

        let curConfidence = 0;
        let curReason = "";

        if ((hasFracName || hasPiso) && exactAmountMatch) {
          curConfidence = 99;
          curReason = `Correspondência total de Fração (${f.fracao_nome}) e Valor exato da quota (${tx.valor.toFixed(2)}€).`;
        } else if (hasOwnerName && exactAmountMatch) {
          curConfidence = 95;
          curReason = `Nome do Proprietário (${f.proprietario?.nome}) e Valor da quota (${tx.valor.toFixed(2)}€) correspondentes.`;
        } else if ((hasFracName || hasPiso) && !exactAmountMatch) {
          curConfidence = 80;
          curReason = `Fração (${f.fracao_nome}) identificada no descritivo. Valor com ligeira variação ou pagamento múltiplo.`;
        } else if (hasOwnerPartial && exactAmountMatch) {
          curConfidence = 85;
          curReason = `Apelido do condómino e valor da quota (${tx.valor.toFixed(2)}€) coincidentes.`;
        } else if (exactAmountMatch && fracaoAvisos.length > 0) {
          curConfidence = 65;
          curReason = `Valor idêntico à quota pendente da Fração ${f.fracao_nome}, sem referência textual explícita.`;
        }

        if (curConfidence > confidence) {
          confidence = curConfidence;
          matchedFracao = f;
          matchReason = curReason;
          associatedAvisos = fracaoAvisos.map(a => a.id_aviso);
        }
      }
    } else {
      confidence = 50;
      matchReason = "Movimento de Débito (Despesa bancária ou pagamento a fornecedor).";
    }

    return {
      id_transacao: `tx-bank-${idx + 1}-${Date.now().toString(36)}`,
      data: tx.data,
      tipo: tx.tipo,
      valor: tx.valor,
      descricao: tx.descricao,
      fracao_sugerida_id: matchedFracao?.id_fracao || null,
      fracao_sugerida_nome: matchedFracao?.fracao_nome || null,
      confianca_percent: confidence,
      motivo_correspondencia: matchReason || "Pendente de validação manual pela administração",
      avisos_pendentes_ids: associatedAvisos,
      estado_conciliacao: "PENDENTE"
    };
  });
}
