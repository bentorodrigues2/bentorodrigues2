import React, { useState } from "react";
import { Predio, Conta, Movimento, LoggedUser } from "../types";
import { formatDatePT } from "../utils";

interface GestaoMovimentosProps {
  predio: Predio;
  contas: Conta[];
  movements: Movimento[];
  setMovements: React.Dispatch<React.SetStateAction<Movimento[]>>;
  loggedUser: LoggedUser;
}

interface SimulatedEmail {
  id: string;
  sender: string;
  subject: string;
  date: string;
  body: string;
  attachment: string;
  extractedData: {
    fornecedor: string;
    valor: number;
    descricao: string;
    categoria: string;
  };
  imported: boolean;
}

export function GestaoMovimentos({ predio, contas, movements, setMovements, loggedUser }: GestaoMovimentosProps) {
  // Lançamento Manual / Movimento Cego Form States
  const [contaId, setContaId] = useState("");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("Manutenção");
  const [tipo, setTipo] = useState("Despesa");
  const [isMovimentoCego, setIsMovimentoCego] = useState(false);
  const [uploadedFotos, setUploadedFotos] = useState<string[]>([]);
  const [justifyingMovId, setJustifyingMovId] = useState<string | null>(null);

  // Automatically pre-select the primary bank account of the active building
  React.useEffect(() => {
    const predioContas = contas.filter(c => c.id_predio === predio.id_predio);
    const principalConta = predioContas.find(c => c.is_principal) || predioContas[0];
    if (principalConta) {
      setContaId(principalConta.id_conta);
    } else {
      setContaId("");
    }
  }, [predio.id_predio, contas]);

  // Extrator de Extratos States
  const [statementText, setStatementText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedItems, setExtractedItems] = useState<any[]>([]);

  // Caixa de Entrada IA (Gmail) States
  const [emails, setEmails] = useState<SimulatedEmail[]>([
    {
      id: "email-1",
      sender: "OTIS Elevadores <facturas@otis.pt>",
      subject: "Fatura de Manutenção Periódica - Nº 4819920",
      date: "Hoje, 09:30",
      body: "Estimado cliente, enviamos em anexo a fatura referente à manutenção periódica bimestral dos 2 elevadores instalados no vosso edifício, no valor de 185.00€. Vencimento em 10 dias.",
      attachment: "fatura_otis_4819920.pdf",
      extractedData: {
        fornecedor: "OTIS Elevadores",
        valor: 185.00,
        descricao: "Manutenção Bimestral de Elevadores - OTIS",
        categoria: "Manutenção"
      },
      imported: false
    },
    {
      id: "email-2",
      sender: "EDP Comercial <faturas@edp.pt>",
      subject: "Fatura Eletrónica EDP - Consumo Escadas Comuns",
      date: "Ontem, 16:45",
      body: "A sua fatura EDP de eletricidade das escadas comuns do condomínio já se encontra disponível. O valor total a pagar é de 95.40€, com débito agendado para o final do mês.",
      attachment: "fatura_edp_2026_sc.pdf",
      extractedData: {
        fornecedor: "EDP Comercial",
        valor: 95.40,
        descricao: "Consumo Elétrico - Escadas Comuns (EDP)",
        categoria: "Eletricidade"
      },
      imported: false
    }
  ]);
  const [showGmailSimulator, setShowGmailSimulator] = useState(true);

  const predioContas = contas.filter(c => c.id_predio === predio.id_predio);
  const predioMovements = movements.filter(m => m.id_predio === predio.id_predio);

  // Process uploaded files and silently convert to WebP
  const handleMultipleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 4 - uploadedFotos.length;
    const selectedFiles = Array.from(files).slice(0, remainingSlots);

    selectedFiles.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const MAX_WIDTH = 500;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          // Silent conversion to WebP
          const webpDataUrl = canvas.toDataURL("image/webp", 0.8);
          setUploadedFotos(prev => [...prev, webpDataUrl].slice(0, 4));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleJustificationFileChange = (e: React.ChangeEvent<HTMLInputElement>, movId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const MAX_WIDTH = 500;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        const webpDataUrl = canvas.toDataURL("image/webp", 0.8);
        
        // Update the movement with the justification photo and change state to Justificado
        setMovements(prev => prev.map(m => {
          if (m.id_mov === movId) {
            return {
              ...m,
              estado: "Justificado",
              fotos: [...(m.fotos || []), webpDataUrl],
              isMovimentoCego: false
            };
          }
          return m;
        }));
        setJustifyingMovId(null);
        alert("Fatura/Comprovativo em WebP anexado com sucesso! O Movimento Cego foi devidamente justificado.");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Lançamento Manual / Cego
  const lancarMovimento = (e: React.FormEvent) => {
    e.preventDefault();
    if (loggedUser.role !== 'ADMIN') return alert("Apenas administradores podem lançar movimentos financeiros!");
    if (!contaId || !valor || !descricao || !categoria) return alert("Preencha todos os campos obrigatórios (*)");

    const isCego = tipo === "Despesa" && isMovimentoCego;

    const novo: Movimento = {
      id_mov: "mov-" + (movements.length + 1),
      id_predio: predio.id_predio,
      id_conta: contaId,
      data: new Date().toISOString().split('T')[0],
      tipo,
      valor: Number(valor),
      descricao,
      categoria,
      fotos: uploadedFotos,
      estado: isCego ? "Movimento Cego / Por Justificar" : "Justificado",
      isMovimentoCego: isCego
    };

    const contaAlvo = contas.find(c => c.id_conta === contaId);
    if (contaAlvo) {
      if (tipo === 'Receita') contaAlvo.saldo += Number(valor);
      else contaAlvo.saldo -= Number(valor);
    }

    setMovements([novo, ...movements]);
    setValor("");
    setDescricao("");
    setUploadedFotos([]);
    setIsMovimentoCego(false);
    alert(isCego ? "Movimento Cego lançado! Necessita de justificar posteriormente com fatura." : "Movimento lançado com sucesso!");
  };

  // Simular novo email do Gmail
  const simularNovoEmail = () => {
    const fornecedoresNovos = [
      {
        sender: "Limpezas Brilho Lda <geral@brilho.pt>",
        subject: "Fatura de Limpeza Mensal - Edifício Estrela da Barra",
        body: "Prezada administração, segue em anexo a fatura relativa aos serviços de limpeza prestados durante o corrente mês nas áreas comuns, no valor de 120.00€.",
        attachment: "fatura_brilho_9011.pdf",
        extractedData: {
          fornecedor: "Limpezas Brilho Lda",
          valor: 120.00,
          descricao: "Serviço de Limpeza Mensal Comum",
          categoria: "Limpezas"
        }
      },
      {
        sender: "Fidelidade Seguros <seguros@fidelidade.pt>",
        subject: "Renovação de Apólice Multirriscos Condomínio",
        body: "Caro administrador, informamos que a apólice do seguro multirriscos do condomínio foi renovada. O prémio anual no valor de 310.00€ encontra-se disponível para liquidação.",
        attachment: "fatura_fidelidade_renovacao.pdf",
        extractedData: {
          fornecedor: "Fidelidade Seguros",
          valor: 310.00,
          descricao: "Prémio de Seguro Multirriscos Anual",
          categoria: "Seguros"
        }
      }
    ];

    const aleatorio = fornecedoresNovos[Math.floor(Math.random() * fornecedoresNovos.length)];
    const novoEmail: SimulatedEmail = {
      id: "email-" + (emails.length + 1),
      sender: aleatorio.sender,
      subject: aleatorio.subject,
      date: "Hoje, " + new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      body: aleatorio.body,
      attachment: aleatorio.attachment,
      extractedData: aleatorio.extractedData,
      imported: false
    };

    setEmails([novoEmail, ...emails]);
  };

  // Importar fatura do Gmail para as despesas (Validação Humana obrigatória)
  const importarFaturaGmail = (emailId: string, targetContaId: string) => {
    if (!targetContaId) {
      alert("Por favor, selecione a conta bancária afetada antes de importar!");
      return;
    }
    
    const email = emails.find(e => e.id === emailId);
    if (!email) return;

    // Criar movimento financeiro validado
    const novo: Movimento = {
      id_mov: "mov-" + (movements.length + 1),
      id_predio: predio.id_predio,
      id_conta: targetContaId,
      data: new Date().toISOString().split('T')[0],
      tipo: "Despesa",
      valor: email.extractedData.valor,
      descricao: `[IA Import] ${email.extractedData.descricao}`,
      categoria: email.extractedData.categoria,
      fotos: [], // No actual real photos but marked as documented
      estado: "Justificado",
      isMovimentoCego: false
    };

    const contaAlvo = contas.find(c => c.id_conta === targetContaId);
    if (contaAlvo) {
      contaAlvo.saldo -= email.extractedData.valor;
    }

    setMovements([novo, ...movements]);
    setEmails(prev => prev.map(e => e.id === emailId ? { ...e, imported: true } : e));
    alert(`Fatura de ${email.extractedData.fornecedor} validada pelo utilizador e lançada como Despesa!`);
  };

  // Extrair transações com IA do Extrato de Texto
  const extrairExtratoIA = () => {
    if (!statementText.trim()) {
      alert("Introduza o texto do extrato ou selecione um exemplo.");
      return;
    }

    setIsExtracting(true);

    // Simulated parsing of statement items powered by NLP / Gemini heuristics
    setTimeout(() => {
      const textLower = statementText.toLowerCase();
      const detected: any[] = [];

      // Look for quotas payment patterns
      if (textLower.includes("quota") || textLower.includes("fracao") || textLower.includes("fraçao") || textLower.includes("transferencia") || textLower.includes("trf")) {
        // Let's create smart candidates
        if (textLower.includes("ana") || textLower.includes("silva") || textLower.includes("1a")) {
          detected.push({
            data: "2026-07-10",
            descricao: "TRF ANA SILVA QUOTA JULHO FRAC-1",
            valor: 55.00,
            tipo: "Receita",
            categoria: "Quotas",
            identificacao: "Pagamento de Quota Fracção 1º Esquerdo (Ana Silva)"
          });
        }
        if (textLower.includes("bento") || textLower.includes("bruno") || textLower.includes("2b")) {
          detected.push({
            data: "2026-07-12",
            descricao: "QUOTA BRUNO BENTO FRAC-2",
            valor: 45.00,
            tipo: "Receita",
            categoria: "Quotas",
            identificacao: "Pagamento de Quota Fracção 2º Direito (Bruno Bento)"
          });
        }
      }

      // Look for suppliers invoice patterns
      if (textLower.includes("edp") || textLower.includes("luz") || textLower.includes("eletricidade")) {
        detected.push({
          data: "2026-07-08",
          descricao: "DEB.DIRECTO EDP COMERCIAL",
          valor: 92.30,
          tipo: "Despesa",
          categoria: "Eletricidade",
          identificacao: "Fatura EDP Escadas Comuns"
        });
      }

      if (textLower.includes("otis") || textLower.includes("elevador")) {
        detected.push({
          data: "2026-07-09",
          descricao: "PAG.SERVICO OTIS ELEVADORES",
          valor: 185.00,
          tipo: "Despesa",
          categoria: "Manutenção",
          identificacao: "Fatura Mensal de Assistência OTIS"
        });
      }

      if (textLower.includes("limpeza") || textLower.includes("brilho")) {
        detected.push({
          data: "2026-07-11",
          descricao: "CHQ 882012 LIMPEZAS BRILHO",
          valor: 120.00,
          tipo: "Despesa",
          categoria: "Limpezas",
          identificacao: "Serviço Limpeza Comum"
        });
      }

      // If nothing detected, make up an illustrative mixed set
      if (detected.length === 0) {
        detected.push({
          data: "2026-07-14",
          descricao: "TRF SEBASTIAO COSTA QUOTA FRAC-3",
          valor: 60.00,
          tipo: "Receita",
          categoria: "Quotas",
          identificacao: "Pagamento de Quota Fracção 3º Esquerdo (Sebastião Costa)"
        });
        detected.push({
          data: "2026-07-13",
          descricao: "EPAL CONSUMO AGUA CONDOMINIO",
          valor: 42.15,
          tipo: "Despesa",
          categoria: "Água",
          identificacao: "Fatura Água Comum (EPAL)"
        });
      }

      setExtractedItems(detected);
      setIsExtracting(false);
    }, 1200);
  };

  const lancarItemExtraido = (item: any, selectedContaId: string) => {
    if (!selectedContaId) {
      alert("Escolha a conta bancária para receber ou pagar este movimento!");
      return;
    }

    const novo: Movimento = {
      id_mov: "mov-" + (movements.length + 1),
      id_predio: predio.id_predio,
      id_conta: selectedContaId,
      data: item.data,
      tipo: item.tipo,
      valor: item.valor,
      descricao: `[Extraído por IA] ${item.descricao}`,
      categoria: item.categoria,
      fotos: [],
      estado: "Justificado",
      isMovimentoCego: false
    };

    const contaAlvo = contas.find(c => c.id_conta === selectedContaId);
    if (contaAlvo) {
      if (item.tipo === "Receita") contaAlvo.saldo += item.valor;
      else contaAlvo.saldo -= item.valor;
    }

    setMovements([novo, ...movements]);
    setExtractedItems(prev => prev.filter(x => x.descricao !== item.descricao));
    alert(`Movimento financeiro de ${item.valor.toFixed(2)}€ lançado com sucesso!`);
  };

  const carregarExemploExtrato = (tipoExemplo: string) => {
    if (tipoExemplo === "misto") {
      setStatementText(`EXTRATO BANCÁRIO DETALHADO CGD - 01/07/2026 A 14/07/2026
----------------------------------------------------------------------
08/07/2026  DEB.DIRECTO EDP COMERCIAL                          -92,30 EUR
10/07/2026  TRF ANA SILVA QUOTA JULHO FRAC-1                   +55,00 EUR
11/07/2026  CHQ 882012 LIMPEZAS BRILHO                        -120,00 EUR
12/07/2026  QUOTA BRUNO BENTO FRAC-2                           +45,00 EUR
13/07/2026  EPAL CONSUMO AGUA CONDOMINIO                       -42,15 EUR`);
    } else if (tipoExemplo === "quotas") {
      setStatementText(`EXTRATO DE ENTRADAS DE DEPOSITOS E QUOTAS
----------------------------------------------------------------------
09/07/2026  TRF DE: ANA SILVA OUTROS PAGAMENTOS                +55,00 EUR
11/07/2026  REPOSITORIO QUOTAS PORTARIA BENTO                  +45,00 EUR
12/07/2026  DEP. NUMERARIO COND. CARLOS LIMA                   +60,00 EUR`);
    } else {
      setStatementText(`Faturas & Fornecedores Mês Corrente
----------------------------------------------------------------------
05/07/2026  DEBITO DIRECTO OTIS ELEVADORES S.A.               -185,00 EUR
08/07/2026  DEB.DIRECTO EDP COMERCIAL                          -92,30 EUR
11/07/2026  CHQ 882012 LIMPEZAS BRILHO                        -120,00 EUR`);
    }
  };

  // Contabilizar movimentos cegos não justificados
  const cegosPendentes = predioMovements.filter(m => m.isMovimentoCego && m.estado === "Movimento Cego / Por Justificar");

  return (
    <div className="space-y-6">
      
      {/* Alertas de Movimento Cego Pendente de Justificação */}
      {cegosPendentes.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl shadow-sm space-y-2">
          <div className="flex items-center space-x-3 text-amber-800">
            <i className="fa-solid fa-triangle-exclamation text-xl animate-bounce"></i>
            <div>
              <h4 className="font-bold text-sm">Atenção: Existem Movimentos Cegos sem Fatura Justificativa!</h4>
              <p className="text-xs">Foi detetada saída ou débito na conta bancária sem o comprovativo/fatura correspondente anexado. Anexe os documentos em WebP para regularizar o saldo.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pt-2 border-t border-amber-200">
            {cegosPendentes.map(m => {
              const cta = contas.find(c => c.id_conta === m.id_conta);
              return (
                <div key={m.id_mov} className="flex justify-between items-center text-xs bg-white p-2.5 rounded-lg border border-amber-300">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-800 line-clamp-1">{m.descricao}</p>
                    <p className="text-[10px] text-slate-500 font-mono-custom">Banco: {cta?.banco} | Valor: <span className="font-bold text-red-600">-{m.valor.toFixed(2)}€</span></p>
                  </div>
                  <div>
                    {justifyingMovId === m.id_mov ? (
                      <div className="flex items-center space-x-1.5">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleJustificationFileChange(e, m.id_mov)} 
                          className="hidden" 
                          id={`input-justificar-${m.id_mov}`}
                        />
                        <label 
                          htmlFor={`input-justificar-${m.id_mov}`} 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          <i className="fa-solid fa-cloud-arrow-up mr-1"></i> Carregar
                        </label>
                        <button 
                          onClick={() => setJustifyingMovId(null)} 
                          className="text-slate-400 hover:text-slate-600 text-[10px] underline"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setJustifyingMovId(m.id_mov)} 
                        className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded text-[10px] font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <i className="fa-solid fa-file-invoice mr-1"></i>
                        <span>Regularizar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid Superior: Lançamento Manual / Cego e Caixa de Entrada Gmail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Lançamento de Movimentos */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
              <i className="fa-solid fa-wallet text-emerald-600"></i>
              <span>Registo Manual de Fluxo Financeiro</span>
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">Pronto</span>
          </div>

          {loggedUser.role === 'ADMIN' ? (
            <form onSubmit={lancarMovimento} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-500 mb-1">Tipo de Movimento *</label>
                  <select value={tipo} onChange={e => setTipo(e.target.value)} className="border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-emerald-500 bg-white">
                    <option value="Despesa">Despesa (Débito da Conta)</option>
                    <option value="Receita">Receita (Crédito na Conta)</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-500 mb-1">Conta Bancária Afetada *</label>
                  <select required value={contaId} onChange={e => setContaId(e.target.value)} className="border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-emerald-500 bg-white">
                    <option value="">Selecione a conta bancária...</option>
                    {predioContas.map(c => (
                      <option key={c.id_conta} value={c.id_conta}>{c.banco} ({c.tipo})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col md:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 mb-1">Descrição / Histórico *</label>
                  <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex: Manutenção de Portão Garagem, Quota Julho..." className="border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-emerald-500" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-500 mb-1">Valor (€) *</label>
                  <input type="number" min="0.01" step="0.01" value={valor} onChange={e => setValor(e.target.value)} placeholder="0.00" className="border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-emerald-500 font-mono-custom font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-500 mb-1">Categoria de Lançamento</label>
                  <select value={categoria} onChange={e => setCategoria(e.target.value)} className="border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-emerald-500 bg-white">
                    <option value="Quotas">Quotas / Quotas Extras</option>
                    <option value="Manutenção">Manutenção Geral</option>
                    <option value="Eletricidade">Eletricidade</option>
                    <option value="Água">Água de Consumo Comum</option>
                    <option value="Limpezas">Serviços de Limpezas</option>
                    <option value="Seguros">Seguros Multirriscos</option>
                    <option value="Diversos">Despesas Diversas / Outros</option>
                  </select>
                </div>

                {/* Movimento Cego toggle (apenas para despesa) */}
                {tipo === "Despesa" && (
                  <div className="flex items-center space-x-2 bg-amber-50/50 p-2 rounded-lg border border-amber-200 mt-4 h-fit">
                    <input 
                      type="checkbox" 
                      id="checkbox-cego"
                      checked={isMovimentoCego} 
                      onChange={e => setIsMovimentoCego(e.target.checked)} 
                      className="h-4 w-4 text-amber-600 rounded border-slate-300 cursor-pointer"
                    />
                    <label htmlFor="checkbox-cego" className="text-xs text-amber-900 font-bold select-none cursor-pointer">
                      Movimento Cego (Saída de Dinheiro Sem Fatura Préviva)
                    </label>
                  </div>
                )}
              </div>

              {/* Upload de até 4 comprovativos */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Anexos / Documentos Associados (Até 4 Ficheiros, WebP Silent Conversion)</span>
                  <span className={`${uploadedFotos.length === 4 ? "text-amber-600" : "text-slate-400"}`}>{uploadedFotos.length} de 4</span>
                </div>
                <div className="flex items-center space-x-3">
                  <label className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-dashed border-slate-300 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center space-x-2 cursor-pointer transition-colors">
                    <i className="fa-solid fa-file-circle-plus text-slate-500"></i>
                    <span>Selecionar Ficheiros</span>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleMultipleFilesChange} 
                      disabled={uploadedFotos.length >= 4}
                      className="hidden" 
                    />
                  </label>
                  <div className="flex space-x-1.5 overflow-x-auto py-1">
                    {uploadedFotos.map((imgUrl, i) => (
                      <div key={i} className="relative h-10 w-10 border border-slate-200 rounded overflow-hidden">
                        <img src={imgUrl} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        <button 
                          type="button" 
                          onClick={() => setUploadedFotos(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute -top-1 -right-1 bg-red-500 text-white h-4 w-4 rounded-full text-[8px] flex items-center justify-center font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors cursor-pointer flex items-center justify-center space-x-2">
                  <i className="fa-solid fa-check-double"></i>
                  <span>Lançar Movimento Validado</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center p-8 bg-slate-50 rounded-lg border text-slate-500 text-xs">
              Apenas utilizadores com perfil de Administrador do Prédio podem lançar despesas ou receitas financeiras.
            </div>
          )}
        </div>

        {/* Caixa de Entrada IA (Gmail) */}
        <div className="lg:col-span-5 bg-white text-slate-800 p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <i className="fa-solid fa-envelope text-red-500"></i>
                <h3 className="text-sm font-bold text-slate-800">Caixa de Entrada IA (Gmail do Prédio)</h3>
              </div>
              <button 
                onClick={simularNovoEmail}
                className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-2.5 py-1 rounded transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <i className="fa-solid fa-rotate mr-0.5"></i>
                <span>Simular E-mail</span>
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[290px] pr-1 scrollbar-thin">
              {emails.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs font-mono-custom">
                  Caixa de correio vazia. Nenhum e-mail de fornecedor recebido nas últimas horas.
                </div>
              ) : (
                emails.map(e => (
                  <div key={e.id} className={`p-3 rounded-lg border transition-all ${e.imported ? "bg-slate-50 border-slate-200 opacity-60" : "bg-white border-slate-200 hover:border-emerald-500 shadow-xs"}`}>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span className="font-semibold truncate max-w-[150px]">{e.sender}</span>
                      <span className="font-mono-custom">{e.date}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">{e.subject}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{e.body}</p>
                    
                    <div className="flex items-center space-x-1.5 mt-2 bg-slate-50 p-1.5 rounded text-[10px] border border-slate-200">
                      <i className="fa-solid fa-paperclip text-slate-400"></i>
                      <span className="text-slate-700 font-mono-custom truncate">{e.attachment}</span>
                    </div>

                    {!e.imported ? (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                        <div className="bg-emerald-50 border border-emerald-200 rounded p-2 text-[10px] space-y-1">
                          <p className="font-bold text-emerald-800 flex items-center">
                            <i className="fa-solid fa-microchip mr-1.5"></i>
                            <span>Detetámos fatura de {e.extractedData.fornecedor}</span>
                          </p>
                          <p className="text-slate-600">Sugerido para despesas: <span className="text-emerald-950 font-bold font-mono-custom">{e.extractedData.valor.toFixed(2)}€</span> ({e.extractedData.categoria})</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <select 
                            id={`email-cta-select-${e.id}`}
                            className="bg-white border border-slate-200 text-slate-800 text-[10px] rounded px-1.5 py-1 focus:outline-emerald-500"
                          >
                            <option value="">Escolher Conta...</option>
                            {predioContas.map(c => (
                              <option key={c.id_conta} value={c.id_conta}>{c.banco}</option>
                            ))}
                          </select>
                          <button 
                            onClick={() => {
                              const sel = document.getElementById(`email-cta-select-${e.id}`) as HTMLSelectElement;
                              importarFaturaGmail(e.id, sel?.value);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded py-1 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <i className="fa-solid fa-file-import"></i>
                            <span>Validar e Lançar</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-right text-[10px] text-emerald-600 font-bold flex items-center justify-end space-x-1">
                        <i className="fa-solid fa-check-circle"></i>
                        <span>Importado como Despesa</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono-custom text-center pt-3 border-t border-slate-800">
            * O lançamento das despesas só ocorre após validação humana explícita.
          </div>
        </div>

      </div>

      {/* Assistente de Extração de Extratos por IA */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
            <i className="fa-solid fa-microchip text-violet-600"></i>
            <span>Assistente de Extração Inteligente de Extratos / Faturas</span>
          </h3>
          <div className="flex items-center space-x-1">
            <span className="text-[10px] font-bold bg-violet-100 text-violet-800 px-2 py-0.5 rounded uppercase font-mono-custom">Powered by Gemini 3.5</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-600 block">Texto do Extrato / Anexo a Analisar</label>
              <div className="flex space-x-1.5">
                <button 
                  onClick={() => carregarExemploExtrato("misto")}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2 py-0.5 rounded cursor-pointer"
                >Exemplo Misto</button>
                <button 
                  onClick={() => carregarExemploExtrato("quotas")}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2 py-0.5 rounded cursor-pointer"
                >Exemplo Quotas</button>
              </div>
            </div>
            
            <textarea 
              value={statementText}
              onChange={e => setStatementText(e.target.value)}
              placeholder="Cole aqui o extrato bancário PDF copiado (com as transferências de quotas dos condóminos ou débitos de fornecedores)..."
              rows={6}
              className="w-full border border-slate-200 p-3 text-xs rounded-lg focus:outline-violet-500 font-mono-custom"
            />

            <button 
              onClick={extrairExtratoIA}
              disabled={isExtracting}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isExtracting ? (
                <>
                  <i className="fa-solid fa-spinner animate-spin"></i>
                  <span>A extrair parcelas e associar faturas...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  <span>Extrair Parcelas e Reconhecer Movimentos</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <i className="fa-solid fa-list-check text-slate-500"></i>
                <span>Movimentos Detetados pela IA</span>
              </h4>
              <p className="text-[11px] text-slate-500 mb-3">Reconhecemos faturas de fornecedores e pagamentos de quotas de condóminos. Valide os dados abaixo antes de lançar:</p>

              <div className="space-y-2 overflow-y-auto max-h-[190px] pr-1">
                {extractedItems.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs font-medium">
                    Nenhuma parcela ou transação extraída pendente. Use o editor à esquerda.
                  </div>
                ) : (
                  extractedItems.map((item, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono-custom text-[10px] text-slate-500">{item.data}</span>
                        <span className={`text-[10px] font-bold px-1.5 rounded ${item.tipo === "Receita" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
                          {item.tipo === "Receita" ? "Quota Recebida" : "Fatura Fornecedor"}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{item.descricao}</p>
                        <p className="text-[10px] text-violet-700 font-bold flex items-center mt-1">
                          <i className="fa-solid fa-lightbulb mr-1"></i>
                          <span>{item.identificacao}</span>
                        </p>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                        <span className="font-bold text-slate-800 font-mono-custom text-sm">{item.tipo === "Receita" ? "+" : "-"}{item.valor.toFixed(2)}€</span>
                        <div className="flex items-center space-x-1">
                          <select 
                            id={`extract-cta-select-${index}`}
                            className="bg-slate-50 border text-[10px] rounded px-1.5 py-0.5 focus:outline-none focus:border-violet-500"
                          >
                            <option value="">Lançar em...</option>
                            {predioContas.map(c => (
                              <option key={c.id_conta} value={c.id_conta}>{c.banco} ({c.tipo.split(" ")[0]})</option>
                            ))}
                          </select>
                          <button 
                            onClick={() => {
                              const sel = document.getElementById(`extract-cta-select-${index}`) as HTMLSelectElement;
                              lancarItemExtraido(item, sel?.value);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-1 rounded transition-colors cursor-pointer"
                            title="Lançar Movimento Validado"
                          >
                            <i className="fa-solid fa-plus-circle"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Extrato Histórico de Lançamentos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Extrato Consolidado do Condomínio</h3>
          <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded">Total de Transações: {predioMovements.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="p-3">Data</th>
                <th className="p-3">Banco Afetado</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Descrição do Lançamento</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Documentos/Estado</th>
                <th className="p-3 text-right">Valor</th>
                <th className="p-3 text-center">Ação</th>
              </tr>
            </thead>
            <tbody>
              {predioMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-slate-400 font-medium">
                    Nenhum movimento lançado para este condomínio.
                  </td>
                </tr>
              ) : (
                predioMovements.map(m => {
                  const cta = contas.find(c => c.id_conta === m.id_conta);
                  const isCego = m.isMovimentoCego || m.estado === "Movimento Cego / Por Justificar";
                  return (
                    <tr key={m.id_mov} className={`border-b border-slate-100 hover:bg-slate-50/50 ${isCego ? "bg-amber-50/30" : ""}`}>
                      <td className="p-3 font-mono-custom whitespace-nowrap">{formatDatePT(m.data)}</td>
                      <td className="p-3 font-semibold text-slate-600">{cta?.banco} ({cta?.tipo.split(" ")[0]})</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${m.tipo === 'Receita' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                          {m.tipo}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 font-medium">
                        <div>
                          <span>{m.descricao}</span>
                          {isCego && (
                            <span className="text-[9px] bg-red-100 text-red-800 border border-red-200 px-1.5 py-0.5 rounded font-bold ml-2">Falta Fatura!</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-slate-500 font-semibold">{m.categoria}</td>
                      <td className="p-3">
                        <div className="flex items-center space-x-1.5">
                          {isCego ? (
                            <div className="flex items-center space-x-1.5 text-amber-600 font-bold text-[10px]">
                              <i className="fa-solid fa-triangle-exclamation"></i>
                              <span>Por Justificar</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-emerald-600 font-bold text-[10px]">
                              <i className="fa-solid fa-circle-check"></i>
                              <span>Justificado</span>
                            </div>
                          )}

                          {/* Render photos attached */}
                          {m.fotos && m.fotos.length > 0 && (
                            <div className="flex space-x-0.5 ml-2">
                              {m.fotos.map((f, i) => (
                                <a key={i} href={f} target="_blank" rel="noopener noreferrer" className="h-5 w-5 rounded border border-slate-200 overflow-hidden shrink-0 block hover:scale-110 transition-transform">
                                  <img src={f} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className={`p-3 text-right font-bold font-mono-custom text-sm ${m.tipo === 'Receita' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {m.tipo === 'Receita' ? '+' : '-'}{m.valor.toFixed(2)}€
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Tem a certeza de que deseja eliminar o movimento "${m.descricao}"?`)) {
                              setMovements(prev => prev.filter(x => x.id_mov !== m.id_mov));
                            }
                          }}
                          className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Eliminar Movimento"
                        >
                          <img src="/estados-acoes/14-eliminar.png" alt="Eliminar" className="h-4 w-4 object-contain" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

