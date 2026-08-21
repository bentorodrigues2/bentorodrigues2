import { useState } from "react";

export default function AuthForm() {
  const [showWarning, setShowWarning] = useState(false);
  const [showSupabaseLogs, setShowSupabaseLogs] = useState(false);

  return (
    <div className="auth-form-container">

      {/* Aviso */}
      {showWarning && (
        <div className="warning-box">
          <span>Aviso importante</span>
          <button
            type="button"
            className="text-red-400 hover:text-white shrink-0 ml-1 font-bold"
            title="Fechar aviso"
            onClick={() => setShowWarning(false)}
          >
            ?
          </button>
        </div>
      )}

      {/* Botão Supabase Logs */}
      <button
        type="button"
        className="supabase-logs-button"
        onClick={() => setShowSupabaseLogs(!showSupabaseLogs)}
      >
        <span>?? Logs Supabase</span>
      </button>

      {/* Secção Supabase Logs */}
      {showSupabaseLogs && (
        <div className="supabase-logs-section">
          <p>Logs do Supabase aqui…</p>
        </div>
      )}

    </div>
  );
}
