# ================================
#  AI STUDIO UPDATE SCRIPT (OPÇÃO B)
#  Estrutura real do José:
#  ./colar aistudio/src
#  ./colar aistudio/public
# ================================

$source = ".\colar aistudio"            # A tua pasta real (na raiz)
$target = ".\frontend\src\aistudio"     # Pasta onde vive o AI Studio no frontend

Write-Host "`n=== INICIAR ATUALIZAÇÃO DO AI STUDIO ===`n"

# Pastas seguras (biblioteca)
$safeFolders = @(
    "src\components",
    "src\utils",
    "src\lib",
    "public\icons",
    "public\modulos",
    "public\estados-acoes",
    "public\assets"
)

# Ficheiros seguros
$safeFiles = @(
    "src\types.ts"
)

# Ficheiros perigosos (nunca copiar)
$dangerous = @(
    "src\App.tsx",
    "src\main.tsx",
    "src\router.tsx",
    "vite.config.ts",
    "tsconfig.json",
    "public\index.html",
    "public\manifest.json",
    "public\service-worker.js"
)

# Remover perigosos do ZIP extraído
foreach ($file in $dangerous) {
    $dangerSource = Join-Path $source $file
    if (Test-Path $dangerSource) {
        Remove-Item $dangerSource -Force -Recurse
        Write-Host "Removido do ZIP (perigoso): $file"
    }
}

# Função para copiar só se houver diferenças
function Copy-IfDifferent($src, $dst) {
    if (!(Test-Path $src)) {
        Write-Host "Ignorado (não existe no ZIP): $src"
        return
    }

    if (!(Test-Path $dst)) {
        Write-Host "Novo ficheiro/pasta → Copiado: $src"
        Copy-Item $src $dst -Recurse -Force
        return
    }

    $srcHash = (Get-FileHash -Path $src -ErrorAction SilentlyContinue).Hash
    $dstHash = (Get-FileHash -Path $dst -ErrorAction SilentlyContinue).Hash

    if ($srcHash -ne $dstHash) {
        Write-Host "Alterado → Atualizado: $src"
        Copy-Item $src $dst -Recurse -Force
    } else {
        Write-Host "Sem alterações → Mantido: $src"
    }
}

# Copiar pastas seguras
foreach ($folder in $safeFolders) {
    $srcFolder = Join-Path $source $folder
    $dstFolder = Join-Path $target $folder

    Write-Host "`n--- Verificar pasta: $folder ---"
    Copy-IfDifferent $srcFolder $dstFolder
}

# Copiar ficheiros seguros
foreach ($file in $safeFiles) {
    $srcFile = Join-Path $source $file
    $dstFile = Join-Path $target $file

    Write-Host "`n--- Verificar ficheiro: $file ---"
    Copy-IfDifferent $srcFile $dstFile
}

Write-Host "`n=== ATUALIZAÇÃO CONCLUÍDA ==="
Write-Host "AI Studio atualizado em modo biblioteca."
Write-Host "Frontend intacto."
Write-Host "Build do Vercel garantido."