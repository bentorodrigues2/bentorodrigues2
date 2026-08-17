import { jsPDF } from "jspdf";
import { LOGO_HORIZONTAL_BASE64, WATERMARK_BASE64 } from "./assets/logoBase64";

// Helper to draw subtle background watermark on PDF pages
export function addPdfWatermark(doc: jsPDF) {
  try {
    if (WATERMARK_BASE64) {
      try {
        const gState = (doc as any).GState ? new (doc as any).GState({ opacity: 0.08 }) : null;
        if (gState) (doc as any).setGState(gState);
        doc.addImage(WATERMARK_BASE64, "PNG", 45, 65, 120, 120);
        if (gState) {
          const resetState = new (doc as any).GState({ opacity: 1.0 });
          (doc as any).setGState(resetState);
        }
      } catch (e) {
        doc.addImage(WATERMARK_BASE64, "PNG", 45, 65, 120, 120);
      }
    }
  } catch (err) {
    console.warn("Watermark render notice:", err);
  }
}

// Helper to draw top-centered CondoManager AI horizontal logo in dark pill container with building name
export function addPdfHeaderWithLogo(doc: jsPDF, buildingName?: string): number {
  addPdfWatermark(doc);
  try {
    // Dark container pill behind logo to ensure high contrast for CondoManager lettering on white backgrounds
    doc.setFillColor(15, 23, 42); // Dark slate (#0f172a)
    doc.roundedRect(70, 7, 70, 16, 3, 3, "F");
    doc.addImage(LOGO_HORIZONTAL_BASE64, "PNG", 72.5, 9, 65, 12);
  } catch (e) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("CONDOMANAGER AI", 105, 16, { align: "center" });
  }

  if (buildingName) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const text = buildingName.toUpperCase().startsWith("CONDOMÍNIO") 
      ? buildingName 
      : `CONDOMÍNIO ${buildingName.toUpperCase()}`;
    doc.text(text, 105, 27, { align: "center" });
    return 32;
  }

  return 28; // Return Y start position for document content
}

export const formatDatePT = (dateStr: string | undefined): string => {
  if (!dateStr) return "";
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  }
  return dateStr;
};

export const formatDateISO = (datePTStr: string | undefined): string => {
  if (!datePTStr) return "";
  const parts = datePTStr.split('-');
  if (parts.length === 3) {
    if (parts[2].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return datePTStr;
  }
  return datePTStr;
};

export function downloadBlob(blob: Blob, fileName: string) {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    }, 1000);
  } catch (err) {
    console.error("Erro ao descarregar ficheiro:", err);
  }
}

export function exportToXLS(filename: string, headers: string[], rows: string[][]) {
  let csvContent = "\uFEFF"; // BOM for Portuguese characters
  csvContent += headers.join(";") + "\n";
  rows.forEach(row => {
    csvContent += row.map(v => typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v).join(";") + "\n";
  });
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const finalName = filename.endsWith(".xls") || filename.endsWith(".csv") ? filename : `${filename}.xls`;
  downloadBlob(blob, finalName);
}

export function generateAndDownloadPdf(
  title: string,
  sections: { heading?: string; content: string | string[] }[],
  fileName: string,
  metadata?: { label: string; value: string }[]
) {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Top Header: Logo centered at top (NO BARS)
    let y = addPdfHeaderWithLogo(doc);

    doc.setTextColor(15, 23, 42); // Slate 900

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    const titleLines = doc.splitTextToSize(title, 180);
    doc.text(titleLines, 105, y, { align: "center" });
    y += (titleLines.length * 6) + 4;

    // Metadata box
    if (metadata && metadata.length > 0) {
      const boxHeight = Math.max(18, Math.ceil(metadata.length / 2) * 6 + 4);
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, 182, boxHeight, "F");
      doc.setDrawColor(203, 213, 225);
      doc.rect(14, y, 182, boxHeight, "S");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      let metaY = y + 5;
      metadata.forEach((m, idx) => {
        const xPos = idx % 2 === 0 ? 18 : 108;
        doc.text(`${m.label}: ${m.value}`, xPos, metaY);
        if (idx % 2 === 1 || idx === metadata.length - 1) metaY += 5.5;
      });
      y += boxHeight + 8;
    }

    // Body Sections
    for (const sec of sections) {
      if (y > 265) {
        doc.addPage();
        addPdfWatermark(doc);
        y = 20;
      }

      if (sec.heading) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(4, 120, 87);
        doc.text(sec.heading, 14, y);
        y += 6;
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);

      const items = Array.isArray(sec.content) ? sec.content : [sec.content];
      for (const item of items) {
        if (y > 265) {
          doc.addPage();
          addPdfWatermark(doc);
          y = 20;
        }
        const lines = doc.splitTextToSize(item, 180);
        doc.text(lines, 14, y);
        y += (lines.length * 4.2) + 2;
      }
      y += 4;
    }

    // Footer
    if (y > 265) {
      doc.addPage();
      addPdfWatermark(doc);
      y = 20;
    }
    doc.setDrawColor(4, 120, 87);
    doc.line(14, y, 196, y);
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(4, 120, 87);
    doc.text("CONDOMANAGER AI - REGISTO AUTÊNTICO E ARQUIVADO EM PDF", 105, y, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Emissão: ${new Date().toLocaleDateString('pt-PT')} | Certificado Digital Inviolável (Browser & PWA)`, 105, y + 4, { align: "center" });

    const finalPdfName = fileName.toLowerCase().endsWith(".pdf") ? fileName : `${fileName}.pdf`;
    const blob = doc.output("blob");
    downloadBlob(blob, finalPdfName);
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
  }
}

export function downloadDocHtml(title: string, htmlBody: string, fileName: string) {
  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 30px; color: #0f172a; line-height: 1.5; position: relative; }
    .watermark { position: fixed; top: 30%; left: 25%; width: 320px; opacity: 0.08; pointer-events: none; z-index: -1; }
    h1 { color: #047857; font-size: 18px; border-bottom: 2px solid #047857; padding-bottom: 6px; }
    p, li { font-size: 11px; }
  </style>
</head>
<body>
  <div class="watermark"><img src="/marca/19-marca-dagua-logo-cinza-claro.png" width="320" alt="" /></div>
  ${fullHtmlBody(htmlBody)}
</body>
</html>`;
  const blob = new Blob(['\ufeff', fullHtml], { type: 'application/msword' });
  const finalDocName = fileName.toLowerCase().endsWith(".doc") ? fileName : `${fileName}.doc`;
  downloadBlob(blob, finalDocName);
}

function fullHtmlBody(content: string): string {
  return content;
}

export function downloadEmailDocument(subject: string, from: string, to: string, bodyText: string, fileName: string) {
  const emlContent = `From: ${from}
To: ${to}
Subject: ${subject}
Date: ${new Date().toUTCString()}
MIME-Version: 1.0
Content-Type: text/plain; charset=utf-8

${bodyText}
`;
  const blob = new Blob([emlContent], { type: 'text/plain;charset=utf-8;' });
  const finalName = fileName.toLowerCase().endsWith(".eml") ? fileName : `${fileName}.eml`;
  downloadBlob(blob, finalName);
}

export function computeTransferCode(morada: string | undefined, numPorta: string | undefined, piso: string | undefined, fracao_nome: string | undefined): string {
  if (!morada) return "CONDOMINIO";
  const palavras = morada.split(/[\s,]+/);
  const ignorarArtigos = ["de", "do", "dos", "da", "das", "a", "o", "e"];
  const palavrasFiltradas = palavras.filter(p => p && !ignorarArtigos.includes(p.toLowerCase()));
  
  // Take initials of up to 2 words of the street (e.g., "Rua Bento" -> RB)
  const iniciais = palavrasFiltradas
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join("");
  
  const num = (numPorta || "").trim().replace(/[^0-9]/g, "");
  const p = (piso || "").trim().replace(/[^a-zA-Z0-9]/g, "");
  const f = (fracao_nome || "").trim().replace(/[^a-zA-Z0-9]/g, "");
  
  return `${iniciais}${num}${p}${f}`.toUpperCase();
}

