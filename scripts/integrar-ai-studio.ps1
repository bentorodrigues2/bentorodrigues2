# Caminhos base
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Resolve-Path "$root\.."
$frontend = "$projectRoot\frontend"
$aistudio = "$projectRoot\colar aistudio"

Write-Host "📁 Projeto: $projectRoot"
Write-Host "📁 Frontend: $frontend"
Write-Host "📁 AI Studio: $aistudio"
Write-Host ""

# 1️⃣ Criar pasta destino no frontend
$dest = "$frontend\src\aistudio"
if (!(Test-Path $dest)) {
    Write-Host "🔧 Criando pasta: $dest"
    New-Item -ItemType Directory -Path $dest | Out-Null
} else {
    Write-Host "✔ Pasta já existe: $dest"
}

# 2️⃣ Copiar SRC do AI Studio
$srcSource = "$aistudio\src"
$srcDest = "$dest\src"

if (Test-Path $srcSource) {
    Write-Host "📦 Copiando SRC do AI Studio..."
    if (Test-Path $srcDest) { Remove-Item $srcDest -Recurse -Force }
    Copy-Item $srcSource $srcDest -Recurse
    Write-Host "✔ SRC copiado."
} else {
    Write-Host "❌ ERRO: Pasta src do AI Studio não encontrada."
}

# 3️⃣ Copiar PUBLIC do AI Studio
$publicSource = "$aistudio\public"
$publicDest = "$dest\public"

if (Test-Path $publicSource) {
    Write-Host "📦 Copiando PUBLIC do AI Studio..."
    if (Test-Path $publicDest) { Remove-Item $publicDest -Recurse -Force }
    Copy-Item $publicSource $publicDest -Recurse
    Write-Host "✔ PUBLIC copiado."
} else {
    Write-Host "❌ ERRO: Pasta public do AI Studio não encontrada."
}

# 4️⃣ Copiar package.json do AI Studio (isolado)
$pkgSource = "$aistudio\package.json"
$pkgDest = "$dest\package.json"

if (Test-Path $pkgSource) {
    Write-Host "📦 Copiando package.json do AI Studio..."
    Copy-Item $pkgSource $pkgDest -Force
    Write-Host "✔ package.json copiado."
} else {
    Write-Host "❌ ERRO: package.json do AI Studio não encontrado."
}

Write-Host ""
Write-Host "🎉 Integração base do AI Studio concluída!"
Write-Host "➡ Agora adiciona a rota /app/* no App.tsx"
Write-Host "➡ E cria o wrapper AIStudioApp.tsx"
