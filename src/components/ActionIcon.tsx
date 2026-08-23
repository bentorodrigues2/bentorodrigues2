import React, { useState } from "react";

interface ActionIconProps {
  name: "seguranca" | "desligar" | "logout" | "sair" | "adicionar" | "eliminar" | "pdf" | "excel" | "guardar" | string;
  className?: string;
  size?: number;
}

export const ActionIcon: React.FC<ActionIconProps> = ({ name, className = "h-5 w-5", size }) => {
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const lowerName = name.toLowerCase();

  let sources: string[] = [];
  let fontAwesomeClass = "fa-solid fa-circle-info";
  let iconColor = "text-indigo-400";

  if (lowerName.includes("pdf")) {
    sources = ["/marca/18-pdf.png", "/modulos/80-pdf-de-resultados.png", "/modulos/25-relatorio.png"];
    fontAwesomeClass = "fa-solid fa-file-pdf";
    iconColor = "text-red-500";
  } else if (lowerName.includes("excel")) {
    sources = ["/modulos/66-exportacao-financeira.png", "/modulos/26-exportacao.png", "/modulos/89-exportacao-geral.png"];
    fontAwesomeClass = "fa-solid fa-file-excel";
    iconColor = "text-emerald-500";
  } else if (lowerName.includes("seguranca") || lowerName.includes("security")) {
    sources = ["/estados-acoes/18-seguranca.png"];
    fontAwesomeClass = "fa-solid fa-shield-halved";
    iconColor = "text-emerald-400";
  } else if (
    lowerName.includes("desligar") ||
    lowerName.includes("logout") ||
    lowerName.includes("sair") ||
    lowerName.includes("terminar")
  ) {
    sources = ["/estados-acoes/17-desligar.png"];
    fontAwesomeClass = "fa-solid fa-power-off";
    iconColor = "text-red-400";
  } else if (lowerName.includes("editar") || lowerName.includes("edit")) {
    sources = ["/estados-acoes/13-editar.png"];
    fontAwesomeClass = "fa-solid fa-pen-to-square";
    iconColor = "text-amber-400";
  } else if (lowerName.includes("adicionar") || lowerName.includes("gravar")) {
    sources = ["/estados-acoes/12-adicionar.png"];
    fontAwesomeClass = "fa-solid fa-plus";
    iconColor = "text-emerald-400";
  } else if (lowerName.includes("guardar") || lowerName.includes("concluido")) {
    sources = ["/estados-acoes/04-concluido.png"];
    fontAwesomeClass = "fa-solid fa-check";
    iconColor = "text-emerald-400";
  } else if (lowerName.includes("eliminar") || lowerName.includes("apagar")) {
    sources = ["/estados-acoes/14-eliminar.png"];
    fontAwesomeClass = "fa-solid fa-trash-can";
    iconColor = "text-red-400";
  } else if (lowerName.includes("predio") || lowerName.includes("edificio")) {
    sources = ["/modulos/01-predio.png"];
    fontAwesomeClass = "fa-solid fa-building";
    iconColor = "text-blue-400";
  } else if (lowerName.includes("ia") || lowerName.includes("ai")) {
    sources = ["/modulos/87-ia-ativa.png"];
    fontAwesomeClass = "fa-solid fa-brain";
    iconColor = "text-purple-400";
  } else if (lowerName.includes("proprietario")) {
    sources = ["/modulos/11-proprietario.png"];
    fontAwesomeClass = "fa-solid fa-user-tie";
    iconColor = "text-emerald-400";
  } else if (lowerName.includes("filtrar")) {
    sources = ["/estados-acoes/11-filtrar.png"];
    fontAwesomeClass = "fa-solid fa-filter";
    iconColor = "text-indigo-400";
  } else if (lowerName.includes("pesquisar")) {
    sources = ["/estados-acoes/10-pesquisar.png"];
    fontAwesomeClass = "fa-solid fa-magnifying-glass";
    iconColor = "text-sky-400";
  } else if (lowerName.includes("atualizar")) {
    sources = ["/estados-acoes/09-atualizar.png"];
    fontAwesomeClass = "fa-solid fa-rotate";
    iconColor = "text-blue-400";
  } else {
    sources = [
      `/estados-acoes/${name}.png`,
      `/modulos/${name}.png`
    ];
  }

  const currentSrc = sources[fallbackIndex];

  if (!currentSrc || fallbackIndex >= sources.length) {
    return (
      <i
        className={`${fontAwesomeClass} ${iconColor} ${className}`}
        style={size ? { fontSize: `${size}px` } : undefined}
      ></i>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={name}
      className={`inline-block object-contain shrink-0 ${className}`}
      style={size ? { width: size, height: size } : undefined}
      onError={() => setFallbackIndex((prev) => prev + 1)}
    />
  );
};