export function copyTextToClipboard(text: string): boolean {
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  } catch (err) {
    return false;
  }
}

export function downloadFichaCondominoVaziaPDF(
  predioNome: string = "Condomínio Activo", 
  morada: string = "", 
  initialData?: Record<string, string>
) {
  try {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // 1. Top Header: Logo centered at top (NO BARS)
    let y = addPdfHeaderWithLogo(doc);

    // Title
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("FICHA DE REGISTO DE CONDÓMINO / PROPRIETÁRIO", 105, y, { align: "center" });
    y += 7;

    // Building metadata box (Address ONLY - No building name)
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y, 182, 10, "F");
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, y, 182, 10, "S");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Morada do Edifício: ${morada || initialData?.morada_edificio || "Registo Oficial de Fração"} | Ano do Exercício: 2026`, 18, y + 6.5);

    y += 15;

    const drawBoxWithFields = (title: string, fields: { label: string; placeholder?: string; widthPct?: number; key?: string; value?: string }[]) => {
      if (title) {
        y += 4;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(4, 120, 87);
        doc.text(title, 14, y);
        y += 5;
      }

      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(255, 255, 255);

      let currentX = 14;
      const totalWidth = 182;

      fields.forEach(f => {
        const fieldW = (f.widthPct || 100) * totalWidth / 100;
        doc.rect(currentX, y, fieldW, 11, "S");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(f.label.toUpperCase(), currentX + 2.5, y + 3.5);

        const fieldKey = f.key || f.label.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
        const val = (initialData && initialData[fieldKey]) || f.value || "";

        if ((doc as any).AcroFormTextField) {
          try {
            const tf = new (doc as any).AcroFormTextField();
            tf.Rect = [currentX + 2, y + 4.2, fieldW - 4, 5.8];
            tf.multiline = false;
            tf.fieldName = fieldKey;
            tf.fontSize = 8;
            tf.fontName = "helvetica";
            tf.value = val;
            doc.addField(tf);
          } catch (e) {
            if (val || f.placeholder) {
              doc.setFont("helvetica", "normal");
              doc.setFontSize(7.5);
              doc.setTextColor(15, 23, 42);
              doc.text(val || f.placeholder || "", currentX + 3, y + 8.5);
            }
          }
        } else if (val || f.placeholder) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(15, 23, 42);
          doc.text(val || f.placeholder || "", currentX + 3, y + 8.5);
        }

        currentX += fieldW;
      });

      y += 11;
    };

    // 1. DADOS DE IDENTIFICAÇÃO DA FRAÇÃO
    drawBoxWithFields("1. IDENTIFICAÇÃO DA FRAÇÃO AUTÓNOMA", [
      { label: "Morada do Edifício", key: "morada_edificio", placeholder: morada || "Rua / Avenida...", widthPct: 35 },
      { label: "Piso", key: "piso", placeholder: "Piso...", widthPct: 15 },
      { label: "Letra / Designação", key: "letra", placeholder: "Letra...", widthPct: 20 },
      { label: "Permilagem (‰)", key: "permilagem", placeholder: "ex: 125‰", widthPct: 15 },
      { label: "Tipologia", key: "tipologia", placeholder: "ex: T2", widthPct: 15 }
    ]);

    // 2. DADOS DO PROPRIETÁRIO PRINCIPAL
    drawBoxWithFields("2. DADOS DO PROPRIETÁRIO PRINCIPAL", [
      { label: "Nome Completo *", key: "prop_nome", placeholder: "Ex: José Carlos Alves Guerra", widthPct: 50 },
      { label: "NIF Fiscal *", key: "prop_nif", placeholder: "Ex: 221230475", widthPct: 25 },
      { label: "Telemóvel *", key: "prop_tlm", placeholder: "Ex: 912345678", widthPct: 25 }
    ]);

    drawBoxWithFields("", [
      { label: "E-mail Oficial *", key: "prop_email", placeholder: "Ex: jose@email.com", widthPct: 40 },
      { label: "IBAN de Origem", key: "prop_iban", placeholder: "PT50...", widthPct: 60 }
    ]);

    drawBoxWithFields("", [
      { label: "Titular da Conta Bancária", key: "prop_titular", placeholder: "Nome do titular...", widthPct: 40 },
      { label: "Entidade Bancária", key: "prop_banco", placeholder: "Ex: BPI, CGD, ActivoBank", widthPct: 35 },
      { label: "Fotografia de Perfil", key: "foto", placeholder: "[ Espaço p/ Foto ]", widthPct: 25 }
    ]);

    // 3. COPROPRIETÁRIOS ADICIONAIS
    drawBoxWithFields("3. COPROPRIETÁRIOS ADICIONAIS (SE APLICÁVEL)", [
      { label: "Nome Completo do Coproprietário", key: "coprop_nome", placeholder: "Ex: Ana Maria Guerra", widthPct: 45 },
      { label: "NIF Fiscal", key: "coprop_nif", placeholder: "Ex: 234567890", widthPct: 20 },
      { label: "E-mail", key: "coprop_email", placeholder: "ana@email.com", widthPct: 20 },
      { label: "Telemóvel", key: "coprop_tlm", placeholder: "919888777", widthPct: 15 }
    ]);

    // 4. A FRAÇÃO ENCONTRA-SE ARRENDADA? (S / N) + INQUILINO
    drawBoxWithFields("4. A FRAÇÃO ENCONTRA-SE ARRENDADA?", [
      { label: "Fração Arrendada?", key: "is_arrendada", placeholder: "NÃO / SIM", widthPct: 35 },
      { label: "Nome Completo do Arrendatário / Inquilino", key: "inq_nome", placeholder: "Nome do arrendatário...", widthPct: 65 }
    ]);

    drawBoxWithFields("", [
      { label: "NIF Fiscal do Arrendatário", key: "inq_nif", placeholder: "NIF...", widthPct: 25 },
      { label: "E-mail do Arrendatário", key: "inq_email", placeholder: "email@arrendatario.pt", widthPct: 40 },
      { label: "Telemóvel do Arrendatário", key: "inq_tlm", placeholder: "929887766", widthPct: 35 }
    ]);

    drawBoxWithFields("", [
      { label: "Morada de Residência Alternativa do Proprietário (Se Arrendada)", key: "prop_morada_alt", placeholder: "Morada habitual onde o proprietário residir...", widthPct: 100 }
    ]);

    // 5. DECLARAÇÃO E CONSENTIMENTO RGPD
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(4, 120, 87);
    doc.text("5. DECLARAÇÃO E CONSENTIMENTO RGPD", 14, y);
    y += 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(51, 65, 85);
    const rgpdText = "Declaro sob compromisso de honra que as informações prestadas nesta ficha de cadastro são verdadeiras. Nos termos do Regulamento Geral sobre a Proteção de Dados (RGPD - UE 2016/679), dou o meu consentimento expresso para o tratamento dos meus dados pessoais (nome, NIF, e-mail, contactos, IBAN e dados de fração) pela Administração do Condomínio e pela plataforma CondoManager AI, exclusivamente para efeitos de gestão do edifício, cobrança de quotas, convocatórias e comunicações oficiais.";
    const rgpdLines = doc.splitTextToSize(rgpdText, 182);
    doc.text(rgpdLines, 14, y);
    y += (rgpdLines.length * 3) + 3;

    doc.setDrawColor(203, 213, 225);
    doc.rect(14, y, 182, 6, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    
    if ((doc as any).AcroFormCheckBox) {
      try {
        const cb = new (doc as any).AcroFormCheckBox();
        cb.Rect = [15, y + 0.8, 4.5, 4.5];
        cb.fieldName = "rgpd_consentimento";
        doc.addField(cb);
        doc.text("  Autorizo o tratamento dos meus dados pessoais nos termos da declaração RGPD acima descrita.", 21, y + 4);
      } catch (e) {
        doc.text("[   ] Autorizo o tratamento dos meus dados pessoais nos termos da declaração RGPD acima descrita.", 18, y + 4);
      }
    } else {
      doc.text("[   ] Autorizo o tratamento dos meus dados pessoais nos termos da declaração RGPD acima descrita.", 18, y + 4);
    }
    
    y += 9;

    // Signatures
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, y, 85, 16, "S");
    doc.rect(111, y, 85, 16, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("DATA DE PREENCHIMENTO", 18, y + 4.5);

    if ((doc as any).AcroFormTextField) {
      try {
        const tfData = new (doc as any).AcroFormTextField();
        tfData.Rect = [18, y + 6.5, 75, 7];
        tfData.fieldName = "data_preenchimento";
        tfData.value = initialData?.data_preenchimento || new Date().toLocaleDateString("pt-PT");
        doc.addField(tfData);

        const tfSig = new (doc as any).AcroFormTextField();
        tfSig.Rect = [115, y + 6.5, 75, 7];
        tfSig.fieldName = "assinatura_nome";
        tfSig.value = initialData?.assinatura_nome || "";
        doc.addField(tfSig);
      } catch (e) {
        doc.text(initialData?.data_preenchimento || "____ / ____ / 2026", 18, y + 11);
      }
    } else {
      doc.text(initialData?.data_preenchimento || "____ / ____ / 2026", 18, y + 11);
    }

    doc.text("ASSINATURA DO PROPRIETÁRIO / CONDÓMINO", 115, y + 4.5);

    const blob = doc.output("blob");
    downloadBlob(blob, "Ficha_Cadastro_Condomino_Em_Branco.pdf");
  } catch (err) {
    console.error("Erro ao gerar Ficha de Cadastro Vazia PDF:", err);
  }
}

export interface DynamicReportOptions {
  predio: any;
  ambito: "PREDIO" | "FRACAO" | "TODAS";
  fracaoId?: string;
  tipoRelatorio: "extrato_quotas" | "balancete" | "fichas_condominos" | "debitos_incumprimento" | "obras_manutencao" | "resumo_executivo";
  exercicio: string;
  fracoesList: any[];
  movimentosList?: any[];
  avisosList?: any[];
  incluirInquilinos?: boolean;
  incluirIbans?: boolean;
  incluirAssinatura?: boolean;
}

export function generateDynamicReportPDF(opts: DynamicReportOptions) {
  try {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const bName = opts.predio?.nome || opts.predio?.morada_linha1 || "Condomínio";
    let y = addPdfHeaderWithLogo(doc, bName);

    const titleMap: Record<string, string> = {
      extrato_quotas: "RELATÓRIO - EXTRATO DE QUOTAS & PAGAMENTOS",
      balancete: "RELATÓRIO - BALANCETE FINANCEIRO CONSOLIDADO",
      fichas_condominos: "RELATÓRIO - FICHAS & DADOS DE REGISTO",
      debitos_incumprimento: "RELATÓRIO - MAPA DE INCUMPRIMENTO & QUOTAS EM ATRASO",
      obras_manutencao: "RELATÓRIO - INTERVENÇÕES TÉCNICAS & VISTORIAS",
      resumo_executivo: "RELATÓRIO EXECUÇÃO E RESUMO GERAL DO EDIFÍCIO"
    };

    const targetTitle = titleMap[opts.tipoRelatorio] || "RELATÓRIO OFICIAL DO CONDOMÍNIO";

    // Title
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(targetTitle, 105, y, { align: "center" });
    y += 6;

    // Filter Banner Box
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 12, "F");
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, y, 182, 12, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(4, 120, 87);
    
    const targetFracao = opts.fracoesList.find(f => f.id_fracao === opts.fracaoId);
    const scopeText = opts.ambito === "PREDIO" ? `ÂMBITO: EDIFÍCIO CONSOLIDADO (${opts.predio.nome})` : opts.ambito === "FRACAO" ? `ÂMBITO: FRAÇÃO ESPECÍFICA (${targetFracao ? targetFracao.fracao_nome : "A"})` : `ÂMBITO: TODAS AS FRAÇÕES (${opts.fracoesList.length} UNIDADES)`;

    doc.text(scopeText, 18, y + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(`EXERCÍCIO: ${opts.exercicio}  |  EMISSÃO: ${new Date().toLocaleDateString("pt-PT")}  |  EDIFÍCIO: ${opts.predio.nome}`, 18, y + 9);

    y += 18;

    // Filter list of fracoes based on ambito
    const scopeFracoes = opts.ambito === "FRACAO" && targetFracao ? [targetFracao] : opts.fracoesList;

    // Build Table Header
    doc.setFillColor(226, 232, 240);
    doc.rect(14, y, 182, 7, "F");
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, y, 182, 7, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text("FRAÇÃO", 17, y + 4.5);
    doc.text("PROPRIETÁRIO / CONTACTO", 45, y + 4.5);
    doc.text("PERMILAGEM", 110, y + 4.5);
    doc.text("QUOTA MENSAL", 140, y + 4.5);
    doc.text("ESTADO / SALDO", 170, y + 4.5);

    y += 7;

    let totalQuotas = 0;
    let totalDividas = 0;

    scopeFracoes.forEach((f, idx) => {
      if (y > 265) {
        doc.addPage();
        y = addPdfHeaderWithLogo(doc);
      }

      const rowBg = idx % 2 === 0 ? 255 : 248;
      doc.setFillColor(rowBg, rowBg, rowBg);
      doc.rect(14, y, 182, 8, "F");
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, y, 182, 8, "S");

      const quotaVal = ((opts.predio.orcamento_anual || 12000) * (f.permilagem / 1000) / 12);
      totalQuotas += quotaVal;

      const debt = (opts.avisosList || []).filter(a => a.id_fracao === f.id_fracao && a.estado === "Pendente").reduce((acc, c) => acc + c.valor, 0);
      totalDividas += debt;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`Fração ${f.fracao_nome} (${f.piso})`, 17, y + 5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text(`${f.proprietario.nome} (${f.proprietario.tlm || f.proprietario.email})`, 45, y + 5);
      doc.text(`${f.permilagem}‰`, 110, y + 5);
      doc.text(`${quotaVal.toFixed(2)}€`, 140, y + 5);

      if (debt > 0) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(220, 38, 38);
        doc.text(`Em Dívida (${debt.toFixed(2)}€)`, 170, y + 5);
      } else {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(5, 150, 105);
        doc.text("Regularizado", 170, y + 5);
      }

      y += 8;
    });

    // Summary Totals Row
    y += 2;
    doc.setFillColor(236, 253, 245);
    doc.rect(14, y, 182, 9, "F");
    doc.setDrawColor(52, 211, 153);
    doc.rect(14, y, 182, 9, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(4, 120, 87);
    doc.text(`TOTAL SUMÁRIO (${scopeFracoes.length} FRAÇÃO/ÕES)`, 17, y + 5.5);
    doc.text(`Total Quotas: ${totalQuotas.toFixed(2)}€/mês`, 110, y + 5.5);
    
    if (totalDividas > 0) {
      doc.setTextColor(220, 38, 38);
      doc.text(`Total em Atraso: ${totalDividas.toFixed(2)}€`, 160, y + 5.5);
    } else {
      doc.setTextColor(5, 150, 105);
      doc.text(`Total em Atraso: 0.00€`, 160, y + 5.5);
    }

    y += 16;

    // Official Stamp / Signature block if requested
    if (opts.incluirAssinatura && y < 250) {
      doc.setDrawColor(203, 213, 225);
      doc.rect(14, y, 182, 18, "S");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text("EMISSÃO OFICIAL E CARIMBO DIGITAL DA ADMINISTRAÇÃO DO CONDOMÍNIO", 18, y + 4.5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.text(`Plataforma CondoManager AI — Certificação Digital Edifício ${opts.predio.nome}`, 18, y + 9);
      doc.text(`Carimbo Autenticado em: ${new Date().toLocaleString("pt-PT")}`, 18, y + 13.5);

      doc.setFont("helvetica", "bold");
      doc.text("ASSINATURA DA ADMINISTRAÇÃO", 130, y + 4.5);
      doc.setFont("helvetica", "italic");
      doc.text("__________________________________", 130, y + 13.5);
    }

    const blob = doc.output("blob");
    downloadBlob(blob, `Relatorio_${opts.tipoRelatorio}_${opts.ambito}_${opts.predio.nome.replace(/\s+/g, "_")}.pdf`);
  } catch (err) {
    console.error("Erro ao gerar relatório PDF dinâmico:", err);
  }
}

export function downloadFichaCondominoPreenchidaPDF(predioNome: string = "Condomínio Activo", fracao: any) {
  try {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // Top Header: Logo centered at top (NO BARS)
    let y = addPdfHeaderWithLogo(doc);

    const prop = fracao?.proprietario || {};
    const inq = fracao?.inquilino || {};

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`FICHA DE REGISTO PREENCHIDA — FRAÇÃO ${fracao?.fracao_nome || "A"} (${fracao?.piso || ""})`, 105, y, { align: "center" });
    y += 7;

    doc.setFillColor(248, 250, 252);
    doc.rect(14, y, 182, 10, "F");
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, y, 182, 10, "S");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Morada do Edifício: ${predioNome} | Permilagem: ${fracao?.permilagem || 0}‰ | Tipologia: ${fracao?.tipologia || "Residencial"}`, 18, y + 6.5);

    y += 15;

    const renderBoxValue = (title: string, fields: { label: string; val: string; widthPct?: number }[]) => {
      if (title) {
        y += 4;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(4, 120, 87);
        doc.text(title, 14, y);
        y += 5;
      }

      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(248, 250, 252);

      let currentX = 14;
      const totalWidth = 182;

      fields.forEach(f => {
        const fieldW = (f.widthPct || 100) * totalWidth / 100;
        doc.rect(currentX, y, fieldW, 12, "S");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(f.label.toUpperCase(), currentX + 3, y + 4);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(f.val || "—", currentX + 3, y + 9);

        currentX += fieldW;
      });

      y += 12;
    };

    renderBoxValue("1. DADOS DE IDENTIFICAÇÃO DA FRAÇÃO", [
      { label: "Morada do Edifício", val: predioNome, widthPct: 35 },
      { label: "Piso", val: fracao?.piso || "N/A", widthPct: 15 },
      { label: "Letra / Designação", val: fracao?.fracao_nome || "N/A", widthPct: 20 },
      { label: "Permilagem Legal (‰)", val: `${fracao?.permilagem || 0}‰`, widthPct: 15 },
      { label: "Tipologia", val: fracao?.tipologia || "T2", widthPct: 15 }
    ]);

    renderBoxValue("2. PROPRIETÁRIO PRINCIPAL REGISTADO", [
      { label: "Nome Completo *", val: prop.nome || "Não atribuído", widthPct: 50 },
      { label: "NIF Fiscal *", val: prop.nif || "—", widthPct: 25 },
      { label: "Telemóvel *", val: prop.telefone || "—", widthPct: 25 }
    ]);

    renderBoxValue("", [
      { label: "E-mail Oficial *", val: prop.email || "—", widthPct: 40 },
      { label: "IBAN de Origem", val: prop.iban || "—", widthPct: 60 }
    ]);

    renderBoxValue("", [
      { label: "Titular da Conta Bancária", val: prop.titular_iban || prop.nome || "—", widthPct: 40 },
      { label: "Entidade Bancária", val: prop.banco || "BPI / CGD", widthPct: 35 },
      { label: "Fotografia de Perfil", val: prop.foto ? "📷 Foto Carregada" : "Sem foto", widthPct: 25 }
    ]);

    renderBoxValue("3. COPROPRIETÁRIOS ADICIONAIS", [
      { label: "Nome do Coproprietário", val: prop.co_nome || "Nenhum coproprietário adicional", widthPct: 50 },
      { label: "NIF Fiscal", val: prop.co_nif || "—", widthPct: 25 },
      { label: "Telemóvel", val: prop.co_tlm || "—", widthPct: 25 }
    ]);

    renderBoxValue("4. FRAÇÃO ARRENDADA? (DADOS DO ARRENDATÁRIO / INQUILINO)", [
      { label: "Fração Arrendada?", val: fracao?.is_arrendada ? "SIM (Arrendada)" : "NÃO (Ocupada pelo Proprietário)", widthPct: 35 },
      { label: "Nome Completo do Arrendatário / Inquilino", val: fracao?.is_arrendada ? inq.nome || "Inquilino Registado" : "N/A", widthPct: 65 }
    ]);

    if (fracao?.is_arrendada) {
      renderBoxValue("", [
        { label: "NIF Fiscal do Arrendatário", val: inq.nif || "—", widthPct: 25 },
        { label: "E-mail do Arrendatário", val: inq.email || "—", widthPct: 40 },
        { label: "Telemóvel do Arrendatário", val: inq.telefone || "—", widthPct: 35 }
      ]);

      renderBoxValue("", [
        { label: "Morada de Residência Alternativa do Proprietário (Se Arrendada)", val: prop.morada_alt || "Registada no sistema", widthPct: 100 }
      ]);
    }

    // RGPD Statement
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(4, 120, 87);
    doc.text("5. CONSENTIMENTO RGPD & REGISTO DIGITAL", 14, y);
    y += 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(51, 65, 85);
    doc.text("Ficha de cadastro registada e validada digitalmente na plataforma CondoManager AI em conformidade com o RGPD (UE 2016/679). Os dados constantes deste documento encontram-se encriptados e arquivados no registo oficial do edifício.", 14, y);

    const blob = doc.output("blob");
    downloadBlob(blob, `Ficha_Cadastro_Fracao_${fracao?.fracao_nome || "A"}.pdf`);
  } catch (err) {
    console.error("Erro ao gerar Ficha Preenchida PDF:", err);
  }
}

