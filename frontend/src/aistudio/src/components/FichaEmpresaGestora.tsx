import React, { useState } from "react";
import { Predio, LoggedUser, Fornecedor } from "../types";
import { 
  Building2, 
  Users, 
  Palette, 
  ShieldAlert, 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Image as ImageIcon, 
  Camera, 
  Plus, 
  Check, 
  ExternalLink 
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";

interface FichaEmpresaGestoraProps {
  predios: Predio[];
  loggedUser: LoggedUser;
  onUpdateBrandingColor?: (color: string) => void;
  activeColor?: string;
  onUpdateBrandingLogo?: (logoUrl: string) => void;
  activeLogo?: string;
}

export function FichaEmpresaGestora({
  predios,
  loggedUser,
  onUpdateBrandingColor,
  activeColor = "emerald",
  onUpdateBrandingLogo,
  activeLogo
}: FichaEmpresaGestoraProps) {
  const [gestoraName, setGestoraName] = useState("Gestão Forte Administrações Lda");
  const [gestoraNif, setGestoraNif] = useState("509483726");
  const [gestoraEmail, setGestoraEmail] = useState("contacto@gestaoforte.pt");
  const [gestoraTelefone, setGestoraTelefone] = useState("210 987 654");
  const [gestoraWebsite, setGestoraWebsite] = useState("https://www.gestaoforte.pt");
  
  // Custom mock teams
  const [teams, setTeams] = useState([
    { id: "t-1", nome: "Dra. Filipa Vasconcelos", cargo: "Gestora de Portfólio Geral", email: "filipa.v@gestaoforte.pt", fone: "912 345 678", status: "Disponível" },
    { id: "t-2", nome: "Carlos Lima", cargo: "Gestor Técnico Operacional", email: "carlos.l@gestaoforte.pt", fone: "912 876 543", status: "Em Vistoria" },
    { id: "t-3", nome: "Eng. Rui Melo", cargo: "Perito de Vistorias Estruturais", email: "rui.melo@vistoriasegura.pt", fone: "931 445 566", status: "Disponível" },
    { id: "t-4", nome: "Maria Silva", cargo: "Supervisora de Higienização", email: "maria.s@limpezasestrela.pt", fone: "967 889 900", status: "Em Serviço" }
  ]);
  const [newMemberNome, setNewMemberNome] = useState("");
  const [newMemberCargo, setNewMemberCargo] = useState("Gestor de Condomínio");

  // Custom mock contracts with suppliers
  const [contracts, setContracts] = useState([
    { id: "c-1", fornecedor: "Pinturas Lis Lda", servico: "Impermeabilização & Fachadas", valor: 18500, prazo: "15-12-2026", estado: "Adjudicado" },
    { id: "c-2", fornecedor: "Otis Elevadores Portugal", servico: "Manutenção Preventiva de Elevadores", valor: 3400, prazo: "Anual (Recorrente)", estado: "Ativo" },
    { id: "c-3", fornecedor: "Segurança Total S.A.", servico: "CCTV & Alarmes de Incêndio", valor: 1200, prazo: "31-03-2027", estado: "Ativo" }
  ]);

  // Logo WebP or custom user uploaded image
  const [gestoraLogo, setGestoraLogo] = useState<string>(() => {
    return activeLogo || localStorage.getItem("whiteLabelLogo") || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100%' height='100%' fill='%23059669'/><text x='50%' y='55%' font-family='sans-serif' font-size='24' font-weight='black' fill='%23ffffff' dominant-baseline='middle' text-anchor='middle'>GF</text></svg>";
  });

  const [isDragging, setIsDragging] = useState(false);

  React.useEffect(() => {
    if (activeLogo) {
      setGestoraLogo(activeLogo);
    }
  }, [activeLogo]);

  const handleLogoFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecione um ficheiro de imagem válido (WebP, PNG, JPG).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const MAX_WIDTH = 800; // Optimal size for high quality logo

        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        const webpUrl = canvas.toDataURL("image/webp", 0.85);

        setGestoraLogo(webpUrl);
        localStorage.setItem("whiteLabelLogo", webpUrl);
        if (onUpdateBrandingLogo) {
          onUpdateBrandingLogo(webpUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoFile(e.dataTransfer.files[0]);
    }
  };

  // Color picker state for live branding
  const brandingColors = [
    { id: "emerald", name: "Esmeralda", class: "bg-emerald-600 hover:bg-emerald-700" },
    { id: "indigo", name: "Índigo", class: "bg-indigo-600 hover:bg-indigo-700" },
    { id: "blue", name: "Azul Clássico", class: "bg-blue-600 hover:bg-blue-700" },
    { id: "violet", name: "Violeta", class: "bg-violet-600 hover:bg-violet-700" },
    { id: "teal", name: "Teal", class: "bg-teal-600 hover:bg-teal-700" }
  ];

  const handleAddTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberNome) return;
    const novo = {
      id: "t-user-" + Date.now(),
      nome: newMemberNome,
      cargo: newMemberCargo,
      email: `${newMemberNome.toLowerCase().replace(/\s+/g, ".")}@gestaoforte.pt`,
      fone: "912 " + Math.floor(100000 + Math.random() * 900000),
      status: "Disponível"
    };
    setTeams([...teams, novo]);
    setNewMemberNome("");
    alert("Novo membro da equipa interna adicionado com sucesso!");
  };

  // Aggregated KPIs calculation across all managed buildings
  const totalPrediosCount = predios.length;
  const totalFracoesCount = totalPrediosCount * 12; // Assuming ~12 per building on average
  const totalFaturacaoMensal = totalPrediosCount * 2450; 
  const totalFaturacaoEmAtraso = totalPrediosCount * 450;
  const totalTaxaInadimplencia = ((totalFaturacaoEmAtraso / totalFaturacaoMensal) * 100).toFixed(1);

  // Recharts data representing global portfolio financial evolution
  const globalFinancialHistory = [
    { mes: "Jan", Receita: 4800 * totalPrediosCount, Despesa: 3200 * totalPrediosCount, Extraordinario: 500 * totalPrediosCount },
    { mes: "Fev", Receita: 4900 * totalPrediosCount, Despesa: 3400 * totalPrediosCount, Extraordinario: 800 * totalPrediosCount },
    { mes: "Mar", Receita: 5100 * totalPrediosCount, Despesa: 4100 * totalPrediosCount, Extraordinario: 1200 * totalPrediosCount },
    { mes: "Abr", Receita: 5200 * totalPrediosCount, Despesa: 3800 * totalPrediosCount, Extraordinario: 1500 * totalPrediosCount },
    { mes: "Mai", Receita: 5400 * totalPrediosCount, Despesa: 3900 * totalPrediosCount, Extraordinario: 900 * totalPrediosCount },
    { mes: "Jun", Receita: 5600 * totalPrediosCount, Despesa: 4200 * totalPrediosCount, Extraordinario: 2400 * totalPrediosCount },
    { mes: "Jul", Receita: 5800 * totalPrediosCount, Despesa: 4000 * totalPrediosCount, Extraordinario: 1800 * totalPrediosCount }
  ];

  // Portfolio allocation by building size
  const portfolioDistribution = [
    { name: "Prédios de Luxo", value: Math.ceil(totalPrediosCount * 0.4), color: "#10b981" },
    { name: "Prédios Residenciais M", value: Math.ceil(totalPrediosCount * 0.4), color: "#3b82f6" },
    { name: "Garagens / Outros", value: Math.ceil(totalPrediosCount * 0.2), color: "#f59e0b" }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* GLOBAL SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Prédios Administrados</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white font-mono">{totalPrediosCount}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Frações Totais</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white font-mono">{totalFracoesCount}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Faturação de Portfolio</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white font-mono">{(totalFaturacaoMensal).toLocaleString()} €<span className="text-xs font-medium text-slate-400">/mês</span></span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Inadimplência Global</span>
            <span className="text-2xl font-black text-red-600 dark:text-red-400 font-mono">{totalTaxaInadimplencia} %</span>
          </div>
        </div>
      </div>

      {/* PORTFOLIO AGGREGATED BI CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center">
              <TrendingUp className="h-4.5 w-4.5 mr-2 text-indigo-500" /> Saúde Financeira Consolidada do Portfólio
            </h3>
            <span className="text-[10px] font-bold text-slate-400">EVOLUÇÃO DOS ÚLTIMOS 7 MESES</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={globalFinancialHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="mes" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10, pt: 10 }} />
                <Area type="monotone" dataKey="Receita" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRec)" name="Receitas Ordinárias" />
                <Area type="monotone" dataKey="Despesa" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorDes)" name="Despesas Totais" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center">
              <Briefcase className="h-4.5 w-4.5 mr-2 text-emerald-500" /> Segmentação de Prédios
            </h3>
          </div>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolioDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {portfolioDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 pt-1 text-xs">
            {portfolioDistribution.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="flex items-center text-slate-600 dark:text-slate-400 font-medium">
                  <span className="h-2.5 w-2.5 rounded-full mr-2 block" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </span>
                <span className="font-bold text-slate-800 dark:text-white font-mono">{item.value} Prédios</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BRANDING WHITE LABEL PORTAL & CONTRACTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* EDIT PROFILE & WHITE LABEL BRANDING */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm lg:col-span-2 space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center">
              <Palette className="h-4.5 w-4.5 mr-2 text-amber-500" /> Branding & Identidade Visual (White-Label)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Logo webp simulated preview */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`space-y-2 text-center border-2 p-4 rounded-xl transition-colors duration-200 ${
                isDragging 
                  ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20" 
                  : "border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20"
              }`}
            >
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Logótipo da Empresa</span>
              <div className="h-24 w-24 rounded-2xl mx-auto overflow-hidden shadow-sm flex items-center justify-center border bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800">
                <img src={gestoraLogo} alt="Gestora Logo" className="object-contain h-full w-full max-h-full max-w-full p-1" referrerPolicy="no-referrer" />
              </div>
              
              <div className="pt-1">
                <label 
                  htmlFor="gestora-logo-input" 
                  className="inline-flex text-[10px] bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold px-3 py-1.5 rounded-lg items-center space-x-1 cursor-pointer border dark:border-slate-700 transition-colors"
                >
                  <Camera className="h-3 w-3 mr-1" /> 
                  <span>Selecionar Imagem</span>
                </label>
                <input 
                  id="gestora-logo-input"
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleLogoFile(e.target.files[0]);
                    }
                  }}
                />
                <p className="text-[8px] text-slate-400 mt-1.5">Arraste a imagem aqui ou clique para procurar (WebP, PNG, JPG)</p>
              </div>
            </div>

            {/* Profile fields */}
            <div className="md:col-span-2 space-y-3.5">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Nome de Marca</label>
                  <input 
                    type="text" 
                    value={gestoraName}
                    onChange={e => setGestoraName(e.target.value)}
                    className="border border-slate-200 dark:border-slate-800 dark:bg-slate-950 p-2 text-xs rounded-lg dark:text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">NIF Coletivo</label>
                  <input 
                    type="text" 
                    value={gestoraNif}
                    onChange={e => setGestoraNif(e.target.value)}
                    className="border border-slate-200 dark:border-slate-800 dark:bg-slate-950 p-2 text-xs rounded-lg dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">E-mail Corporativo</label>
                  <input 
                    type="email" 
                    value={gestoraEmail}
                    onChange={e => setGestoraEmail(e.target.value)}
                    className="border border-slate-200 dark:border-slate-800 dark:bg-slate-950 p-2 text-xs rounded-lg dark:text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Telefone de Apoio</label>
                  <input 
                    type="text" 
                    value={gestoraTelefone}
                    onChange={e => setGestoraTelefone(e.target.value)}
                    className="border border-slate-200 dark:border-slate-800 dark:bg-slate-950 p-2 text-xs rounded-lg dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Color theme chooser (white label live colors) */}
          <div className="border-t border-slate-100 dark:border-slate-850 pt-4 space-y-3">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Esquema de Cores do Portal de Marca (Branding)</span>
            <div className="flex flex-wrap gap-3">
              {brandingColors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => onUpdateBrandingColor && onUpdateBrandingColor(color.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold text-white flex items-center space-x-2 transition-all cursor-pointer ${color.class} ${activeColor === color.id ? "ring-4 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900 scale-105" : "opacity-80 hover:opacity-100"}`}
                >
                  {activeColor === color.id && <Check className="h-3.5 w-3.5" />}
                  <span>{color.name}</span>
                </button>
              ))}
            </div>
            <p className="text-[9px] text-slate-400 italic">Ao selecionar uma cor, o CondoManager adapta automaticamente todo o portal do administrador e dos condóminos com as cores institucionais da Empresa Gestora.</p>
          </div>
        </div>

        {/* EXTERNAL TEAM MANAGEMENT */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center">
              <Users className="h-4.5 w-4.5 mr-2 text-indigo-500" /> Equipas Internas
            </h3>
            <span className="text-[10px] font-bold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{teams.length}</span>
          </div>

          <form onSubmit={handleAddTeamMember} className="flex gap-2">
            <input 
              type="text" 
              required
              value={newMemberNome}
              onChange={e => setNewMemberNome(e.target.value)}
              placeholder="Nome do Operador..."
              className="flex-grow border border-slate-200 dark:border-slate-800 dark:bg-slate-950 px-2.5 py-1 text-xs rounded-lg dark:text-white"
            />
            <select 
              value={newMemberCargo}
              onChange={e => setNewMemberCargo(e.target.value)}
              className="border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs rounded-lg cursor-pointer px-2 dark:text-white"
            >
              <option value="Gestor de Condomínio">Gestor</option>
              <option value="Técnico Vistorias">Técnico</option>
              <option value="Operador Higienização">Limpezas</option>
            </select>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-1.5 cursor-pointer flex items-center justify-center shrink-0">
              <Plus className="h-4.5 w-4.5" />
            </button>
          </form>

          <div className="divide-y divide-slate-50 dark:divide-slate-800 max-h-60 overflow-y-auto space-y-2.5">
            {teams.map((member) => (
              <div key={member.id} className="pt-2 text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800 dark:text-white block">{member.nome}</span>
                  <span className="text-[10px] text-slate-400 block">{member.cargo} • {member.email}</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${member.status === "Disponível" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                  {member.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONTRACT LOGS & ACTIVE SUPPLIERS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center">
            <FileText className="h-4.5 w-4.5 mr-2 text-teal-500" /> Carteira de Fornecedores Associados & Contratos
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/60 text-slate-400 uppercase font-black text-[9px] tracking-wider">
                <th className="py-2.5">Fornecedor</th>
                <th className="py-2.5">Serviço/Obra</th>
                <th className="py-2.5 text-right">Valor Contrato</th>
                <th className="py-2.5">Validade</th>
                <th className="py-2.5 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
              {contracts.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 font-bold text-slate-800 dark:text-white flex items-center">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2 shrink-0"></span>
                    {c.fornecedor}
                  </td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{c.servico}</td>
                  <td className="py-3 text-right font-bold text-slate-900 dark:text-white font-mono">{c.valor.toLocaleString()} €</td>
                  <td className="py-3 text-slate-400">{c.prazo}</td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${c.estado === "Ativo" ? "bg-emerald-50 text-emerald-700" : "bg-indigo-50 text-indigo-700"}`}>
                      {c.estado}
                    </span>
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
