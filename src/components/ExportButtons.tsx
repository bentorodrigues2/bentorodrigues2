import React from "react";

interface ExportButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  showLabel?: boolean;
}

export const ExportPdfButton: React.FC<ExportButtonProps> = ({ className, showLabel = false, ...props }) => (
  <button
    {...props}
    type="button"
    title="Exportar Documento PDF"
    className={`p-2 sm:p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-xs active:scale-95 text-red-500 font-extrabold text-xs ${className || ""}`}
  >
    <img 
      src="/marca/18-pdf.png" 
      alt="PDF" 
      className="h-6 w-6 object-contain shrink-0"
      onError={(e) => { e.currentTarget.src = "/modulos/80-pdf-de-resultados.png"; }}
    />
    {showLabel && <span>PDF</span>}
  </button>
);

export const ExportExcelButton: React.FC<ExportButtonProps> = ({ className, showLabel = false, ...props }) => (
  <button
    {...props}
    type="button"
    title="Exportar Planilha Excel"
    className={`p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-xs active:scale-95 text-emerald-500 font-extrabold text-xs ${className || ""}`}
  >
    <img 
      src="/modulos/66-exportacao-financeira.png" 
      alt="Excel" 
      className="h-6 w-6 object-contain shrink-0"
      onError={(e) => { e.currentTarget.src = "/modulos/26-exportacao.png"; }}
    />
    {showLabel && <span>Excel</span>}
  </button>
);
