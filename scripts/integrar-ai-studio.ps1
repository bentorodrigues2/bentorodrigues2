Write-Host "=== INTEGRAR AI STUDIO ==="

# Caminhos base
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Resolve-Path "$root\.."
$frontend = "$projectRoot\frontend"
$aistudio = "$projectRoot\colar aistudio"

Write-Host "Projeto: $projectRoot"
Write-Host "Frontend: $frontend"
Write-Host "AI Studio: $aistudio"
Write-Host ""

# Criar pasta destino no frontend
$dest = "$frontend\src\aistudio"
if (!(Test-Path $dest)) {
    Write-Host "Criando pasta: $dest"
    New-Item -ItemType Directory -Path $dest | Out-Null
} else {
    Write-Host "Pasta ja existe: $dest"
}

# Copiar SRC do AI Studio
$srcSource = "$aistudio\src"
$srcDest = "$dest\src"

if (Test-Path $srcSource) {
    Write-Host "Copiando SRC do AI Studio..."
    if (Test-Path $srcDest) {
        Remove-Item $srcDest -Recurse -Force
    }
    Copy-Item $srcSource $srcDest -Recurse
    Write-Host "SRC copiado."
} else {
    Write-Host "ERRO: Pasta src do AI Studio nao encontrada."
}

# Copiar PUBLIC do AI Studio
$publicSource = "$aistudio\public"
$publicDest = "$dest\public"

if (Test-Path $publicSource) {
    Write-Host "Copiando PUBLIC do AI Studio..."
    if (Test-Path $publicDest) {
        Remove-Item $publicDest -Recurse -Force
    }
    Copy-Item $publicSource $publicDest -Recurse
    Write-Host "PUBLIC copiado."
} else {
    Write-Host "ERRO: Pasta public do AI Studio nao encontrada."
}

# Copiar package.json do AI Studio
$pkgSource = "$aistudio\package.json"
$pkgDest = "$dest\package.json"

if (Test-Path $pkgSource) {
    Write-Host "Copiando package.json do AI Studio..."
    Copy-Item $pkgSource $pkgDest -Force
    Write-Host "package.json copiado."
} else {
    Write-Host "ERRO: package.json do AI Studio nao encontrado."
}

Write-Host ""
Write-Host "Integracao base do AI Studio concluida."
Write-Host "Agora podes correr o script de configuracao ou ajustar o router."
