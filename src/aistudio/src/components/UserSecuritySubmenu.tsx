import React, { useState } from "react";
import { Shield, Lock, Fingerprint, Volume2, VolumeX, Bell, Smartphone, Mail, MessageSquare, Check, ChevronDown, ChevronUp, Play } from "lucide-react";
import { ActionIcon } from "./ActionIcon";

interface UserSecuritySubmenuProps {
  userEmail: string;
  userRole: string;
  biometricsEnabled?: boolean;
  setBiometricsEnabled?: (val: boolean) => void;
  setSimulatingScan?: (val: boolean) => void;
  setSimulatingScanProgress?: React.Dispatch<React.SetStateAction<number>>;
  className?: string;
}

export const UserSecuritySubmenu: React.FC<UserSecuritySubmenuProps> = ({
  userEmail,
  userRole,
  biometricsEnabled = false,
  setBiometricsEnabled,
  setSimulatingScan,
  setSimulatingScanProgress,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Redefinição de Password
  const [currentPass, setCurrentPass] = useState<string>("");
  const [newPass, setNewPass] = useState<string>("");
  const [confirmPass, setConfirmPass] = useState<string>("");
  const [passMsg, setPassMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Gestão de Som e Vibração
  const [soundAppEnabled, setSoundAppEnabled] = useState<boolean>(true);
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);

  // Som da Notificação
  const [selectedNotificationSound, setSelectedNotificationSound] = useState<string>("CondoManager Padronizado");

  // Tipos de Notificação & Edição
  const [pushEnabled, setPushEnabled] = useState<boolean>(true);
  const [emailEnabled, setEmailEnabled] = useState<boolean>(true);
  const [smsEnabled, setSmsEnabled] = useState<boolean>(true);
  const [popupEnabled, setPopupEnabled] = useState<boolean>(true);

  const [contactEmail, setContactEmail] = useState<string>(userEmail || "usuario@condomanager.pt");
  const [contactSms, setContactSms] = useState<string>("+351 912 345 678");
  const [notifyMsg, setNotifyMsg] = useState<string | null>(null);

  // Play synthetic tone preview for notification sounds
  const handleTestSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (selectedNotificationSound.includes("Suave")) {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      } else if (selectedNotificationSound.includes("Cristalino")) {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.2);
      } else if (selectedNotificationSound.includes("Sino")) {
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.4);
      } else if (selectedNotificationSound.includes("Silencioso")) {
        return;
      } else {
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(650, ctx.currentTime + 0.25);
      }

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.log("AudioContext playback simulation failed or restricted");
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);

    if (!newPass || newPass.length < 8) {
      setPassMsg({ type: "error", text: "A nova password deve conter pelo menos 8 caracteres!" });
      return;
    }
    if (newPass !== confirmPass) {
      setPassMsg({ type: "error", text: "A confirmação da password não coincide!" });
      return;
    }

    setPassMsg({ type: "success", text: "Password redefinida com sucesso no perfil!" });
    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
  };

  const handleToggleBiometrics = () => {
    if (setBiometricsEnabled && setSimulatingScan && setSimulatingScanProgress) {
      if (!biometricsEnabled) {
        setSimulatingScan(true);
        setSimulatingScanProgress(0);
        const interval = setInterval(() => {
          setSimulatingScanProgress(p => {
            if (p >= 100) {
              clearInterval(interval);
              setBiometricsEnabled(true);
              setTimeout(() => {
                setSimulatingScan(false);
                alert("Dados biométricos registados e ativados com sucesso!");
              }, 600);
              return 100;
            }
            return p + 25;
          });
        }, 150);
      } else {
        setBiometricsEnabled(false);
        alert("Acesso biométrico desativado com sucesso.");
      }
    } else {
      alert(biometricsEnabled ? "Biometria desativada." : "Biometria ativada com sucesso no perfil!");
    }
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setNotifyMsg("Preferências de notificação e contactos guardados com sucesso!");
    setTimeout(() => setNotifyMsg(null), 3000);
  };

  return (
    <div className={`border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs transition-all ${className}`}>
      {/* Accordion Header Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3.5 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white flex items-center justify-between cursor-pointer transition-all hover:brightness-110"
      >
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-xl bg-slate-950 text-emerald-400 flex items-center justify-center border border-emerald-500/40 p-1 shrink-0 shadow-xs">
            <img src="/estados-acoes/18-seguranca.png" alt="Segurança" className="h-5 w-5 object-contain" />
          </div>
          <div className="text-left">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xs tracking-tight block">Segurança</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[8px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-widest">
                Submenu
              </span>
            </div>
            <span className="text-[9px] text-slate-400 block">Password, Biometria, Sons e Notificações</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-emerald-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expandable Content Panel */}
      {isOpen && (
        <div className="p-4 space-y-5 text-xs border-t border-slate-100 dark:border-slate-800 animate-fade-in">
          
          {/* 1. REDEFINIÇÃO DE PASSWORD */}
          <div className="space-y-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2 text-slate-800 dark:text-white font-extrabold text-[11px] uppercase tracking-wider">
              <Lock className="h-3.5 w-3.5 text-emerald-500" />
              <span>1. Redefinição de Password</span>
            </div>

            {passMsg && (
              <div className={`p-2 rounded-lg text-[10px] font-bold ${passMsg.type === "success" ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200" : "bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200"}`}>
                {passMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-2">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Password Atual</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-xl text-slate-800 dark:text-white text-[10px] focus:outline-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Nova Password</label>
                  <input
                    type="password"
                    placeholder="Mínimo 8 carateres"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-xl text-slate-800 dark:text-white text-[10px] focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Confirmar Password</label>
                  <input
                    type="password"
                    placeholder="Repita a password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-xl text-slate-800 dark:text-white text-[10px] focus:outline-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-xs"
              >
                Atualizar Password de Acesso
              </button>
            </form>
          </div>

          {/* 2. ATIVAÇÃO DOS DADOS BIOMÉTRICOS */}
          <div className="space-y-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2 text-slate-800 dark:text-white font-extrabold text-[11px] uppercase tracking-wider">
              <Fingerprint className="h-3.5 w-3.5 text-emerald-500" />
              <span>2. Ativação de Dados Biométricos</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <Fingerprint className="h-4.5 w-4.5" />
                </div>
                <div className="text-left">
                  <span className="font-extrabold text-[10px] text-slate-800 dark:text-white block">Face ID / Touch ID / Biometria</span>
                  <span className="text-[8px] text-slate-400">Autenticação rápida e encriptada no dispositivo</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleBiometrics}
                className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  biometricsEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    biometricsEnabled ? "translate-x-4.5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 3. GESTÃO DE SOM E VIBRAÇÃO */}
          <div className="space-y-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2 text-slate-800 dark:text-white font-extrabold text-[11px] uppercase tracking-wider">
              <Volume2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>3. Gestão de Som e Vibração</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Som do App */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {soundAppEnabled ? <Volume2 className="h-3.5 w-3.5 text-emerald-500" /> : <VolumeX className="h-3.5 w-3.5 text-slate-400" />}
                  <span className="font-extrabold text-[9.5px] text-slate-700 dark:text-slate-300">Som da Aplicação</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSoundAppEnabled(!soundAppEnabled)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    soundAppEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-800"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${soundAppEnabled ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>

              {/* Vibração Hática */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="font-extrabold text-[9.5px] text-slate-700 dark:text-slate-300">Vibração / Resposta Tátil</span>
                </div>
                <button
                  type="button"
                  onClick={() => setVibrationEnabled(!vibrationEnabled)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    vibrationEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-800"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${vibrationEnabled ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>
            </div>
          </div>

          {/* 4. SOM DA NOTIFICAÇÃO */}
          <div className="space-y-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-800 dark:text-white font-extrabold text-[11px] uppercase tracking-wider">
                <Bell className="h-3.5 w-3.5 text-emerald-500" />
                <span>4. Som da Notificação</span>
              </div>
              <button
                type="button"
                onClick={handleTestSound}
                className="text-[9px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-lg font-extrabold flex items-center space-x-1 hover:bg-emerald-100 cursor-pointer"
              >
                <Play className="h-2.5 w-2.5" />
                <span>Testar Som</span>
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase block">Selecione o Tom de Alerta</label>
              <select
                value={selectedNotificationSound}
                onChange={(e) => setSelectedNotificationSound(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-lg text-[10px] font-bold text-slate-800 dark:text-white focus:outline-emerald-500"
              >
                <option value="CondoManager Padronizado">🔔 CondoManager Padronizado (Recomendado)</option>
                <option value="Melodia Suave">🎵 Melodia Suave (Gentle Chime)</option>
                <option value="Alerta Cristalino">⚡ Alerta Cristalino (Crystal Tone)</option>
                <option value="Sino Clássico">🏛️ Sino Clássico (Church Bell)</option>
                <option value="Silencioso">🔕 Silencioso (Sem Som)</option>
              </select>
            </div>
          </div>

          {/* 5. TIPO DE NOTIFICAÇÃO (COM EDIÇÃO DE CANAIS & CONTACTOS) */}
          <div className="space-y-2.5">
            <div className="flex items-center space-x-2 text-slate-800 dark:text-white font-extrabold text-[11px] uppercase tracking-wider">
              <Mail className="h-3.5 w-3.5 text-emerald-500" />
              <span>5. Tipo de Notificação (Canais & Edição)</span>
            </div>

            {notifyMsg && (
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 text-[10px] font-bold">
                {notifyMsg}
              </div>
            )}

            <form onSubmit={handleSaveNotifications} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Push */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-3.5 w-3.5 text-emerald-500" />
                    <div>
                      <span className="font-extrabold text-[9.5px] text-slate-700 dark:text-slate-300 block">Notificações Push</span>
                      <span className="text-[8px] text-slate-400">Dispositivo móvel</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPushEnabled(!pushEnabled)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      pushEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-800"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${pushEnabled ? "translate-x-4" : "translate-x-0"}`} />
                  </button>
                </div>

                {/* Pop-up In-App */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-3.5 w-3.5 text-emerald-500" />
                    <div>
                      <span className="font-extrabold text-[9.5px] text-slate-700 dark:text-slate-300 block">Alertas Pop-up</span>
                      <span className="text-[8px] text-slate-400">Avisos urgentes na tela</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPopupEnabled(!popupEnabled)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      popupEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-800"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${popupEnabled ? "translate-x-4" : "translate-x-0"}`} />
                  </button>
                </div>
              </div>

              {/* Email Notification Channel & Editable Field */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="font-extrabold text-[10px] text-slate-800 dark:text-white">Notificações por E-mail</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailEnabled(!emailEnabled)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      emailEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-800"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${emailEnabled ? "translate-x-4" : "translate-x-0"}`} />
                  </button>
                </div>

                {emailEnabled && (
                  <div>
                    <label className="text-[8px] font-bold text-slate-400 uppercase block mb-1">E-mail para Receber Alertas</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-lg text-[10px] font-bold text-slate-800 dark:text-white focus:outline-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* SMS Notification Channel & Editable Field */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="font-extrabold text-[10px] text-slate-800 dark:text-white">Notificações por SMS / Urgência</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSmsEnabled(!smsEnabled)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      smsEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-800"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${smsEnabled ? "translate-x-4" : "translate-x-0"}`} />
                  </button>
                </div>

                {smsEnabled && (
                  <div>
                    <label className="text-[8px] font-bold text-slate-400 uppercase block mb-1">Telemóvel de Receção SMS</label>
                    <input
                      type="text"
                      value={contactSms}
                      onChange={(e) => setContactSms(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-lg text-[10px] font-bold text-slate-800 dark:text-white focus:outline-emerald-500"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <img src="/estados-acoes/04-concluido.png" alt="Guardar" className="h-4 w-4 object-contain inline-block" />
                <span>Guardar Preferências de Notificação</span>
              </button>
            </form>
          </div>

          {/* 6. PREFERÊNCIAS DE NOTIFICAÇÕES WEBPUSH (SUPABASE NOTIFICATION_PREFERENCES) */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-800 dark:text-white font-extrabold text-[11px] uppercase tracking-wider">
                <Bell className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                <span>6. Notificações WebPush (Modelo PWA)</span>
              </div>
              <span className="text-[8px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                Supabase Sync
              </span>
            </div>

            <p className="text-[9.5px] text-slate-400 leading-snug">
              Configuração fina do modelo WebPush no dispositivo. As notificações críticas mantêm-se sempre ativas para garantia de segurança e legalidade.
            </p>

            {/* Categorias Críticas (Obrigatórias / Padrão True) */}
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-amber-300 font-extrabold text-[10px]">
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-triangle-exclamation text-amber-400"></i>
                  Notificações Críticas (Sempre Ativas por Padrão)
                </span>
                <span className="text-[8px] bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.5 rounded">Obrigatório</span>
              </div>

              <div className="grid grid-cols-1 gap-1.5 text-[9.5px]">
                <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-amber-400 font-bold">🚨 Ocorrências Urgentes</span>
                    <span className="text-[8px] text-slate-400">(Avarias graves, fugas de água)</span>
                  </div>
                  <span className="text-[9px] font-black text-emerald-400 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Ativo
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-amber-400 font-bold">🏛️ Assembleias de Condóminos</span>
                    <span className="text-[8px] text-slate-400">(Convocatórias e atas)</span>
                  </div>
                  <span className="text-[9px] font-black text-emerald-400 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Ativo
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-amber-400 font-bold">📁 Documentos Importantes</span>
                    <span className="text-[8px] text-slate-400">(Apólices de seguro, relatórios)</span>
                  </div>
                  <span className="text-[9px] font-black text-emerald-400 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Ativo
                  </span>
                </div>
              </div>
            </div>

            {/* Categorias Opcionais (Padrão False) */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
              <span className="text-slate-300 font-extrabold text-[10px] block">
                ⚙️ Notificações Opcionais (Configuração do Utilizador)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[9.5px]">
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-200 block">💰 Finanças & Quotas</span>
                    <span className="text-[8px] text-slate-400">Alertas de pagamentos e prazos</span>
                  </div>
                  <input type="checkbox" defaultChecked={false} className="h-4 w-4 accent-emerald-500 rounded cursor-pointer" />
                </div>

                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-200 block">📅 Reservas de Espaços</span>
                    <span className="text-[8px] text-slate-400">Aprovações de salões e churrasqueiras</span>
                  </div>
                  <input type="checkbox" defaultChecked={false} className="h-4 w-4 accent-emerald-500 rounded cursor-pointer" />
                </div>

                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-200 block">🧹 Higienização & Limpeza</span>
                    <span className="text-[8px] text-slate-400">Relatórios e passagens de equipa</span>
                  </div>
                  <input type="checkbox" defaultChecked={false} className="h-4 w-4 accent-emerald-500 rounded cursor-pointer" />
                </div>

                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-200 block">📢 Avisos Gerais</span>
                    <span className="text-[8px] text-slate-400">Informações comunitárias de rotina</span>
                  </div>
                  <input type="checkbox" defaultChecked={false} className="h-4 w-4 accent-emerald-500 rounded cursor-pointer" />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert("✅ Preferências WebPush sincronizadas com a tabela notification_preferences no Supabase!")}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center space-x-1.5"
            >
              <Check className="h-3.5 w-3.5 text-white" />
              <span>Sincronizar Tabela notification_preferences</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
