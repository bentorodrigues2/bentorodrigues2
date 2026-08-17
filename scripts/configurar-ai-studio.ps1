Write-Host "=== CONFIGURAR AI STUDIO (3 PASSOS) ==="

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Resolve-Path "$root\.."
$frontend = "$projectRoot\frontend"
$src = "$frontend\src"
$aistudioFolder = "$src\aistudio"

# 1) Criar wrapper AIStudioApp.tsx
$wrapperFile = "$aistudioFolder\AIStudioApp.tsx"

$wrapperContent = @"
import { RouterProvider } from "react-router-dom";
import router from "./src/router";

export default function AIStudioApp() {
  return <RouterProvider router={router} />;
}
"@

$wrapperContent | Set-Content $wrapperFile -Encoding UTF8
Write-Host "Wrapper criado."

# 2) Inserir rota no App.tsx
$appFile = "$src\App.tsx"

if (Test-Path $appFile) {

    $appContent = Get-Content $appFile

    # Adicionar import
    $importLine = 'import AIStudioApp from "./aistudio/AIStudioApp";'
    if ($appContent -notcontains $importLine) {
        $appContent = @($importLine) + $appContent
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
    Write-Host "Rota adicionada."
} else {
    Write-Host "ERRO: App.tsx nao encontrado."
}

# 3) Inserir botão no index.html
$indexFile = "$frontend\index.html"

if (Test-Path $indexFile) {

    $indexContent = Get-Content $indexFile

    $buttonHtml = '<a href="/app/login">Area Pessoal</a>'

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
    Write-Host "Botao adicionado."
} else {
    Write-Host "ERRO: index.html nao encontrado."
}

Write-Host "=== CONFIGURACAO CONCLUIDA ==="
