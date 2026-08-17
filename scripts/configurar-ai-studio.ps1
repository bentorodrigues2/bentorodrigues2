Write-Host "=== CONFIGURAR AI STUDIO (4 PASSOS) ==="

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Resolve-Path "$root\.."
$frontend = "$projectRoot\frontend"
$src = "$frontend\src"
$aistudioFolder = "$src\aistudio"

# 1) Criar pasta aistudio se não existir
if (!(Test-Path $aistudioFolder)) {
    New-Item -ItemType Directory -Path $aistudioFolder | Out-Null
}

# 1) Criar AIStudioApp.tsx
$wrapperFile = "$aistudioFolder\AIStudioApp.tsx"
$wrapperContent = @"
import React from "react";
import { AIStudioRouter } from "./src/router";

export default function AIStudioApp() {
  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
      <AIStudioRouter />
    </div>
  );
}
"@

$wrapperContent | Set-Content $wrapperFile -Encoding UTF8

# 2) Inserir rota no App.tsx
$appFile = "$src\App.tsx"

if (Test-Path $appFile) {

    $appContent = Get-Content $appFile

    # Adicionar import
    if ($appContent -notcontains 'import AIStudioApp from "./aistudio/AIStudioApp";') {
        $appContent = @('import AIStudioApp from "./aistudio/AIStudioApp";') + $appContent
    }

    # Adicionar rota
    $routeLine = '        <Route path="/app/*" element={<AIStudioApp />} />'

    if ($appContent -notcontains $routeLine) {
        $newContent = @()
        foreach ($line in $appContent) {
            $newContent += $line
            if ($line -match "<Routes>") {
                $newContent += $routeLine
            }
        }
        $appContent = $newContent
    }

    $appContent | Set-Content $appFile -Encoding UTF8
}

# 3) Inserir botão no index.html
$indexFile = "$frontend\index.html"

if (Test-Path $indexFile) {

    $indexContent = Get-Content $indexFile

    $buttonHtml = '<a href="/app/login">Área Pessoal</a>'

    if ($indexContent -notcontains $buttonHtml) {
        $newIndex = @()
        foreach ($line in $indexContent) {
            $newIndex += $line
            if ($line -match "<body>") {
                $newIndex += $buttonHtml
            }
        }
        $indexContent = $newIndex
    }

    $indexContent | Set-Content $indexFile -Encoding UTF8
}

# 4) Git commit + push
Set-Location $projectRoot
git add .
git commit -m "Configurar AI Studio automaticamente"
git push

Write-Host "=== CONFIGURAÇÃO CONCLUÍDA ==="