export function downloadListaCondominosPDF(predioNome: string = "Condomínio Activo", fracoes: any[]) {
  try {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // Top Header: Logo centered at top (NO BARS)
    let y = addPdfHeaderWithLogo(doc);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`REGISTO GERAL DE CONDÓMINOS & FRAÇÕES — ${predioNome}`, 105, y, { align: "center" });
    y += 7;

    doc.setFillColor(248, 250, 252);
    doc.rect(14, y, 182, 14, "F");
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, y, 182, 14, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(`Total de Frações Autónomas: ${fracoes?.length || 0}`, 18, y + 5);
    const sumPerm = (fracoes || []).reduce((acc, f) => acc + (f.permilagem || 0), 0);
    doc.text(`Total Permilagem Legal: ${sumPerm}‰ | Data de Emissão: ${new Date().toLocaleDateString('pt-PT')}`, 18, y + 10);

    y += 20;

    doc.setFillColor(4, 120, 87);
    doc.rect(14, y, 182, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("FRAÇÃO", 18, y + 5.5);
    doc.text("PISO", 38, y + 5.5);
    doc.text("PERM.", 65, y + 5.5);
    doc.text("PROPRIETÁRIO / CONDÓMINO", 85, y + 5.5);
    doc.text("CONTACTO / E-MAIL", 145, y + 5.5);

    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);

    (fracoes || []).forEach((f, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
        doc.setFillColor(4, 120, 87);
        doc.rect(14, y, 182, 8, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("FRAÇÃO", 18, y + 5.5);
        doc.text("PISO", 38, y + 5.5);
        doc.text("PERM.", 65, y + 5.5);
        doc.text("PROPRIETÁRIO / CONDÓMINO", 85, y + 5.5);
        doc.text("CONTACTO / E-MAIL", 145, y + 5.5);
        y += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
      }

      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, 182, 8, "F");
      }
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, y, 182, 8, "S");

      doc.setFont("helvetica", "bold");
      doc.text(f.fracao_nome || "-", 18, y + 5.5);
      doc.setFont("helvetica", "normal");
      doc.text(f.piso || "-", 38, y + 5.5);
      doc.text(`${f.permilagem || 0}‰`, 65, y + 5.5);
      
      const propName = f.proprietario?.nome || "Sem proprietário";
      const truncatedProp = propName.length > 28 ? propName.substring(0, 26) + "..." : propName;
      doc.text(truncatedProp, 85, y + 5.5);

      const contact = f.proprietario?.email || f.proprietario?.telefone || "—";
      const truncatedContact = contact.length > 25 ? contact.substring(0, 23) + "..." : contact;
      doc.text(truncatedContact, 145, y + 5.5);

      y += 8;
    });

    y += 6;
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setDrawColor(4, 120, 87);
    doc.line(14, y, 196, y);
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(4, 120, 87);
    doc.text("CONDOMANAGER AI - REGISTO OFICIAL DO EDIFÍCIO EM PDF", 105, y, { align: "center" });

    const blob = doc.output("blob");
    downloadBlob(blob, "Lista_Condominos_Preenchida_Geral.pdf");
  } catch (err) {
    console.error("Erro ao gerar Lista de Condóminos PDF:", err);
  }
}

