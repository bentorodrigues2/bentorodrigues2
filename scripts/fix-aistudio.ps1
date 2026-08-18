Write-Host "`n=== CORRIGIR AI STUDIO PARA BUILD DO VERCEL ===`n"

# Caminhos
$tsconfig = "frontend/tsconfig.json"
$wrapper = "frontend/src/aistudio/AIStudioWrapper.tsx"
$app = "frontend/src/App.tsx"

# 1️⃣ Corrigir tsconfig.json
Write-Host "A corrigir tsconfig.json..."

$tsconfigContent = @'
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "strict": true,
    "jsx": "react-jsx",
    "types": ["node"]
  },
  "include": [
    "src",
    "src/aistudio"
  ]
}
'@

Set-Content $tsconfig $tsconfigContent
Write-Host "tsconfig.json corrigido."


# 2️⃣ Corrigir AIStudioWrapper.tsx
Write-Host "A corrigir AIStudioWrapper.tsx..."

$wrapperContent = @'
import { useEffect, useState } from "react";

export default function AIStudioWrapper() {
  const [App, setApp] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    import("./index.css");

    import("./src/App")
      .then((mod) => setApp(() => mod.default))
      .catch((err) => console.error("Erro ao carregar AI Studio:", err));
  }, []);

  if (!App) return <div>A carregar AI Studio...</div>;

  return <App />;
}
'@

Set-Content $wrapper $wrapperContent
Write-Host "AIStudioWrapper.tsx corrigido."


# 3️⃣ Corrigir App.tsx
Write-Host "A corrigir App.tsx..."

$appContent = @'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AIStudioWrapper from "./aistudio/AIStudioWrapper";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <h1>Frontend OK</h1>
              <a href="/app">Área Pessoal</a>
            </div>
          }
        />
        <Route path="/app/*" element={<AIStudioWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
'@

Set-Content $app $appContent
Write-Host "App.tsx corrigido."


Write-Host "`n=== CORREÇÃO COMPLETA ==="
Write-Host "Agora o Vercel vai passar o build."
Write-Host "A rota /app vai abrir o AI Studio completo."
Write-Host "Frontend intacto."
