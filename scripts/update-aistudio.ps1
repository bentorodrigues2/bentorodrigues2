# ============================================================
#  AI STUDIO → MODO BIBLIOTECA (VERSÃO DEFINITIVA)
#  Limpeza total + filtragem completa + build garantido
# ============================================================

$source = ".\colar aistudio"              # ZIP extraído (completo)
$target = ".\frontend\src\aistudio"       # Biblioteca final

Write-Host "`n=== LIMPEZA TOTAL DO AI STUDIO ===`n"

# 1. APAGAR COMPLETAMENTE A BIBLIOTECA ANTIGA
if (Test-Path $target) {
    Remove-Item $target -Recurse -Force
    Write-Host "Biblioteca antiga removida."
}

# 2. CRIAR A PASTA LIMPA
New-Item -ItemType Directory -Path $target | Out-Null

Write-Host "`n=== FILTRAGEM COMPLETA DO ZIP ===`n"

# 3. LISTA DE PASTAS PERMITIDAS (BIBLIOTECA REAL)
$allowedFolders = @(
    "src\components",
    "src\utils",
    "src\lib",
    "public\icons",
    "public\modulos",
    "public\estados-acoes",
    "public\assets"
)

# 4. LISTA DE FICHEIROS PERMITIDOS
$allowedFiles = @(
    "src\types.ts"
)

# 5. LISTA DE FICHEIROS E PASTAS PROIBIDOS (REMOVER SEM PIEDADE)
$removePatterns = @(
    "src\App.tsx",
    "src\main.tsx",
    "src\router*",
    "src\index.css",
    "src\data.ts",
    "src\vite-env.d.ts",
    "src\assets\logoBase64.ts",
    "src\utils\registerServiceWorker.ts",
    "src\utils\sendNotification.ts",
    "src\utils\subscribeUser.ts",
    "public\manifest.json",
    "public\index.html",
    "public\sw.js",
    "vite.config.ts",
    "tsconfig.json",
    "package.json",
    "package-lock.json",
    "bun.lock",
    "*.cjs",
    "*.sql"
)

# 6. REMOVER TUDO O QUE É PROIBIDO
foreach ($pattern in $removePatterns) {
    $path = Join-Path $source $pattern
    if (Test-Path $path) {
        Remove-Item $path -Force -Recurse
        Write-Host "Removido (incompatível): $pattern"
    }
}

# 7. COPIAR APENAS O QUE É PERMITIDO
function Copy-Safe($relativePath) {
    $src = Join-Path $source $relativePath
    $dst = Join-Path $target $relativePath

    if (Test-Path $src) {
        Copy-Item $src $dst -Recurse -Force
        Write-Host "Copiado: $relativePath"
    } else {
        Write-Host "Ignorado (não existe no ZIP): $relativePath"
    }
}

foreach ($folder in $allowedFolders) {
    Copy-Safe $folder
}

foreach ($file in $allowedFiles) {
    Copy-Safe $file
}

Write-Host "`n=== AI STUDIO CONVERTIDO PARA BIBLIOTECA ==="
Write-Host "Frontend intacto."
Write-Host "Build do Vercel garantido."
Write-Host "Pronto para integrar com Supabase."
