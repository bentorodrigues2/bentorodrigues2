import React, { useState, useEffect } from "react";

interface SendingReactionModalProps {
  isOpen?: boolean;
  type?: "email" | "mensagem";
  onComplete?: () => void;
  title?: string;
}

// Global trigger helper so any component can invoke sending reactions easily
export function triggerSendReaction(type: "email" | "mensagem", title?: string, callback?: () => void) {
  window.dispatchEvent(
    new CustomEvent("TRIGGER_SEND_REACTION", {
      detail: { type, title, callback }
    })
  );
}

export const SendingReactionModal: React.FC<SendingReactionModalProps> = ({
  isOpen: propsIsOpen = false,
  type: propsType = "email",
  onComplete: propsOnComplete,
  title: propsTitle
}) => {
  const [globalState, setGlobalState] = useState<{
    isOpen: boolean;
    type: "email" | "mensagem";
    title?: string;
    callback?: () => void;
  }>({
    isOpen: false,
    type: "email"
  });

  const [phase, setPhase] = useState<"sending" | "success">("sending");

  // Listen for global custom events
  useEffect(() => {
    const handleGlobalTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<{
        type: "email" | "mensagem";
        title?: string;
        callback?: () => void;
      }>;
      if (customEvent.detail) {
        setGlobalState({
          isOpen: true,
          type: customEvent.detail.type || "email",
          title: customEvent.detail.title,
          callback: customEvent.detail.callback
        });
      }
    };

    window.addEventListener("TRIGGER_SEND_REACTION", handleGlobalTrigger);
    return () => {
      window.removeEventListener("TRIGGER_SEND_REACTION", handleGlobalTrigger);
    };
  }, []);

  const activeIsOpen = propsIsOpen || globalState.isOpen;
  const activeType = propsIsOpen ? propsType : globalState.type;
  const activeTitle = propsIsOpen ? propsTitle : globalState.title;

  useEffect(() => {
    if (activeIsOpen) {
      setPhase("sending");
      const timer1 = setTimeout(() => {
        setPhase("success");
      }, 1500);

      const timer2 = setTimeout(() => {
        if (propsIsOpen && propsOnComplete) {
          propsOnComplete();
        }
        if (globalState.isOpen && globalState.callback) {
          globalState.callback();
        }
        setGlobalState(prev => ({ ...prev, isOpen: false }));
      }, 3300);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [activeIsOpen, propsIsOpen, propsOnComplete, globalState.isOpen, globalState.callback]);

  if (!activeIsOpen) return null;

  const htmlSrc = phase === "sending"
    ? "/a-enviar.html"
    : activeType === "email"
    ? "/email-enviado-sucesso.html"
    : "/mensagem-enviada-sucesso.html";

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-[9999] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden w-full max-w-sm flex flex-col items-center p-6 text-center text-white">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-4">
          {activeTitle || (phase === "sending" ? "A Processar Envio..." : activeType === "email" ? "E-mail Enviado" : "Mensagem Enviada")}
        </h4>
        
        <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 mb-4 relative">
          <iframe 
            src={htmlSrc} 
            className="w-full h-full border-0" 
            title="Reação Envio"
          />
        </div>

        <p className="text-xs text-slate-400 font-medium">
          {phase === "sending" 
            ? "A comunicar com os servidores e canais de notificação..." 
            : activeType === "email"
            ? "E-mail entregue com sucesso aos destinatários."
            : "Mensagem entregue no canal interno do condómino."
          }
        </p>
      </div>
    </div>
  );
};


