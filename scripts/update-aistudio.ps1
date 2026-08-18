Write-Host "`n=== RESTAURAR AI STUDIO COMPLETO ===`n"

$source = ".\colar aistudio"              # ZIP extraído (completo)
$target = ".\frontend\src\aistudio"       # Pasta onde o AI Studio vai viver

# 1. APAGAR A PASTA ANTIGA
if (Test-Path $target) {
    Remove-Item $target -Recurse -Force
    Write-Host "Pasta antiga removida."
}

# 2. CRIAR PASTA NOVA
New-Item -ItemType Directory -Path $target | Out-Null

# 3. COPIAR O AI STUDIO COMPLETO
Write-Host "A copiar AI Studio completo..."

Copy-Item "$source\*" $target -Recurse -Force

Write-Host "`n=== AI STUDIO RESTAURADO COMPLETO ==="
Write-Host "Layout original preservado."
Write-Host "Router original preservado."
Write-Host "App.tsx original preservado."
Write-Host "Frontend intacto."
Write-Host "Pronto para integrar em /app/*."
