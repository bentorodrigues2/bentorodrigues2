const fs = require("fs");
const path = require("path");

console.log("\n=== LIGAR AI STUDIO AO FRONTEND ===\n");

const appPath = path.join("frontend", "src", "App.tsx");
const wrapperPath = path.join("frontend", "src", "aistudio", "AIStudioWrapper.tsx");

// 1. Criar Wrapper
console.log("A criar AIStudioWrapper.tsx...");

const wrapperContent = `
import { useEffect } from "react";

export default function AIStudioWrapper() {
  useEffect(() => {
    import("./index.css");
  }, []);

  const AIStudioApp = require("./src/App.tsx").default;

  return <AIStudioApp />;
}
`;

fs.writeFileSync(wrapperPath, wrapperContent);
console.log("Wrapper criado.");

// 2. Atualizar App.tsx
console.log("A ligar rota /app/* ao App.tsx...");

let appContent = fs.readFileSync(appPath, "utf8");

// Adicionar import
if (!appContent.includes("AIStudioWrapper")) {
  appContent = appContent.replace(
    "import React",
    "import React\nimport AIStudioWrapper from './aistudio/AIStudioWrapper';"
  );
}

// Adicionar rota
if (!appContent.includes("/app/*")) {
  appContent = appContent.replace(
    "<Routes>",
    "<Routes>\n      <Route path=\"/app/*\" element={<AIStudioWrapper />} />"
  );
}

fs.writeFileSync(appPath, appContent);
console.log("Rota /app/* ligada.");

// 3. Adicionar botão Área Pessoal
console.log("A adicionar botão Área Pessoal...");

if (!appContent.includes("Área Pessoal")) {
  appContent = appContent.replace(
    "</div>",
    "    <a href=\"/app\">Área Pessoal</a>\n</div>"
  );
  fs.writeFileSync(appPath, appContent);
}

console.log("\n=== AI STUDIO LIGADO COM SUCESSO ===");
console.log("Agora /app abre o AI Studio completo.");
console.log("Frontend intacto.");