export const DEMO_ACCOUNTS_MAP: Record<string, { role: "ADMIN" | "EMPRESA_GESTORA" | "USER" | "TECNICO" | "LIMPEZAS" | "JURIDICO" | "AUDITOR" | "CONTABILISTA"; nome: string; pass: string; title: string }> = {
  // Administrador Interno
  "admin@condomanager.pt": { role: "ADMIN", nome: "Carlos Administrador", pass: "Admin12345!", title: "👑 Administrador Interno" },
  "carlos.adm@condomanager.pt": { role: "ADMIN", nome: "Carlos Administrador", pass: "Admin12345!", title: "👑 Administrador Interno" },

  // Empresa Gestora
  "gestora@condomanager.pt": { role: "EMPRESA_GESTORA", nome: "Gestão Forte, Lda", pass: "Gestora12345!", title: "🏢 Empresa Gestora" },
  "geral@gestaoforte.pt": { role: "EMPRESA_GESTORA", nome: "Gestão Forte, Lda", pass: "Gestora12345!", title: "🏢 Empresa Gestora" },

  // Portal do Condómino
  "condomino@condomanager.pt": { role: "USER", nome: "Ana Silva (Fração A)", pass: "Condomino12345!", title: "🏠 Portal do Condómino" },
  "ana.silva@gmail.com": { role: "USER", nome: "Ana Silva (Fração A)", pass: "Condomino12345!", title: "🏠 Portal do Condómino" },
  "amelia.sousa@yahoo.com": { role: "USER", nome: "D.ª Amélia Sousa (Fração B)", pass: "Condomino12345!", title: "🏠 Portal do Condómino" },

  // Técnico / Vistorias
  "tecnico@condomanager.pt": { role: "TECNICO", nome: "Eng. Rui Melo", pass: "Tecnico12345!", title: "🔍 Inspetor Técnico" },
  "rui.melo@vistoriasegura.pt": { role: "TECNICO", nome: "Eng. Rui Melo", pass: "Tecnico12345!", title: "🔍 Inspetor Técnico" },
  "rui.melim@vistoriasia.pt": { role: "TECNICO", nome: "Eng. Rui Melo", pass: "Tecnico12345!", title: "🔍 Inspetor Técnico" },

  // Equipa de Limpezas
  "limpezas@condomanager.pt": { role: "LIMPEZAS", nome: "Maria Silva (Limpezas)", pass: "Limpezas12345!", title: "🧹 Equipa de Higienização" },
  "limpezas.geral@cleancondo.pt": { role: "LIMPEZAS", nome: "Maria Silva (Limpezas)", pass: "Limpezas12345!", title: "🧹 Equipa de Higienização" },
  "rosa.limpezas@cleancondo.pt": { role: "LIMPEZAS", nome: "D.ª Rosa Limpezas", pass: "Limpezas12345!", title: "🧹 Equipa de Higienização" },

  // Perfil Jurídico
  "juridico@condomanager.pt": { role: "JURIDICO", nome: "Dra. Margarida Castro", pass: "Juridico12345!", title: "⚖️ Perfil Jurídico" },
  "margarida.adv@contencioso.pt": { role: "JURIDICO", nome: "Dra. Margarida Castro", pass: "Juridico12345!", title: "⚖️ Perfil Jurídico" },
  "leonor.silva@lawyers.pt": { role: "JURIDICO", nome: "Dra. Leonor Silva", pass: "Juridico12345!", title: "⚖️ Perfil Jurídico" },

  // Auditor Independente
  "auditor@condomanager.pt": { role: "AUDITOR", nome: "Dr. António Melo", pass: "Auditor12345!", title: "🕵️ Auditor Independente" },
  "antonio.auditor@auditoria.pt": { role: "AUDITOR", nome: "Dr. António Melo", pass: "Auditor12345!", title: "🕵️ Auditor Independente" },
  "jorge.santos@auditoriapredial.pt": { role: "AUDITOR", nome: "Dr. Jorge Santos", pass: "Auditor12345!", title: "🕵️ Auditor Independente" },

  // Contabilista Certificado
  "contabilista@condomanager.pt": { role: "CONTABILISTA", nome: "Dra. Paula Silva", pass: "Contas12345!", title: "📈 Contabilista Certificado" },
  "paula.contas@contabilidade.pt": { role: "CONTABILISTA", nome: "Dra. Paula Silva", pass: "Contas12345!", title: "📈 Contabilista Certificado" },
  "antonio.costa@contabilidade.pt": { role: "CONTABILISTA", nome: "Dr. António Costa", pass: "Contas12345!", title: "📈 Contabilista Certificado" },
};

