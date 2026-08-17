import React, { useState, useEffect, useRef } from "react";
import { Predio, LoggedUser } from "../types";
import { cpLookup } from "../data";

interface GestaoPrediosProps {
  predios: Predio[];
  onAddPredio: (novoPredio: Predio) => void;
  onUpdatePredio: (updatedPredio: Predio) => void;
  onDeletePredio?: (idPredio: string) => void;
  loggedUser: LoggedUser;
}

export function GestaoPredios({ predios, onAddPredio, onUpdatePredio, onDeletePredio, loggedUser }: GestaoPrediosProps) {
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");

  // Main Component Tab State
  const [mainTab, setMainTab] = useState<"cadastro" | "regras">("cadastro");

  // Regras do Prédio (Regulamento Automático) State
  const [regras, setRegras] = useState(() => {
    return {
      silencio: "Proibido ruído e música alta entre as 22:00 e as 08:00 nos dias úteis, e entre as 23:00 e as 09:00 nos fins de semana e feriados.",
      animais: "Permitidos no máximo 2 animais de pequeno/médio porte por fração. Uso obrigatório de trela nas áreas comuns. Limpeza imediata de dejeções.",
      obras: "Obras ruidosas permitidas apenas em dias úteis das 09:00 às 18:00. Obrigatoriedade de avisar a vizinhança no hall com 48h de antecedência.",
      estacionamento: "Estacionamento exclusivo no lugar afeto à fração. Cargas e descargas na zona comum limitadas a 30 minutos.",
      lixo: "Deposição de resíduos domésticos nos contentores das 20:00 às 22:00. Separação obrigatória nos ecopontos comuns.",
      areasComuns: "Reserva da Sala Comum e Churrasqueira com 24h de antecedência. Lotação máxima da Piscina: 12 pessoas; Ginásio: 4 pessoas."
    };
  });

  // AI Validation State for Pedidos
  const [pedidoTexto, setPedidoTexto] = useState("");
  const [validandoPedido, setValidandoPedido] = useState(false);
  const [resultadoValidacao, setResultadoValidacao] = useState<{
    decisao: "Aprovado" | "Aprovado com Condições" | "Rejeitado";
    motivos: string[];
    regrasAplicadas: string[];
    recomendacaoIA: string;
  } | null>(null);

  const handleValidarPedidoIA = () => {
    if (!pedidoTexto.trim()) return alert("Descreva o pedido ou pretensão do condómino.");
    setValidandoPedido(true);
    setResultadoValidacao(null);

    setTimeout(() => {
      const q = pedidoTexto.toLowerCase();
      let decisao: "Aprovado" | "Aprovado com Condições" | "Rejeitado" = "Aprovado";
      const motivos: string[] = [];
      const regrasAplicadas: string[] = [];

      if (q.includes("festa") || q.includes("música") || q.includes("barulho") || q.includes("23h") || q.includes("24h") || q.includes("noite") || q.includes("madrugada")) {
        regrasAplicadas.push("Regra de Silêncio (22h-08h úteis / 23h-09h fds)");
        if (q.includes("23h") || q.includes("24h") || q.includes("madrugada") || q.includes("música alta")) {
          decisao = "Rejeitado";
          motivos.push("Viola o horário de descanso regulamentar do prédio (Artº 1º - Silêncio).");
        } else {
          decisao = "Aprovado com Condições";
          motivos.push("Música em volume moderado e encerramento rigoroso até às 22:00.");
        }
      }

      if (q.includes("obra") || q.includes("furar") || q.includes("partir") || q.includes("remodelação")) {
        regrasAplicadas.push("Regra de Obras (09h-18h dias úteis)");
        if (q.includes("domingo") || q.includes("sábado") || q.includes("noite")) {
          decisao = "Rejeitado";
          motivos.push("Obras ruidosas são estritamente proibidas aos fins de semana e noites.");
        } else {
          if (decisao !== "Rejeitado") decisao = "Aprovado com Condições";
          motivos.push("Fixar aviso prévio no hall com 48h de antecedência e respeitar o horário 09h-18h.");
        }
      }

      if (q.includes("cão") || q.includes("gato") || q.includes("animal") || q.includes("pet")) {
        regrasAplicadas.push("Regra de Animais de Estimação");
        motivos.push("Manter o animal com trela nas zonas comuns e assegurar a higienização imediata.");
        if (decisao === "Aprovado") decisao = "Aprovado com Condições";
      }

      if (q.includes("piscina") || q.includes("sala") || q.includes("churrasqueira") || q.includes("reserva")) {
        regrasAplicadas.push("Regra de Uso de Áreas Comuns");
        if (q.includes("30 pessoas") || q.includes("40 pessoas") || q.includes("multidão")) {
          decisao = "Rejeitado";
          motivos.push("Excede a lotação máxima de segurança permitida para as zonas comuns.");
        } else {
          motivos.push("Efetuar a reserva com 24h de antecedência na PWA e efetuar limpeza pós-evento.");
          if (decisao === "Aprovado") decisao = "Aprovado com Condições";
        }
      }

      if (motivos.length === 0) {
        motivos.push("O pedido está em inteira conformidade com o Regulamento Geral do Condomínio.");
      }

      setResultadoValidacao({
        decisao,
        motivos,
        regrasAplicadas: regrasAplicadas.length > 0 ? regrasAplicadas : ["Regulamento Geral do Condomínio"],
        recomendacaoIA: decisao === "Rejeitado"
          ? "A IA recomenda notificar o condómino sobre a impossibilidade legal de autorizar o pedido nos moldes solicitados."
          : decisao === "Aprovado com Condições"
          ? "A IA recomenda enviar termo de responsabilidade com as condições especificadas."
          : "O pedido pode ser deferido automaticamente com notificação na PWA."
      });

      setValidandoPedido(false);
    }, 600);
  };

  // Form states
  const [selectedPredioId, setSelectedPredioId] = useState<string | null>(predios[0]?.id_predio || null);
  const [nome, setNome] = useState("");
  const [moradaLinha1, setMoradaLinha1] = useState("");
  const [moradaLinha2, setMoradaLinha2] = useState("");
  const [numPorta, setNumPorta] = useState("");
  const [letraPorta, setLetraPorta] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [localidade, setLocalidade] = useState("");
  const [nif, setNif] = useState("");
  const [foto, setFoto] = useState<string | null>(null);

  const [elevador, setElevador] = useState(false);
  const [numElevadores, setNumElevadores] = useState(0);
  const [garagem, setGaragem] = useState(false);
  const [piscina, setPiscina] = useState(false);
  const [salaComum, setSalaComum] = useState(false);
  const [arrecadacoes, setArrecadacoes] = useState(false);
  const [jardins, setJardins] = useState(false);
  const [churrasqueira, setChurrasqueira] = useState(false);
  const [terraco, setTerraco] = useState(false);
  const [ginasio, setGinasio] = useState(false);
  const [spa, setSpa] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // When selectedPredioId changes, load building data into form
  useEffect(() => {
    if (selectedPredioId) {
      const p = predios.find(item => item.id_predio === selectedPredioId);
      if (p) {
        setNome(p.nome || "");
        setMoradaLinha1(p.morada_linha1 || "");
        setMoradaLinha2(p.morada_linha2 || "");
        setNumPorta(p.num_porta || "");
        setLetraPorta(p.letra_porta || "");
        setCodigoPostal(p.codigo_postal || "");
        setLocalidade(p.localidade || "");
        setNif(p.nif || "");
        setFoto(p.foto || null);

        setElevador(!!p.patrimonio?.tem_elevador);
        setNumElevadores(p.patrimonio?.num_elevadores || 0);
        setGaragem(!!p.patrimonio?.tem_garagem);
        setPiscina(!!p.patrimonio?.tem_piscina);
        setSalaComum(!!p.patrimonio?.tem_sala_comum);
        setArrecadacoes(!!p.patrimonio?.tem_arrecadacoes_comuns);
        setJardins(!!p.patrimonio?.tem_jardins);
        setChurrasqueira(!!p.patrimonio?.tem_churrasqueira);
        setTerraco(!!p.patrimonio?.tem_terraco);
        setGinasio(!!p.patrimonio?.tem_ginasio);
        setSpa(!!p.patrimonio?.tem_spa);
      }
    } else {
      // Clear form for new building
      limparFormulario();
    }
  }, [selectedPredioId, predios]);

  const limparFormulario = () => {
    setSelectedPredioId(null);
    setNome("");
    setMoradaLinha1("");
    setMoradaLinha2("");
    setNumPorta("");
    setLetraPorta("");
    setCodigoPostal("");
    setLocalidade("");
    setNif("");
    setFoto(null);
    setElevador(false);
    setNumElevadores(0);
    setGaragem(false);
    setPiscina(false);
    setSalaComum(false);
    setArrecadacoes(false);
    setJardins(false);
    setChurrasqueira(false);
    setTerraco(false);
    setGinasio(false);
    setSpa(false);
  };

  useEffect(() => {
    const cleanCP = codigoPostal.trim();
    if (cpLookup[cleanCP]) {
      setLocalidade(cpLookup[cleanCP]);
    }
  }, [codigoPostal]);

  const processarImagemPredio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        const webpDataUrl = canvas.toDataURL("image/webp", 0.85);
        setFoto(webpDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const submeterForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (loggedUser.role !== 'ADMIN') {
      alert("Apenas administradores podem gerir o cadastro de prédios!");
      return;
    }
    if (!moradaLinha1 || !numPorta || !codigoPostal || !localidade || !nif) {
      alert("Preencha todos os campos obrigatórios (*)");
      return;
    }

    const patrimonioObj = {
      tem_elevador: elevador,
      num_elevadores: elevador ? Number(numElevadores) : 0,
      tem_garagem: garagem,
      tem_piscina: piscina,
      tem_sala_comum: salaComum,
      tem_arrecadacoes_comuns: arrecadacoes,
      tem_jardins: jardins,
      tem_churrasqueira: churrasqueira,
      tem_terraco: terraco,
      tem_ginasio: ginasio,
      tem_spa: spa
    };

    if (selectedPredioId) {
      // Editing existing building
      const updated: Predio = {
        id_predio: selectedPredioId,
        nome: nome || null,
        morada_linha1: moradaLinha1,
        morada_linha2: moradaLinha2 || null,
        num_porta: numPorta,
        letra_porta: letraPorta || null,
        codigo_postal: codigoPostal,
        localidade,
        nif,
        foto,
        patrimonio: patrimonioObj
      };
      onUpdatePredio(updated);
      alert("Cadastro do prédio atualizado com sucesso!");
    } else {
      // Creating new building
      const novo: Predio = {
        id_predio: "predio-" + Date.now(),
        nome: nome || null,
        morada_linha1: moradaLinha1,
        morada_linha2: moradaLinha2 || null,
        num_porta: numPorta,
        letra_porta: letraPorta || null,
        codigo_postal: codigoPostal,
        localidade,
        nif,
        foto,
        patrimonio: patrimonioObj
      };
      onAddPredio(novo);
      setSelectedPredioId(novo.id_predio);
      alert("Novo prédio cadastrado com sucesso!");
    }
  };

  const handleRemoverPredio = (idPredio: string) => {
    if (loggedUser.role !== 'ADMIN') {
      alert("Apenas administradores podem remover prédios!");
      return;
    }
    const target = predios.find(p => p.id_predio === idPredio);
    const nameStr = target?.nome || `${target?.morada_linha1}, Nº ${target?.num_porta}`;
    if (confirm(`Tem a certeza de que deseja remover o prédio "${nameStr}" do cadastro?`)) {
      if (onDeletePredio) {
        onDeletePredio(idPredio);
      }
      limparFormulario();
    }
  };

  // Filter predios by search query
  const prediosFiltrados = predios.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nomeStr = (p.nome || "").toLowerCase();
    const moradaStr = (p.morada_linha1 || "").toLowerCase();
    const nifStr = (p.nif || "").toLowerCase();
    const cpStr = (p.codigo_postal || "").toLowerCase();
    const locStr = (p.localidade || "").toLowerCase();
    return nomeStr.includes(q) || moradaStr.includes(q) || nifStr.includes(q) || cpStr.includes(q) || locStr.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Navigation Bar */}
      <div className="bg-white text-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold">
            <img src="/modulos/01-predio.png" alt="Prédio" className="h-7 w-7 object-contain" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-slate-800">Gestão de Prédios & Regulamento Interno</h2>
            <p className="text-xs text-slate-500">Registos patrimoniais, áreas comuns e regras automáticas de convivência com validação IA.</p>
          </div>
        </div>

        <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setMainTab("cadastro")}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center space-x-2 ${
              mainTab === "cadastro" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <i className="fa-solid fa-city"></i>
            <span>Registos & Património</span>
          </button>
          <button
            type="button"
            onClick={() => setMainTab("regras")}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center space-x-2 ${
              mainTab === "regras" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <i className="fa-solid fa-gavel text-amber-500"></i>
            <span>Regras & Regulamento Automático (IA)</span>
          </button>
        </div>
      </div>

      {mainTab === "regras" ? (
        <div className="space-y-6 animate-fadeIn">
          {/* SECTION: Regras do Prédio Configurator */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                  <i className="fa-solid fa-gavel text-indigo-600"></i>
                  <span>Regulamento Automático do Condomínio ({nome || "Edifício Principal"})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Defina as normas do condomínio por tema. A Inteligência Artificial utiliza estas regras para validar automaticamente os pedidos dos condóminos.
                </p>
              </div>

              <button
                type="button"
                onClick={() => alert("Regulamento do Prédio atualizado com sucesso e sincronizado com o motor de validação da IA!")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs flex items-center space-x-2 shrink-0"
              >
                <i className="fa-solid fa-floppy-disk"></i>
                <span>Guardar Regulamento</span>
              </button>
            </div>

            {/* 6 Category Rules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* 1. Silêncio */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2 text-indigo-900 font-bold text-sm">
                  <i className="fa-solid fa-volume-xmark text-amber-500"></i>
                  <span>1. Regras de Silêncio</span>
                </div>
                <textarea
                  rows={3}
                  value={regras.silencio}
                  onChange={e => setRegras({ ...regras, silencio: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-indigo-500 font-sans"
                />
              </div>

              {/* 2. Animais */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2 text-indigo-900 font-bold text-sm">
                  <i className="fa-solid fa-dog text-emerald-500"></i>
                  <span>2. Regras de Animais</span>
                </div>
                <textarea
                  rows={3}
                  value={regras.animais}
                  onChange={e => setRegras({ ...regras, animais: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-indigo-500 font-sans"
                />
              </div>

              {/* 3. Obras */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2 text-indigo-900 font-bold text-sm">
                  <i className="fa-solid fa-hammer text-blue-500"></i>
                  <span>3. Regras de Obras</span>
                </div>
                <textarea
                  rows={3}
                  value={regras.obras}
                  onChange={e => setRegras({ ...regras, obras: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-indigo-500 font-sans"
                />
              </div>

              {/* 4. Estacionamento */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2 text-indigo-900 font-bold text-sm">
                  <i className="fa-solid fa-square-parking text-sky-500"></i>
                  <span>4. Regras de Estacionamento</span>
                </div>
                <textarea
                  rows={3}
                  value={regras.estacionamento}
                  onChange={e => setRegras({ ...regras, estacionamento: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-indigo-500 font-sans"
                />
              </div>

              {/* 5. Lixo */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2 text-indigo-900 font-bold text-sm">
                  <i className="fa-solid fa-trash-can text-teal-500"></i>
                  <span>5. Regras de Lixo & Resíduos</span>
                </div>
                <textarea
                  rows={3}
                  value={regras.lixo}
                  onChange={e => setRegras({ ...regras, lixo: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-indigo-500 font-sans"
                />
              </div>

              {/* 6. Áreas Comuns */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2 text-indigo-900 font-bold text-sm">
                  <i className="fa-solid fa-people-roof text-violet-500"></i>
                  <span>6. Regras de Áreas Comuns</span>
                </div>
                <textarea
                  rows={3}
                  value={regras.areasComuns}
                  onChange={e => setRegras({ ...regras, areasComuns: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-indigo-500 font-sans"
                />
              </div>
            </div>
          </div>

          {/* SECTION: Validador IA Automático de Pedidos */}
          <div className="bg-white text-slate-800 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold">
                  <i className="fa-solid fa-robot"></i>
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800">Validador Automático de Pedidos com IA</h4>
                  <p className="text-xs text-slate-500">Submeta um pedido de condómino para a IA analisar a conformidade regulamentar em tempo real.</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPedidoTexto("Quero fazer obras de remodelação na casa de banho no próximo domingo às 10h.")}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-medium cursor-pointer"
                >
                  Exemplo 1 (Obras no Domingo)
                </button>
                <button
                  type="button"
                  onClick={() => setPedidoTexto("Gostaria de reservar a Sala Comum para um almoço de aniversário no próximo sábado das 13h às 17h para 10 pessoas.")}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-medium cursor-pointer"
                >
                  Exemplo 2 (Reserva de Sala)
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <textarea
                rows={3}
                value={pedidoTexto}
                onChange={e => setPedidoTexto(e.target.value)}
                placeholder="Exemplo: 'Pretendo ter um cão de médio porte e colocá-lo a solta no pátio comum...' ou 'Quero fazer uma festa na piscina com música às 24h...'"
                className="w-full text-xs p-3 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl focus:outline-violet-500 font-sans"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleValidarPedidoIA}
                  disabled={validandoPedido}
                  className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center space-x-2"
                >
                  {validandoPedido ? (
                    <>
                      <i className="fa-solid fa-spinner animate-spin"></i>
                      <span>A Analisar Regulamento...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-wand-magic-sparkles"></i>
                      <span>Validar Pedido com IA</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {resultadoValidacao && (
              <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-slate-400">Resultado da Análise Regulamentar</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center space-x-1.5 ${
                    resultadoValidacao.decisao === "Aprovado"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : resultadoValidacao.decisao === "Aprovado com Condições"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}>
                    <i className={`fa-solid ${
                      resultadoValidacao.decisao === "Aprovado" ? "fa-circle-check" : resultadoValidacao.decisao === "Aprovado com Condições" ? "fa-circle-exclamation" : "fa-circle-xmark"
                    }`}></i>
                    <span>{resultadoValidacao.decisao}</span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-300">Regras do Prédio Aplicadas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {resultadoValidacao.regrasAplicadas.map((r, idx) => (
                      <span key={idx} className="bg-slate-700 text-slate-200 px-2 py-0.5 rounded text-[11px] font-mono">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-300 block">Fundamentação:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                    {resultadoValidacao.motivos.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-violet-950/40 border border-violet-800/50 rounded-lg text-xs text-violet-200 flex items-start space-x-2">
                  <i className="fa-solid fa-lightbulb text-amber-400 mt-0.5"></i>
                  <div>
                    <span className="font-bold block">Parecer Automático da IA:</span>
                    <span>{resultadoValidacao.recomendacaoIA}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* SECÇÃO 1: LISTA DE PRÉDIOS E FILTRO DINÂMICO DE PESQUISA */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-building text-blue-600"></i>
              <span>Registo de Prédios</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Lista de edifícios registados no sistema. Selecione um prédio para visualizar, editar ou remover.
            </p>
          </div>

          <button
            type="button"
            onClick={limparFormulario}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center space-x-1.5 shrink-0 self-start md:self-auto"
          >
            <i className="fa-solid fa-plus-circle"></i>
            <span>Registar Novo Prédio</span>
          </button>
        </div>

        {/* Filtro dinâmico de pesquisa */}
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-400 text-sm"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar prédio por nome, morada, NIF, código postal ou localidade..."
            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-10 py-2.5 text-xs rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>

        {/* Lista de Prédios (Lista Tabela e não em Cards) */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 uppercase font-black tracking-wider text-[10px]">
                  <th className="py-3 px-4">Edifício / Foto</th>
                  <th className="py-3 px-4">Morada & Localidade</th>
                  <th className="py-3 px-4">NIF</th>
                  <th className="py-3 px-4">Património Comum</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prediosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      <i className="fa-solid fa-building-circle-exclamation text-2xl mb-2 block"></i>
                      Nenhum prédio encontrado com os critérios de pesquisa.
                    </td>
                  </tr>
                ) : (
                  prediosFiltrados.map((p) => {
                    const isSelected = selectedPredioId === p.id_predio;
                    const displayName = p.nome || `${p.morada_linha1}, Nº ${p.num_porta}`;

                    return (
                      <tr
                        key={p.id_predio}
                        onClick={() => setSelectedPredioId(p.id_predio)}
                        className={`transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-50/80 font-semibold text-slate-900 border-l-4 border-l-blue-600"
                            : "hover:bg-slate-50/80 text-slate-700"
                        }`}
                      >
                        {/* Foto & Nome */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            {p.foto ? (
                              <img
                                src={p.foto}
                                alt={displayName}
                                className="h-10 w-12 rounded-lg object-cover border border-slate-200 shrink-0 shadow-2xs"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="h-10 w-12 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 border border-slate-700">
                                <i className="fa-solid fa-building text-base"></i>
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-800 text-xs">{displayName}</p>
                              <span className="text-[10px] text-slate-400 font-mono-custom">ID: {p.id_predio}</span>
                            </div>
                          </div>
                        </td>

                        {/* Morada */}
                        <td className="py-3 px-4 space-y-0.5">
                          <p className="text-slate-800 font-medium">
                            <i className="fa-solid fa-location-dot text-slate-400 mr-1.5 text-[10px]"></i>
                            {p.morada_linha1} Nº{p.num_porta} {p.letra_porta ? `(${p.letra_porta})` : ""}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono-custom pl-4">
                            {p.codigo_postal} {p.localidade}
                          </p>
                        </td>

                        {/* NIF */}
                        <td className="py-3 px-4 font-mono-custom font-bold text-slate-700">
                          {p.nif}
                        </td>

                        {/* Património */}
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {p.patrimonio?.tem_elevador && (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-1.5 py-0.5 rounded font-medium">
                                🛗 {p.patrimonio.num_elevadores || 1} Elevador
                              </span>
                            )}
                            {p.patrimonio?.tem_garagem && (
                              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] px-1.5 py-0.5 rounded font-medium">
                                🅿️ Garagem
                              </span>
                            )}
                            {p.patrimonio?.tem_piscina && (
                              <span className="bg-cyan-50 text-cyan-700 border border-cyan-200 text-[10px] px-1.5 py-0.5 rounded font-medium">
                                🏊 Piscina
                              </span>
                            )}
                            {p.patrimonio?.tem_sala_comum && (
                              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] px-1.5 py-0.5 rounded font-medium">
                                👥 Sala Comum
                              </span>
                            )}
                            {!p.patrimonio?.tem_elevador && !p.patrimonio?.tem_garagem && !p.patrimonio?.tem_piscina && !p.patrimonio?.tem_sala_comum && (
                              <span className="text-slate-400 text-[11px] font-normal">Básico</span>
                            )}
                          </div>
                        </td>

                        {/* Ações */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPredioId(p.id_predio);
                              }}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                                isSelected
                                  ? "bg-blue-600 text-white shadow-xs"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                              }`}
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                              <span>{isSelected ? "Em Edição" : "Editar"}</span>
                            </button>

                            {loggedUser.role === "ADMIN" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoverPredio(p.id_predio);
                                }}
                                className="px-2 py-1 rounded-md bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 text-[11px] font-bold transition-all cursor-pointer"
                                title="Remover Prédio"
                              >
                                <i className="fa-solid fa-trash-can"></i>
                              </button>
                            )}
                          </div>
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

      {/* SECÇÃO 2: FORMULÁRIO DE CADASTRO / EDIÇÃO / REMOÇÃO DO PRÉDIO SELECIONADO */}
      <form onSubmit={submeterForm} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <i className={`fa-solid ${selectedPredioId ? "fa-pen-to-square text-blue-600" : "fa-plus-circle text-emerald-600"}`}></i>
              <span>{selectedPredioId ? `Editar Registo do Prédio: ${nome || "Sem Nome"}` : "Registar Novo Prédio Administrado"}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedPredioId ? "Altere os dados gerais e patrimonio comum do edifício selecionado." : "Preencha as informações necessárias para registar um novo edifício."}
            </p>
          </div>

          {selectedPredioId && (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={limparFormulario}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all"
              >
                <i className="fa-solid fa-xmark mr-1"></i> Cancelar Edição
              </button>

              {loggedUser.role === "ADMIN" && (
                <button
                  type="button"
                  onClick={() => handleRemoverPredio(selectedPredioId)}
                  className="border-2 border-red-500 bg-red-50 hover:bg-red-100 active:bg-red-200 active:scale-95 text-red-700 font-bold px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer shadow-xs hover:shadow-md active:ring-2 active:ring-red-400 select-none flex items-center gap-1.5"
                  title="Eliminar este prédio do sistema"
                >
                  <img src="/estados-acoes/14-eliminar.png" alt="Eliminar" className="h-4 w-4 object-contain" />
                  <span>Eliminar</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1">Nome do Edifício (Facultativo)</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Se vazio, usa a morada" className="border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-blue-500" />
          </div>
          <div className="flex flex-col col-span-2">
            <label className="text-xs font-semibold text-slate-500 mb-1">Morada Linha 1 *</label>
            <input type="text" value={moradaLinha1} onChange={e => setMoradaLinha1(e.target.value)} placeholder="Rua Bento Rodrigues" className="border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-blue-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1">Morada Linha 2</label>
            <input type="text" value={moradaLinha2} onChange={e => setMoradaLinha2(e.target.value)} placeholder="Ex: Apt 2B" className="border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-blue-500" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1">Nº Porta *</label>
            <input type="text" value={numPorta} onChange={e => setNumPorta(e.target.value)} placeholder="Ex: 2" className="border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-blue-500" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1">Letra (Facultativo)</label>
            <input type="text" value={letraPorta} onChange={e => setLetraPorta(e.target.value)} placeholder="Ex: A" className="border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-blue-500" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1">NIF do Condomínio *</label>
            <input type="text" value={nif} onChange={e => setNif(e.target.value)} placeholder="Ex: 900123456" className="border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-blue-500 font-mono-custom" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1">Código Postal (Interativo) *</label>
            <input type="text" value={codigoPostal} onChange={e => setCodigoPostal(e.target.value)} placeholder="Ex: 2840-124 (para teste)" className="border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-blue-500 font-mono-custom" />
            <p className="text-[10px] text-slate-400 mt-1">Insira '2840-124' ou '2775-245' para autocompletar.</p>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1">Localidade *</label>
            <input type="text" value={localidade} readOnly className="border border-slate-200 bg-slate-100 px-3 py-2 text-sm rounded-lg focus:outline-none" placeholder="Preenchimento automático" />
          </div>
        </div>

        {/* Upload de Fotografia do Prédio */}
        <div className="pt-2">
          <label className="text-xs font-semibold text-slate-500 block mb-1">Fotografia do Prédio (Opcional)</label>
          <div className="flex items-center space-x-3">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 flex items-center space-x-2 cursor-pointer">
              <i className="fa-solid fa-camera"></i>
              <span>Carregar Foto (WebP Convert)</span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={processarImagemPredio} className="hidden" />
            {foto && (
              <div className="flex items-center space-x-2">
                <img src={foto} className="h-10 w-10 rounded object-cover border border-slate-300" referrerPolicy="no-referrer" />
                <span className="text-xs text-slate-500 font-medium font-mono-custom">Carregada</span>
                <button type="button" onClick={() => setFoto(null)} className="text-red-500 text-xs hover:underline cursor-pointer"><i className="fa-solid fa-trash"></i></button>
              </div>
            )}
          </div>
        </div>

        {/* Checklist de Ativação do Património Comum */}
        <div className="pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-600 block mb-3 uppercase tracking-wider">Património Comum (Ativação Dinâmica de Módulos)</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 font-semibold text-slate-700">
            <label className="flex items-center space-x-2.5 text-sm cursor-pointer select-none">
              <input type="checkbox" checked={elevador} onChange={e => setElevador(e.target.checked)} className="h-4 w-4 text-blue-600 rounded border-slate-300" />
              <span>Elevadores</span>
            </label>
            {elevador && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 font-mono-custom">Qtd:</span>
                <input type="number" min="1" value={numElevadores} onChange={e => setNumElevadores(Number(e.target.value))} className="border border-slate-200 px-2 py-1 text-xs rounded w-16 focus:outline-blue-500 font-mono-custom" />
              </div>
            )}
            <label className="flex items-center space-x-2.5 text-sm cursor-pointer select-none">
              <input type="checkbox" checked={garagem} onChange={e => setGaragem(e.target.checked)} className="h-4 w-4 text-blue-600 rounded border-slate-300" />
              <span>Garagem Comum</span>
            </label>
            <label className="flex items-center space-x-2.5 text-sm cursor-pointer select-none">
              <input type="checkbox" checked={piscina} onChange={e => setPiscina(e.target.checked)} className="h-4 w-4 text-blue-600 rounded border-slate-300" />
              <span>Piscina</span>
            </label>
            <label className="flex items-center space-x-2.5 text-sm cursor-pointer select-none">
              <input type="checkbox" checked={salaComum} onChange={e => setSalaComum(e.target.checked)} className="h-4 w-4 text-blue-600 rounded border-slate-300" />
              <span>Sala Comum / Reuniões</span>
            </label>
            <label className="flex items-center space-x-2.5 text-sm cursor-pointer select-none">
              <input type="checkbox" checked={arrecadacoes} onChange={e => setArrecadacoes(e.target.checked)} className="h-4 w-4 text-blue-600 rounded border-slate-300" />
              <span>Arrecadações Comuns</span>
            </label>
            <label className="flex items-center space-x-2.5 text-sm cursor-pointer select-none">
              <input type="checkbox" checked={jardins} onChange={e => setJardins(e.target.checked)} className="h-4 w-4 text-blue-600 rounded border-slate-300" />
              <span>Jardins/Espaços Verdes</span>
            </label>
            <label className="flex items-center space-x-2.5 text-sm cursor-pointer select-none">
              <input type="checkbox" checked={churrasqueira} onChange={e => setChurrasqueira(e.target.checked)} className="h-4 w-4 text-blue-600 rounded border-slate-300" />
              <span>Churrasqueira</span>
            </label>
            <label className="flex items-center space-x-2.5 text-sm cursor-pointer select-none">
              <input type="checkbox" checked={terraco} onChange={e => setTerraco(e.target.checked)} className="h-4 w-4 text-blue-600 rounded border-slate-300" />
              <span>Terraço</span>
            </label>
            <label className="flex items-center space-x-2.5 text-sm cursor-pointer select-none">
              <input type="checkbox" checked={ginasio} onChange={e => setGinasio(e.target.checked)} className="h-4 w-4 text-blue-600 rounded border-slate-300" />
              <span>Ginásio</span>
            </label>
            <label className="flex items-center space-x-2.5 text-sm cursor-pointer select-none">
              <input type="checkbox" checked={spa} onChange={e => setSpa(e.target.checked)} className="h-4 w-4 text-blue-600 rounded border-slate-300" />
              <span>Spa</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={limparFormulario}
            className="border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs flex items-center gap-2 select-none"
            title="Cancelar edição e voltar à lista de prédios"
          >
            <i className="fa-solid fa-xmark text-slate-500"></i>
            <span>Cancelar Edição</span>
          </button>

          <button
            type="submit"
            className="border-2 border-emerald-500 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 active:scale-95 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-md hover:shadow-lg active:ring-2 active:ring-emerald-400 select-none flex items-center gap-2"
            title="Gravar dados do prédio no sistema Condomanager AI"
          >
            <img 
              src="/estados-acoes/12-adicionar.png" 
              alt="Gravar" 
              className="h-5 w-5 object-contain" 
            />
            <span>Gravar</span>
          </button>
        </div>
      </form>
        </>
      )}
    </div>
  );
}
