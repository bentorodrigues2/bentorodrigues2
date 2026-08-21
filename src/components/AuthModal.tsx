import React from "react";
// import removido — authService.ts não existe

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess?: (email: string) => void;
// linha removida — função inexistente
}

// linha removida — função inexistente
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white h-8 w-8 rounded-full border border-slate-700 flex items-center justify-center font-bold text-sm shadow-lg transition-colors cursor-pointer"
          title="Fechar Portal"
        >
          âœ•
        </button>

        <AuthForm 
          onLoginSuccess={(email) => {
            if (onLoginSuccess) {
              onLoginSuccess(email);
            }
          }}
// linha removida — função inexistente
        />
      </div>
    </div>
  );
}