export function resolveUserByEmail(rawEmail: string) {
  const cleanEmail = (rawEmail || "").trim().toLowerCase();
  if (!cleanEmail) {
    return null;
  }
  if (DEMO_ACCOUNTS_MAP[cleanEmail]) {
    return { ...DEMO_ACCOUNTS_MAP[cleanEmail], email: cleanEmail };
  }
  // Keyword matching for flexible domain/email inputs
  if (cleanEmail.includes('admin') || cleanEmail.includes('carlos')) {
    return { role: "ADMIN" as const, nome: "Carlos Administrador", pass: "Admin12345!", title: "👑 Administrador Interno", email: cleanEmail };
  }
  if (cleanEmail.includes('gestor') || cleanEmail.includes('geral') || cleanEmail.includes('empresa') || cleanEmail.includes('forte')) {
    return { role: "EMPRESA_GESTORA" as const, nome: "Gestão Forte, Lda", pass: "Gestora12345!", title: "🏢 Empresa Gestora", email: cleanEmail };
  }
  if (cleanEmail.includes('tecnic') || cleanEmail.includes('melo') || cleanEmail.includes('melim') || cleanEmail.includes('vistoria')) {
    return { role: "TECNICO" as const, nome: "Eng. Rui Melo", pass: "Tecnico12345!", title: "🔍 Inspetor Técnico", email: cleanEmail };
  }
  if (cleanEmail.includes('limp') || cleanEmail.includes('rosa') || cleanEmail.includes('clean')) {
    return { role: "LIMPEZAS" as const, nome: "Maria Silva (Limpezas)", pass: "Limpezas12345!", title: "🧹 Equipa de Higienização", email: cleanEmail };
  }
  if (cleanEmail.includes('juri') || cleanEmail.includes('adv') || cleanEmail.includes('law') || cleanEmail.includes('margarida') || cleanEmail.includes('leonor')) {
    return { role: "JURIDICO" as const, nome: "Dra. Margarida Castro", pass: "Juridico12345!", title: "⚖️ Perfil Jurídico", email: cleanEmail };
  }
  if (cleanEmail.includes('audit') || cleanEmail.includes('antonio') || cleanEmail.includes('santos')) {
    return { role: "AUDITOR" as const, nome: "Dr. António Melo", pass: "Auditor12345!", title: "🕵️ Auditor Independente", email: cleanEmail };
  }
  if (cleanEmail.includes('conta') || cleanEmail.includes('paula') || cleanEmail.includes('costa')) {
    return { role: "CONTABILISTA" as const, nome: "Dra. Paula Silva", pass: "Contas12345!", title: "📈 Contabilista Certificado", email: cleanEmail };
  }
  
  // Default fallback for any condomino email
  return { role: "USER" as const, nome: "Ana Silva (Fração A)", pass: "Condomino12345!", title: "🏠 Portal do Condómino", email: cleanEmail };
}

