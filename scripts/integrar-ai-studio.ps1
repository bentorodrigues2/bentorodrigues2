Write-Host "=== INTEGRAR AI STUDIO COMPLETO ==="

$source = "colar aistudio"

# Copiar SRC (frontend completo)
Write-Host "Copiando SRC completo..."
robocopy "$source\src" "src" /E

# Copiar PUBLIC (PWA, icons, manifest, etc)
Write-Host "Copiando PUBLIC completo..."
robocopy "$source\public" "public" /E

# Copiar BACKEND (se existir)
if (Test-Path "$source\server") {
    Write-Host "Copiando BACKEND completo..."
    robocopy "$source\server" "server" /E
}

# Copiar ficheiros de configuração
Write-Host "Copiando ficheiros de configuração..."
Copy-Item "$source\package.json" "." -Force
Copy-Item "$source\tsconfig.json" "." -Force
Copy-Item "$source\vite.config.ts" "." -Force

Write-Host "=== AI STUDIO integrado sem alterações ==="
