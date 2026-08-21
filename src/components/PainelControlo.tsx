const PainelControlo = () => {
import React from "react";
import { Predio, Conta, Fracao, Movimento, Aviso } from "../types";
import { exportToXLS } from "../utils";
import { 
  Building, DoorOpen, Users, FileText, Hammer, Brush, 
  Wallet, Truck, MessageSquare, Brain, Sparkles, 
  AlertTriangle, BarChart2
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface PainelControloProps {
  predio: Predio;
  contas: Conta[];
  fracoes: Fracao[];
  movements: Movimento[];
  avisos: Aviso[];
  ocorrenciasCount?: number;
  reservasCount?: number;
  mensagensCount?: number;
  notificacoesCount?: number;
  onSelectSection?: (section: string) => void;
}

export function PainelControlo({ 
  predio, 
  contas, 
  fracoes, 
  movements, 
  avisos,
  ocorrenciasCount = 2,
  reservasCount = 1,
  mensagensCount = 2,
  notificacoesCount = 4,
  onSelectSection
}: PainelControloProps) {

  // Global list references derived from props
  const predioFracoes = fracoes.filter(f => f.id_predio === predio.id_predio);
  const predioMovements = movements.filter(m => m.id_predio === predio.id_predio);
  const predioAvisos = avisos.filter(a => a.id_predio === predio.id_predio);

  // Calculate dynamic stats
  const totalFundoReserva = predioMovements
    .filter(m => m.categoria === "Fundo de Reserva")
    .reduce((acc, curr) => acc + (curr.tipo === "Receita" || curr.tipo === "RECEITA" ? curr.valor : -curr.valor), 0);

  const totalSaldoCaixa = predioMovements
    .reduce((acc, curr) => acc + (curr.tipo === "Receita" || curr.tipo === "RECEITA" ? curr.valor : -curr.valor), 0);

  // Mock data for Recharts Chart
  const chartData = [
    { name: "Jan", Receitas: 1200, Despesas: 900 },
    { name: "Fev", Receitas: 1400, Despesas: 1100 },
    { name: "Mar", Receitas: 1200, Despesas: 1300 },
    { name: "Abr", Receitas: 1800, Despesas: 950 },
    { name: "Mai", Receitas: 1900, Despesas: 1500 },
    { name: "Jun", Receitas: 1500, Despesas: 1200 },
    { name: "Jul", Receitas: 2400, Despesas: 1700 }
  ];

  return (
    <div className="space-y-6">
      {/* 13 MANDATORY INDICATORS (FROM DOCUMENT I, PAGE 2 & 3) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[#333] uppercase tracking-wider">MÃ³dulo de AdministraÃ§Ã£o: Os 13 Indicadores Ativos</h4>
          <span className="text-[10px] text-slate-400 font-medium">Clique em qualquer indicador para navegar para o mÃ³dulo</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {[
            { name: "PrÃ©dios Ativos", val: "1 EdifÃ­cio", icon: "/modulos/01-predio.png", section: "predios" },
            { name: "CondÃ³minos", val: `${predioFracoes.length} FraÃ§Ãµes`, icon: "/modulos/07-fracao.png", section: "fracoes" },
            { name: "Inquilinos", val: `${predioFracoes.filter(f => f.is_arrendada).length} Ativos`, icon: "/modulos/12-inquilino.png", section: "fracoes_perfis" },
            { name: "IntervenÃ§Ãµes", val: `${ocorrenciasCount} Registadas`, icon: "/modulos/28-intervencao.png", section: "manutencao_intervencoes" },
            { name: "Obras Gerais", val: "1 Ativa", icon: "/modulos/41-obra.png", section: "manutencao_extraordinarias" },
            { name: "Escala Limpeza", val: "3 Ãreas", icon: "/modulos/50-limpeza.png", section: "vistorias_limpezas" },
            { name: "Documentos IA", val: "4 Arquivados", icon: "/modulos/27-arquivo-automatico.png", section: "documentos" },
            { name: "CobranÃ§as", val: `${predioAvisos.filter(a => a.estado === 'Pendente').length} Pendentes`, icon: "/modulos/60-nota-de-cobranca.png", section: "financeiro_relatorios" },
            { name: "Alertas JurÃ­dicos", val: "1 Ativo", icon: "/modulos/23-contrato.png", section: "contencioso_juridico" },
            { name: "Contratos Fornecedores", val: "2 Ativos", icon: "/modulos/67-fornecedor.png", section: "fornecedores" },
            { name: "Sondagens IA", val: "1 Ativa", icon: "/modulos/76-sondagem.png", section: "comunicacao_sondagens" },
            { name: "Fundo Reserva", val: `${totalFundoReserva.toLocaleString("pt-PT")} â‚¬`, icon: "/modulos/64-saldo.png", section: "financeiro_extratos" },
            { name: "Saldo em Caixa", val: `${totalSaldoCaixa.toLocaleString("pt-PT")} â‚¬`, icon: "/modulos/57-quota.png", section: "movimentos" }
          ].map((ind, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectSection?.(ind.section)}
              className="w-full h-[115px] bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#064E3B] border border-[#A7F3D0] rounded-2xl flex flex-col items-center justify-between text-center p-2.5 relative select-none hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
            >
              <img src={ind.icon} alt={ind.name} className="h-9 w-9 object-contain mb-0.5 shrink-0 rounded-lg drop-shadow-xs" />
              <div className="flex flex-col items-center leading-none">
                <span className="text-[10px] font-black text-[#064E3B] leading-tight block truncate max-w-full text-center uppercase tracking-tight">{ind.name}</span>
              </div>
              <span className="bg-white/95 text-[#064E3B] border border-[#6EE7B7] text-[8.5px] font-black px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider truncate max-w-[92%] leading-none">
                {ind.val}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Row: Chart + IA Alerts Side-by-Side to eliminate extra scrolling */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800">TransparÃªncia OrÃ§amental e Fluxo de Caixa</h3>
              <p className="text-xs text-slate-400">Receitas de quotas vs. despesas de manutenÃ§Ã£o no ano corrente.</p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">Ano 2026</span>
          </div>
          <div className="h-48 text-xs font-bold">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="Receitas" stroke="#10b981" fillOpacity={1} fill="url(#colorRec)" strokeWidth={2} />
                <Area type="monotone" dataKey="Despesas" stroke="#ef4444" fillOpacity={1} fill="url(#colorDes)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* IA Assistente & Alerts (Immediately visible, no artificial scroll barrier) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between min-h-[250px]">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span>IA Assistente AutomÃ¡tico</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">ReconciliaÃ§Ã£o e alertas pendentes de validaÃ§Ã£o.</p>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-2 text-xs bg-amber-50 border border-amber-100 p-2.5 rounded-lg text-amber-800">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                <div>
                  <span className="font-bold block">Quotas em Atraso</span>
                  <span>A fraÃ§Ã£o D possui 3 quotas em falta. CobranÃ§a extrajudicial recomendada.</span>
                </div>
              </div>
              <div className="flex items-start space-x-2 text-xs bg-indigo-50 border border-indigo-100 p-2.5 rounded-lg text-indigo-800">
                <Brain className="h-4 w-4 shrink-0 text-indigo-500 mt-0.5" />
                <div>
                  <span className="font-bold block">AnÃ¡lise de Contratos</span>
                  <span>O contrato de Limpeza expira em 30 dias. IA sugere rever o reajuste de 2%.</span>
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={() => alert("Resumo IA gerado e enviado para a caixa de correio da administraÃ§Ã£o.")}
            className="mt-4 w-full bg-[#1A1A1A] hover:bg-[#333] text-white font-bold py-2 rounded-lg text-xs cursor-pointer flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Gerar RelatÃ³rio de IA</span>
          </button>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">TransaÃ§Ãµes e Movimentos de Caixa</h3>
            <p className="text-xs text-slate-400">LanÃ§amentos confirmados e reconciliados recentemente.</p>
          </div>
          <button 
            onClick={() => exportToXLS("Saldos_Movimentos", ["Data", "Tipo", "Descricao", "Valor"], predioMovements.map(m=>[m.data, m.tipo, m.descricao, m.valor.toString()]))} 
            title="Exportar Excel"
            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-xs"
          >
            <img src="/modulos/66-exportacao-financeira.png" alt="Excel" className="h-6 w-6 object-contain" onError={(e) => { e.currentTarget.src = "/modulos/26-exportacao.png"; }} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-150 text-slate-400 font-bold">
                <th className="py-2">Data</th>
                <th className="py-2">Tipo</th>
                <th className="py-2">DescriÃ§Ã£o</th>
                <th className="py-2">Categoria</th>
                <th className="py-2 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {predioMovements.slice(0, 5).map((m) => (
                <tr key={m.id_mov} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="py-2.5 font-mono text-slate-500">{m.data}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                      m.tipo === "Receita" || m.tipo === "RECEITA" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                    }`}>
                      {m.tipo}
                    </span>
                  </td>
                  <td className="py-2.5 font-medium text-slate-700">{m.descricao}</td>
                  <td className="py-2.5 text-slate-500">{m.categoria}</td>
                  <td className={`py-2.5 text-right font-bold ${
                    m.tipo === "Receita" || m.tipo === "RECEITA" ? "text-emerald-600" : "text-red-600"
                  }`}>
                    {m.tipo === "Receita" || m.tipo === "RECEITA" ? "+" : "-"}{m.valor.toFixed(2)} â‚¬
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


};

export default PainelControlo;
