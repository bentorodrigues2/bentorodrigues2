import React, { useState } from "react";
import { Predio, Fracao, LoggedUser, SinistroSeguro } from "../types";
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Droplets, 
  Zap, 
  Wind, 
  FileText, 
  Plus, 
  Send, 
  Camera, 
  Clock, 
  Search, 
  Filter, 
  Sparkles, 
  Euro, 
  Download, 
  Building2 
} from "lucide-react";
import { triggerSendReaction } from "./SendingReactionModal";

interface GestaoSinistrosSegurosProps {
  predio: Predio;
  fracoes: Fracao[];
  onUpdateFracoes?: (novasFracoes: Fracao[]) => void;
  loggedUser: LoggedUser;
}

export function GestaoSinistrosSeguros({
  predio,
  fracoes,
  onUpdateFracoes,
  loggedUser
}: GestaoSinistrosSegurosProps) {
  const predioFracoes = fracoes.filter(f => f.id_predio === predio.id_predio);
  const [activeTab, setActiveTab] = useState<"apolices_fracoes" | "sinistros" | "apolice_predio">("apolices_fracoes");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Building common insurance policy state
  const [apoliceEdificio, setApoliceEdificio] = useState({
    seguradora: "Fidelidade - Companhia de Seguros, S.A.",
    num_apolice: "MR-PRED-99881234",
    capital_seguro_edificio: 850000.00,
    capital_responsabilidade_civil: 150000.00,
    validade_inicio: "2026-01-01",
    validade_fim: "2026-12-31",
    premio_anual: 1420.50,
    mediador: "MediSeguros Lisboa Lda.",
    contacto_mediador: "213 400 500 • sinister@mediseguros.pt",
    coberturas: ["Incêndio, Raio e Explosão", "Tempestades e Inundações", "Danos por Água (Partes Comuns)", "Responsabilidade Civil Condomínio", "Avarias em Equipamentos Mecânicos / Elevadores"]
  });

  // Sinistros list
  const [sinistros, setSinistros] = useState<SinistroSeguro[]>([
    {
      id_sinistro: "SIN-2026-01",
      id_predio: predio.id_predio,
      id_fracao: predioFracoes[1]?.id_fracao,
      fracao_nome: predioFracoes[1]?.fracao_nome || "1º Dto",
      tipo_sinistro: "INUNDACAO_AGUA",
      data_ocorrencia: "2026-07-28",
      data_participacao: "2026-07-29",
      seguradora: "Fidelidade",
      num_apolice: "MR-PRED-99881234",
      num_processo_sinistro: "SIN/FID-99441",
      perito_nome: "Eng. Pedro Simões (Gabinete Peritagem PeritSeg)",
      perito_contacto: "919 223 344",
      data_peritagem: "2026-08-04",
      descricao_danos: "Ruptura na coluna montante de água provocou infiltração no teto da casa de banho do 1º Dto e pintura da escada.",
      valor_estimado_danos: 680.00,
      valor_indemnizacao_aprovado: 680.00,
      franquia_aplicavel: 100.00,
      estado: "REPARACAO_EM_CURSO",
      observacoes: "Peritagem concluída com parecer favorável. Obras de reparação adjudicadas à empresa de construção."
    },
    {
      id_sinistro: "SIN-2026-02",
      id_predio: predio.id_predio,
      tipo_sinistro: "DANOS_ELETRICOS",
      data_ocorrencia: "2026-08-12",
      data_participacao: "2026-08-13",
      seguradora: "Fidelidade",
      num_apolice: "MR-PRED-99881234",
      num_processo_sinistro: "SIN/FID-99850",
      perito_nome: "Aguardando nomeação de perito",
      descricao_danos: "Sobretensão na rede elétrica que danificou o quadro de comando do portão de garagem e variador do elevador.",
      valor_estimado_danos: 1250.00,
      estado: "PARTICIPADO",
      observacoes: "Participação remetida à seguradora com orçamentos de substituição de componentes."
    }
  ]);

  // Selected fraction modal for email notification
  const [notifModalFracao, setNotifModalFracao] = useState<Fracao | null>(null);
  const [novoSinistroModalOpen, setNovoSinistroModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Check if a fraction's insurance is expired or missing/unreceived
  const checkSeguroStatus = (f: Fracao): "EXPIRADO" | "POR_RECEBER" | "VALIDO" => {
    if (!f.apolice_num || f.apolice_num.trim() === "" || !f.seguradora) {
      return "POR_RECEBER";
    }
    if (!f.apolice_validade) {
      return "POR_RECEBER";
    }
    const valDate = new Date(f.apolice_validade);
    const now = new Date();
    if (valDate < now) {
      return "EXPIRADO";
    }
    return "VALIDO";
  };

  const fracoesExpiradasOuPendentes = predioFracoes.filter(f => checkSeguroStatus(f) !== "VALIDO");

  const handleEnviarPedidoApolice = (fracao: Fracao) => {
    triggerSendReaction("email", `A enviar notificação de apólice de seguro: Fração ${fracao.fracao_nome}`, () => {
      showToast(`📧 Notificação legal enviada com sucesso para o condómino da Fração ${fracao.fracao_nome}!`);
      setNotifModalFracao(null);
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="gestao-sinistros-seguros-view">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500 flex items-center gap-3 animate-fade-in text-xs font-bold">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 p-6 sm:p-7 rounded-3xl text-white shadow-xl border border-emerald-500/30 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Gestão de Seguros & Sinistros
            </span>
            <span className="text-xs text-slate-400 font-mono">Artigo 1429.º do Código Civil</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Seguro Obrigatório de Incêndio & Gestão de Sinistros
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Controlo rigoroso das apólices de seguro contra o risco de incêndio de cada fração e das partes comuns do edifício, com alertas em caso de caducidade e acompanhamento de sinistros.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 relative z-10">
          <div className="inline-flex rounded-2xl border border-emerald-500/30 bg-slate-900/90 p-1 text-xs shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab("apolices_fracoes")}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === "apolices_fracoes" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-300 hover:text-white"
              }`}
            >
              Apólices das Frações ({predioFracoes.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sinistros")}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === "sinistros" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-300 hover:text-white"
              }`}
            >
              Sinistros Ativos ({sinistros.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("apolice_predio")}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === "apolice_predio" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-300 hover:text-white"
              }`}
            >
              Seguro das Partes Comuns
            </button>
          </div>
        </div>
      </div>

      {/* Global Alert for Expired/Missing Insurance Policies */}
      {fracoesExpiradasOuPendentes.length > 0 && (
        <div className="border-l-4 border-red-600 bg-red-50 dark:bg-red-950/40 p-4 sm:p-5 rounded-r-3xl border border-r-red-200 dark:border-r-red-900 border-y-red-200 dark:border-y-red-900 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-lg uppercase tracking-wider shrink-0 flex items-center gap-1.5 mt-0.5">
              <AlertTriangle className="h-4 w-4" />
              <span>Atenção!</span>
            </div>
            <div>
              <h4 className="font-black text-sm text-red-950 dark:text-red-200">
                {fracoesExpiradasOuPendentes.length} Fração(ões) com Seguro de Incêndio Fora de Validade ou Por Receber!
              </h4>
              <p className="text-xs text-red-800 dark:text-red-300 mt-0.5 max-w-3xl leading-relaxed">
                Nos termos do <strong>Artigo 1429.º do Código Civil</strong>, é obrigatório o seguro contra o risco de incêndio do edifício. A administração deve exigir anualmente o envio do comprovativo de renovação ou contratar o seguro pelo valor fixado pela assembleia a expensas do proprietário.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerSendReaction("email", "A notificar todas as frações com seguro em falta/expirado", () => {
                showToast(`📧 Enviados avisos automáticos para as ${fracoesExpiradasOuPendentes.length} frações em incumprimento!`);
              });
            }}
            className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-all shrink-0 cursor-pointer flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            <span>Notificar Frações em Falta</span>
          </button>
        </div>
      )}

      {/* Tab 1: Fraction Insurance List with Visual Red Bracket "Atenção!" */}
      {activeTab === "apolices_fracoes" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                  Registo Individual de Apólices por Fração
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Total de Frações: {predioFracoes.length} • Em Falta: {fracoesExpiradasOuPendentes.length}
              </span>
            </div>

            {predioFracoes.map((fracao) => {
              const status = checkSeguroStatus(fracao);
              const isExpiredOrMissing = status !== "VALIDO";

              return (
                <div 
                  key={fracao.id_fracao}
                  className={`p-4 sm:p-5 transition-colors ${
                    isExpiredOrMissing ? "bg-red-50/30 dark:bg-red-950/20" : "hover:bg-slate-50/50 dark:hover:bg-slate-850/50"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Fraction & Owner Info */}
                    <div className="flex items-start gap-3.5">
                      <div className={`p-3 rounded-2xl border shrink-0 ${
                        isExpiredOrMissing 
                          ? "bg-red-100 text-red-700 border-red-200" 
                          : "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                      }`}>
                        {isExpiredOrMissing ? <ShieldAlert className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">
                            Fração {fracao.fracao_nome} ({fracao.piso})
                          </h4>
                          <span className="text-xs text-slate-400 font-mono">
                            {fracao.proprietario?.nome || "Vago"}
                          </span>
                        </div>

                        {/* Red Bracket Callout for Expired or Unreceived */}
                        {isExpiredOrMissing && (
                          <div className="border-l-4 border-red-600 bg-red-50 dark:bg-red-950/60 pl-3 py-1 pr-2 rounded-r-lg my-1 flex items-center gap-2">
                            <span className="bg-red-600 text-white font-black text-[9px] px-1.5 py-0.2 rounded uppercase">
                              Atenção!
                            </span>
                            <span className="text-xs font-bold text-red-900 dark:text-red-200">
                              {status === "POR_RECEBER" 
                                ? "Apólice de Seguro por Receber / Não Apresentada!" 
                                : `Seguro Obrigatório Fora de Validade (Expirou a ${fracao.apolice_validade})!`}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
                          <span>Seguradora: <strong className="text-slate-700 dark:text-slate-200">{fracao.seguradora || "Não fornecida"}</strong></span>
                          <span>•</span>
                          <span>Nº Apólice: <strong className="text-slate-700 dark:text-slate-200">{fracao.apolice_num || "Pendente"}</strong></span>
                          <span>•</span>
                          <span>Validade: <strong className={isExpiredOrMissing ? "text-red-600 font-bold" : "text-emerald-600 font-bold"}>{fracao.apolice_validade || "Sem data"}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 self-end lg:self-center">
                      <button
                        type="button"
                        onClick={() => setNotifModalFracao(fracao)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isExpiredOrMissing 
                            ? "bg-red-600 hover:bg-red-700 text-white shadow-xs" 
                            : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>{isExpiredOrMissing ? "Notificar Imediatamente" : "Solicitar Renovação"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Claims (Sinistros) Workflow */}
      {activeTab === "sinistros" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-500" />
                <span>Processos de Sinistro em Curso no Edifício</span>
              </h3>
              <p className="text-xs text-slate-400">Acompanhamento de peritagens, estimativas de danos e indemnizações seguradoras.</p>
            </div>

            <button
              type="button"
              onClick={() => setNovoSinistroModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Participar Novo Sinistro</span>
            </button>
          </div>

          <div className="space-y-3">
            {sinistros.map(sinistro => (
              <div 
                key={sinistro.id_sinistro}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs bg-slate-900 text-white dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 rounded-xl">
                      {sinistro.id_sinistro}
                    </span>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">
                      {sinistro.tipo_sinistro === "INUNDACAO_AGUA" ? "💧 Inundação / Danos por Água" :
                       sinistro.tipo_sinistro === "DANOS_ELETRICOS" ? "⚡ Danos Elétricos / Sobretensão" :
                       sinistro.tipo_sinistro === "INCENDIO" ? "🔥 Sinistro de Incêndio" : "🛡️ Sinistro Geral"}
                    </h4>
                    {sinistro.fracao_nome && (
                      <span className="text-xs text-slate-500 font-bold">• Fração {sinistro.fracao_nome}</span>
                    )}
                  </div>

                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                    sinistro.estado === "REPARACAO_EM_CURSO" ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" :
                    sinistro.estado === "PARTICIPADO" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" :
                    "bg-emerald-100 text-emerald-800"
                  }`}>
                    {sinistro.estado.replace(/_/g, " ")}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  "{sinistro.descricao_danos}"
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl text-xs font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans">Nº Processo Seguradora</span>
                    <strong className="text-slate-800 dark:text-slate-200">{sinistro.num_processo_sinistro}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans">Peritagem</span>
                    <span className="text-slate-700 dark:text-slate-300">{sinistro.perito_nome || "Pendente"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans">Estimativa Danos / Indemnização</span>
                    <strong className="text-emerald-600 font-black">{sinistro.valor_estimado_danos.toFixed(2)} €</strong>
                  </div>
                </div>

                {sinistro.observacoes && (
                  <p className="text-[11px] text-slate-400 italic">
                    ℹ️ {sinistro.observacoes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Building Common Insurance Policy */}
      {activeTab === "apolice_predio" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-500" />
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                Apólice Multirriscos Condomínio (Partes Comuns)
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
              ✓ Em Vigor até {apoliceEdificio.validade_fim}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Companhia de Seguros</span>
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">{apoliceEdificio.seguradora}</h4>
              <span className="text-xs font-mono text-emerald-600 font-bold block">Apólice: {apoliceEdificio.num_apolice}</span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Capital Seguro Edifício</span>
              <h4 className="font-black text-base text-slate-900 dark:text-white font-mono">{apoliceEdificio.capital_seguro_edificio.toLocaleString("pt-PT")} €</h4>
              <span className="text-xs text-slate-500">Resp. Civil: {apoliceEdificio.capital_responsabilidade_civil.toLocaleString("pt-PT")} €</span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Prémio Anual / Mediador</span>
              <h4 className="font-black text-base text-slate-900 dark:text-white font-mono">{apoliceEdificio.premio_anual.toFixed(2)} € / ano</h4>
              <span className="text-xs text-slate-500">{apoliceEdificio.mediador}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Coberturas Contratadas</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {apoliceEdificio.coberturas.map((cob, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="font-medium text-slate-700 dark:text-slate-200">{cob}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Enviar Solicitação de Apólice ao Condómino */}
      {notifModalFracao && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-zoom-in">
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center border-b border-emerald-500/30">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-400" />
                <div>
                  <h3 className="font-bold text-sm leading-tight">Solicitação de Comprovativo de Seguro</h3>
                  <span className="text-xs text-slate-300">Fração {notifModalFracao.fracao_nome} • {notifModalFracao.proprietario?.nome}</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setNotifModalFracao(null)} 
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="border-l-4 border-red-600 bg-red-50 dark:bg-red-950/60 p-3 rounded-r-xl">
                <p className="font-bold text-red-900 dark:text-red-200">
                  Aviso de Cumprimento do Artigo 1429.º do Código Civil
                </p>
                <p className="text-[11px] text-red-800 dark:text-red-300 mt-0.5">
                  Será enviado um e-mail formal solicitando a cópia da apólice em vigor ou do recibo de pagamento anual da Fração {notifModalFracao.fracao_nome}.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-slate-700 dark:text-slate-300">
                <div className="font-bold text-slate-900 dark:text-white">Destinatário:</div>
                <div className="font-mono">{notifModalFracao.proprietario?.email || "email.condomino@exemplo.pt"}</div>
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  "Exmo.(a) Sr.(a) {notifModalFracao.proprietario?.nome}, solicitamos a apresentação do comprovativo de renovação da apólice de seguro contra o risco de incêndio da Fração {notifModalFracao.fracao_nome}, para efeitos de atualização do arquivo legal do condomínio."
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNotifModalFracao(null)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleEnviarPedidoApolice(notifModalFracao)}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="h-4 w-4" />
                  <span>Enviar Notificação</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