export function formatQuotaReceiptNumber(identifier: string | number): string {
  if (!identifier) return "BR2 00001";
  const str = String(identifier);
  const digits = str.replace(/\D/g, "");
  if (digits) {
    const num = parseInt(digits, 10);
    return `BR2 ${String(num).padStart(5, "0")}`;
  }
  return `BR2 00001`;
}

export function generateSupplierPwaManualPDF(fornecedorNome: string, perfis: string[], passwordProvisoria?: string) {
  try {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    let y = addPdfHeaderWithLogo(doc, "CondoManager AI - PWA Fornecedores");

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`INSTRUÇÕES E MANUAL DE FUNCIONAMENTO DA PWA`, 14, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Fornecedor / Parceiro: ${fornecedorNome}`, 14, y);
    y += 5;
    doc.text(`Perfis Atribuídos: ${perfis.length > 0 ? perfis.join(", ") : "Parceiro Credenciado"}`, 14, y);
    y += 5;
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString("pt-PT")}`, 14, y);
    y += 8;

    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.line(14, y, 196, y);
    y += 8;

    // Credentials Box
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(14, y, 182, 28, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(6, 95, 70);
    doc.text("DADOS DE ACESSO PROVISÓRIOS À PWA", 18, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Endereço da Aplicação: https://condomanager.pt/pwa/login`, 18, y + 12);
    doc.text(`Palavra-passe Provisória: ${passwordProvisoria || "PwaForn2026!"}`, 18, y + 17);
    doc.text(`Recomendação: Altere a sua palavra-passe no Card de Segurança no primeiro acesso.`, 18, y + 22);

    y += 34;

    // Sections per profile
    const sections = [
      {
        title: "1. CARD DE PERFIL PROFISSIONAL & SEGURANÇA",
        items: [
          "• Permite atualizar os seus dados de contacto (IBAN, E-mail, Telemóvel, Morada e Data de Nascimento).",
          "• Possibilidade de carregar a foto do seu perfil em formato WebP.",
          "• No Card de Segurança pode alterar a palavra-passe, gerir notificações Web Push / SMS / E-mail e ativar autenticação biométrica (Face ID / Touch ID)."
        ]
      },
      {
        title: "2. CARD FINANCEIRO - EMBARQUE DE RECIBOS & AI",
        items: [
          "• Leitura Automática AI: Faça upload de faturas/recibos em PDF, DOC ou JPEG. O nosso motor de Inteligência Artificial lê automaticamente NIF, Valor, Data e Categoria.",
          "• Elaboração Manual de Recibo: Preencha o recibo diretamente na PWA com o seu IBAN, Valor, Mês de Referência, NIF e aplique a sua Assinatura Eletrónica digital.",
          "• Envio Direto: Os recibos e faturas submetidos são integrados automaticamente na contabilidade da Administração."
        ]
      }
    ];

    if (perfis.includes("LIMPEZAS")) {
      sections.push({
        title: "3. PERFIL DE HIGIENIZAÇÃO & LIMPEZAS",
        items: [
          "• Aceda à Folha Digital de Limpezas para registar e assinar as intervenções efetuadas nas áreas comuns (Escadas, Hall, Garagem, Elevadores).",
          "• Reporte imediatamente qualquer avaria ou anomalia detetada durante as tarefas de limpeza com foto em tempo real."
        ]
      });
    }

    if (perfis.includes("TECNICO")) {
      sections.push({
        title: "4. PERFIL DE INSPEÇÃO TÉCNICA",
        items: [
          "• Realize vistorias técnicas às infraestruturas (Elevadores, Bombas de Água, Portões, Iluminação e Segurança Contra Incêndios).",
          "• Submeta checklists de manutenção preventiva e relatórios de intervenção técnica arquivados em PDF."
        ]
      });
    }

    if (perfis.includes("JURIDICO")) {
      sections.push({
        title: "5. PERFIL DE CONSULTORIA JURÍDICA & CONTENCIOSO",
        items: [
          "• Acompanhe processos de recuperação de quotas em atraso, contencioso de frações e elaboração de atas / regulamentos.",
          "• Emita pareceres legais com validação em tempo real para a Administração."
        ]
      });
    }

    if (perfis.includes("AUDITOR") || perfis.includes("CONTABILISTA")) {
      sections.push({
        title: "6. PERFIL DE AUDITORIA & CONTABILIDADE",
        items: [
          "• Aceda aos extratos bancários, saldos das contas do condomínio e balancetes financeiros.",
          "• Recomende e aprove lançamentos e relatórios de auditoria financeira."
        ]
      });
    }

    for (const sec of sections) {
      if (y > 250) {
        doc.addPage();
        addPdfWatermark(doc);
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(4, 120, 87);
      doc.text(sec.title, 14, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);

      for (const item of sec.items) {
        if (y > 265) {
          doc.addPage();
          addPdfWatermark(doc);
          y = 20;
        }
        const lines = doc.splitTextToSize(item, 180);
        doc.text(lines, 14, y);
        y += (lines.length * 4) + 2;
      }
      y += 4;
    }

    const blob = doc.output("blob");
    downloadBlob(blob, `Instrucoes_PWA_${fornecedorNome.replace(/\s+/g, "_")}.pdf`);
  } catch (err) {
    console.error("Erro ao gerar Manual PWA Fornecedor PDF:", err);
  }
}

export function generateCondominoPwaManualPDF(condominoNome: string, buildingName: string = "Condomínio Activo", passwordProvisoria?: string) {
  try {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    let y = addPdfHeaderWithLogo(doc, `${buildingName} - PWA Condómino`);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`GUIA DE UTILIZAÇÃO E INSTRUÇÕES DA PWA DO CONDÓMINO`, 14, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Condómino(a): ${condominoNome}`, 14, y);
    y += 5;
    doc.text(`Edifício / Condomínio: ${buildingName}`, 14, y);
    y += 5;
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString("pt-PT")}`, 14, y);
    y += 8;

    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.line(14, y, 196, y);
    y += 8;

    // Credentials Box
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(14, y, 182, 30, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(6, 95, 70);
    doc.text("DADOS DE ACESSO À ÁREA RESERVADA DO CONDÓMINO", 18, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Link de Acesso: https://condomanager.pt/pwa/login`, 18, y + 12);
    doc.text(`Password Provisória: ${passwordProvisoria || "Condo2026!"}`, 18, y + 17);
    doc.text(`Nota de Segurança: Deverá alterar esta palavra-passe no primeiro acesso à plataforma.`, 18, y + 22);
    doc.text(`Administração / Contacto Direto: José Carlos Guerra (Tel: 919943465)`, 18, y + 27);

    y += 36;

    const sections = [
      {
        title: "1. ACOMPANHAMENTO DA ATIVIDADE & SALDO DA FRAÇÃO",
        items: [
          "• Consulte em tempo real o saldo da sua fração, quotas em dia e liquidações pendentes.",
          "• Encontre no seu perfil a referência de pagamento personalizada para transferências bancárias ou Multibanco.",
          "• Submeta comprovativos de pagamento diretamente pela aplicação para atualização do seu saldo."
        ]
      },
      {
        title: "2. COMUNICAÇÃO DE OCORRÊNCIAS & REPORTAR AVARIAS",
        items: [
          "• Reporte avarias nas áreas comuns (Lâmpadas, Elevadores, Portões, Infiltrações) anexando fotografias em tempo real.",
          "• Acompanhe o estado de resolução das ocorrências e receba notificações de progresso.",
          "• Comunicação direta com a Administração e o Administrador José Carlos Guerra."
        ]
      },
      {
        title: "3. ARQUIVO DIGITAL & DOCUMENTOS DO CONDOMÍNIO",
        items: [
          "• Aceda a Atas de Assembleia, Regulamento do Condomínio, Apólices de Seguro e Relatórios Financeiros.",
          "• Faça o download de recibos de quitação e declarações de não-dívida arquivados em PDF."
        ]
      },
      {
        title: "4. ASSEMBLEIAS VIRTUAIS & PARTICIPAÇÃO ATIVA",
        items: [
          "• Participe em assembleias digitais, consulte convocatórias e participe em votações de deliberações.",
          "• Submeta procurações e acompanhe todas as decisões aprovadas para o seu edifício."
        ]
      }
    ];

    for (const sec of sections) {
      if (y > 250) {
        doc.addPage();
        addPdfWatermark(doc);
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(4, 120, 87);
      doc.text(sec.title, 14, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);

      for (const item of sec.items) {
        if (y > 265) {
          doc.addPage();
          addPdfWatermark(doc);
          y = 20;
        }
        const lines = doc.splitTextToSize(item, 180);
        doc.text(lines, 14, y);
        y += (lines.length * 4) + 2;
      }
      y += 4;
    }

    const blob = doc.output("blob");
    downloadBlob(blob, `Guia_PWA_Condomino_${condominoNome.replace(/\s+/g, "_")}.pdf`);
  } catch (err) {
    console.error("Erro ao gerar Guia PWA Condómino PDF:", err);
  }
}

export interface ReceiptItem {
  movimentoNum: string;             // e.g. "MOV-2026-8942-QM"
  conceito: string;                 // e.g. "Quota Ordinária Mensal (Julho 2026)"
  categoria: "Quota Mensal" | "Fundo Reserva" | "Quota Extra";
  valor: number;                    // e.g. 45.00
}

export interface ReceiptPdfData {
  reciboNum: string;             // e.g. "REC-2026-00124"
  dataPagamento: string;         // e.g. "13/08/2026"
  movimentoNum?: string;         // e.g. "MOV-2026-8942"
  movimentoQuotaMensal?: string; // e.g. "MOV-2026-8942-QM"
  movimentoFundoReserva?: string;// e.g. "MOV-2026-8942-FR"
  movimentoQuotaExtra?: string;  // e.g. "MOV-2026-8942-QE"
  buildingName: string;          // e.g. "Rua Bento Rodrigues Nº 2"
  buildingAddress: string;       // e.g. "Rua Bento Rodrigues Nº 2, Lisboa"
  buildingNif: string;           // e.g. "509123456"
  proprietarioNome: string;      // e.g. "José Silva"
  proprietarioNif?: string;      // e.g. "123456789"
  fracaoIdent: string;           // e.g. "Fração A (1º Dto • Piso 1)"
  metodoPagamento: string;       // e.g. "Transferência Bancária"
  quotaMensalVal?: number;       // e.g. 45.00
  fundoReservaVal?: number;      // e.g. 5.00
  quotaExtraVal?: number;        // e.g. 150.00
  isQuotaExtra?: boolean;        // default false
  descricaoQuota?: string;       // e.g. "Quota Ordinária de Julho 2026"
  items?: ReceiptItem[];         // Optional custom items array
  adminNome?: string;            // e.g. "José Carlos Guerra"
  adminSignatureBase64?: string; // Digital signature image
}

export function generateReceiptPDF(data: ReceiptPdfData): jsPDF {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a5" });

  // 1. Watermark Image
  try {
    if (WATERMARK_BASE64) {
      doc.saveGraphicsState?.();
      if ((doc as any).GState) {
        doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
      }
      doc.addImage(WATERMARK_BASE64, "PNG", 60, 24, 90, 90);
      if ((doc as any).GState) {
        doc.setGState(new (doc as any).GState({ opacity: 1.0 }));
      }
      doc.restoreGraphicsState?.();
    }
  } catch (e) {
    console.warn("Watermark render issue:", e);
  }

  // Build Itemized List with Individual Movement Numbers
  const items: ReceiptItem[] = data.items ? [...data.items] : [];

  if (!data.items || data.items.length === 0) {
    const rawReciboClean = data.reciboNum.replace(/[^a-zA-Z0-9]/g, "");

    if (data.isQuotaExtra) {
      // Quota Extra Only
      const qeVal = data.quotaExtraVal ?? data.quotaMensalVal ?? 0;
      items.push({
        movimentoNum: data.movimentoQuotaExtra || data.movimentoNum || `MOV-2026-QE-${rawReciboClean}`,
        conceito: data.descricaoQuota || "Quota Extraordinária de Condomínio",
        categoria: "Quota Extra",
        valor: qeVal
      });
    } else {
      // Quota Mensal Ordinária
      const qmVal = data.quotaMensalVal ?? 0;
      if (qmVal > 0) {
        items.push({
          movimentoNum: data.movimentoQuotaMensal || data.movimentoNum || `MOV-2026-QM-${rawReciboClean}`,
          conceito: data.descricaoQuota || "Quota Ordinária Mensal de Condomínio",
          categoria: "Quota Mensal",
          valor: qmVal
        });
      }

      // Fundo Comum de Reserva (Does NOT apply to Extra Quotas)
      const frVal = data.fundoReservaVal ?? (qmVal > 0 ? Number((qmVal * 0.10).toFixed(2)) : 0);
      if (frVal > 0) {
        items.push({
          movimentoNum: data.movimentoFundoReserva || `MOV-2026-FR-${rawReciboClean}`,
          conceito: "Fundo Comum de Reserva (10% Legal)",
          categoria: "Fundo Reserva",
          valor: frVal
        });
      }

      // Quota Extra when additionally applicable
      if (data.quotaExtraVal && data.quotaExtraVal > 0) {
        items.push({
          movimentoNum: data.movimentoQuotaExtra || `MOV-2026-QE-${rawReciboClean}`,
          conceito: "Quota Extraordinária de Condomínio",
          categoria: "Quota Extra",
          valor: data.quotaExtraVal
        });
      }
    }
  }

  // 2. Top Header - Logo Horizontal (Exact 2.5:1 ratio, uncompressed and readable)
  try {
    if (LOGO_HORIZONTAL_BASE64) {
      // Original dimensions: 1983 x 793 (Ratio = 2.5 : 1)
      // 45mm width x 18mm height maintains exact proportions without squishing or stretching!
      doc.addImage(LOGO_HORIZONTAL_BASE64, "PNG", 12, 7, 45, 18);
    }
  } catch (e) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("CONDOMANAGER AI", 12, 16);
  }

  // 3. Right Top Header Info Box (Recibo Nº, Data, Movimentos)
  doc.setFillColor(15, 23, 42);
  doc.rect(114, 7, 84, 18, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`RECIBO Nº: ${data.reciboNum}`, 118, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(226, 232, 240);
  doc.text(`Data de Pagamento: ${data.dataPagamento}`, 118, 16);
  const movsListStr = items.map(i => i.movimentoNum).join(", ");
  const movsDisplay = movsListStr.length > 38 ? movsListStr.substring(0, 38) + "..." : movsListStr;
  doc.text(`Nºs Movimentos: ${movsDisplay}`, 118, 20);

  // 4. Two Identification Boxes (y=28 to 51)
  // Left Box: Condomínio
  doc.setFillColor(248, 250, 252);
  doc.rect(12, 28, 91, 23, "F");
  doc.setDrawColor(203, 213, 225);
  doc.rect(12, 28, 91, 23, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(4, 120, 87);
  doc.text("CONDOMÍNIO DO EDIFÍCIO:", 15, 33);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const bNameStr = (data.buildingName || "CONDOMÍNIO").toUpperCase();
  doc.text(bNameStr.length > 38 ? bNameStr.substring(0, 38) + "..." : bNameStr, 15, 38);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Morada: ${data.buildingAddress || "Rua Bento Rodrigues Nº 2"}`, 15, 42.5);
  doc.text(`NIF do Condomínio: ${data.buildingNif || "500000000"}`, 15, 46.5);

  // Right Box: Condómino / Proprietário & Fração
  doc.setFillColor(248, 250, 252);
  doc.rect(107, 28, 91, 23, "F");
  doc.setDrawColor(203, 213, 225);
  doc.rect(107, 28, 91, 23, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(4, 120, 87);
  doc.text("LIQUIDADO POR (PROPRIETÁRIO / FRAÇÃO):", 110, 33);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(data.proprietarioNome || "Condómino Registado", 110, 38);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`NIF do Proprietário: ${data.proprietarioNif || "N/A"}`, 110, 42.5);
  doc.text(`Fração: ${data.fracaoIdent || "Fração Habitacional"}`, 110, 46.5);
  doc.text(`Método de Pagamento: ${data.metodoPagamento || "Transferência Bancária"}`, 110, 50);

  // 5. Itemized Table of Values (Discriminated by Row and Movement Number)
  // Table Header (y = 54)
  doc.setFillColor(15, 23, 42);
  doc.rect(12, 54, 186, 6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text("Nº MOVIMENTO", 15, 58);
  doc.text("DESCRITIVO DO CONCEITO / QUOTA", 55, 58);
  doc.text("CATEGORIA", 138, 58);
  doc.text("VALOR (€)", 194, 58, { align: "right" });

  let currentY = 60;
  let totalRecibo = 0;

  items.forEach((item, idx) => {
    totalRecibo += item.valor;

    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(12, currentY, 186, 7, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(12, currentY, 186, 7, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);
    doc.text(item.movimentoNum, 15, currentY + 4.5);

    doc.setFont("helvetica", "normal");
    doc.text(item.conceito, 55, currentY + 4.5);

    doc.setFont("helvetica", "bold");
    if (item.categoria === "Fundo Reserva") {
      doc.setTextColor(180, 83, 9); // Amber
    } else if (item.categoria === "Quota Extra") {
      doc.setTextColor(190, 24, 93); // Rose / Magenta
    } else {
      doc.setTextColor(4, 120, 87); // Emerald / Green
    }
    doc.text(item.categoria.toUpperCase(), 138, currentY + 4.5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(`${item.valor.toFixed(2)} €`, 194, currentY + 4.5, { align: "right" });

    currentY += 7;
  });

  // Total Banner (below items table)
  doc.setFillColor(241, 245, 249);
  doc.rect(12, currentY + 1, 186, 8, "F");
  doc.setDrawColor(203, 213, 225);
  doc.rect(12, currentY + 1, 186, 8, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text("Isento de I.V.A. nos termos do artº 9º do nº21 do CIVA", 15, currentY + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(4, 120, 87);
  doc.text(`TOTAL DO RECIBO: ${totalRecibo.toFixed(2)} €`, 194, currentY + 6, { align: "right" });

  currentY += 12;

  // Quittance Statement & Footer Signatures
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text("O presente documento serve de quitação oficial para todos os efeitos legais, comprovando a liquidação dos valores discriminados por movimento na conta do condomínio.", 12, currentY + 2);

  // Admin Digital Signature Box
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("A ADMINISTRAÇÃO DO CONDOMÍNIO", 130, currentY + 8);

  const adminSig = data.adminSignatureBase64 || localStorage.getItem("admin_signature_digital");
  if (adminSig && adminSig.startsWith("data:image")) {
    try {
      doc.addImage(adminSig, "PNG", 132, currentY + 10, 48, 14);
    } catch (e) {
      console.warn("Could not render digital signature image:", e);
    }
  } else {
    doc.setDrawColor(203, 213, 225);
    doc.line(130, currentY + 20, 192, currentY + 20);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  const adminNameDisplay = data.adminNome || "José Carlos Guerra (Administrador)";
  doc.text(adminNameDisplay, 130, currentY + 26);

  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text(`Emitido via CondoManager AI • Documento nº ${data.reciboNum} • Autenticidade Digital Garantida`, 12, currentY + 26);

  return doc;
}

export function downloadReceiptPDF(data: ReceiptPdfData, customFilename?: string) {
  try {
    const doc = generateReceiptPDF(data);
    const filename = customFilename || `recibo nº ${data.reciboNum}.pdf`;
    doc.save(filename);
  } catch (err) {
    console.error("Erro ao gerar recibo PDF A5:", err);
  }
}

export function gerarPdfEtiquetasChaves(nomePredio: string, chaves: any[]) {
  try {
    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    
    const labelWidth = 30; // 3cm
    const labelHeight = 15; // 1.5cm
    const marginX = 10;
    const marginY = 15;
    const gapX = 2;
    const gapY = 2;
    
    const cols = 6;
    const rowsPerPage = 16;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`ETIQUETAS DE CHAVEIRO - ${(nomePredio || "CONDOMÍNIO").toUpperCase()}`, marginX, 10);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`Dimensões: 3,0 cm x 1,5 cm (30x15 mm) • Recorte pelas linhas tracejadas`, marginX + 105, 10);

    let col = 0;
    let row = 0;
    
    chaves.forEach((chave, index) => {
      if (index > 0 && index % (cols * rowsPerPage) === 0) {
        doc.addPage();
        col = 0;
        row = 0;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text(`ETIQUETAS DE CHAVEIRO - ${(nomePredio || "CONDOMÍNIO").toUpperCase()} (Pág. ${doc.getNumberOfPages()})`, marginX, 10);
      }
      
      const x = marginX + col * (labelWidth + gapX);
      const y = marginY + row * (labelHeight + gapY);
      
      // Outer dotted line
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.2);
      try {
        (doc as any).setLineDashPattern([1, 1], 0);
      } catch (e) {}
      doc.rect(x, y, labelWidth, labelHeight);
      
      try {
        (doc as any).setLineDashPattern([], 0);
      } catch (e) {}
      
      // Accent bar
      if (chave.no_claviculario) {
        doc.setFillColor(16, 185, 129);
      } else {
        doc.setFillColor(100, 116, 139);
      }
      doc.rect(x + 0.3, y + 0.3, 1.5, labelHeight - 0.6, "F");
      
      // Keyhole ring circle indicator
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.circle(x + 3.2, y + labelHeight / 2, 0.9, "FD");
      
      // Building name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(5);
      doc.setTextColor(71, 85, 105);
      const bNameShort = (nomePredio || "Condomínio").length > 18 ? (nomePredio || "Condomínio").substring(0, 18) + "…" : (nomePredio || "Condomínio");
      doc.text(bNameShort.toUpperCase(), x + 5, y + 3.2);
      
      // Key Name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(15, 23, 42);
      const keyNameShort = (chave.area_nome || "Chave").length > 17 ? (chave.area_nome || "Chave").substring(0, 16) + "…" : (chave.area_nome || "Chave");
      doc.text(keyNameShort, x + 5, y + 6.8);
      
      // Key Code
      doc.setFont("courier", "bold");
      doc.setFontSize(6);
      doc.setTextColor(30, 58, 138);
      doc.text(chave.codigo_chave || `CHV-${index + 1}`, x + 5, y + 10.2);
      
      // Quantity and Chaveiro Num
      doc.setFont("helvetica", "bold");
      doc.setFontSize(5);
      doc.setTextColor(16, 185, 129);
      const chaveiroTxt = chave.num_chaveiro ? ` • Chav. ${chave.num_chaveiro}` : "";
      doc.text(`Qtd: ${chave.quantidade || 1} un${chaveiroTxt}`, x + 5, y + 13.5);

      col++;
      if (col >= cols) {
        col = 0;
        row++;
      }
    });
    
    doc.save(`Etiquetas_Chaves_3x1.5cm_${(nomePredio || "Condominio").replace(/\s+/g, "_")}.pdf`);
  } catch (err) {
    console.error("Erro ao gerar PDF de Etiquetas de Chaves:", err);
    alert("Ocorreu um erro ao gerar o PDF de etiquetas de chaves.");
  }
}

export * from './utils/registerServiceWorker';
export * from './utils/requestPermission';
export * from './utils/subscribeUser';
export * from './utils/loadUserPreferences';
export * from './utils/saveUserPreferences';
export * from './utils/sendNotification';



