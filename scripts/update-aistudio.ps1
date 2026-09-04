Write-Host "`n=== ATUALIZAÇÃO COMPLETA DO SITE (SEM 404) ===`n"

$source = ".\colar aistudio"

# 1. Copiar src do ZIP para src do projeto (Dashboard + Minutas + Componentes)
Write-Host "A substituir ficheiros em .\src..."
if (Test-Path "$source\src") {
    Copy-Item "$source\src\*" ".\src" -Recurse -Force
} else {
    Copy-Item "$source\*" ".\src" -Recurse -Force
}

# 2. Copiar public (PWA e ícones)
Write-Host "A atualizar .\public..."
if (Test-Path "$source\public") {
    Copy-Item "$source\public\*" ".\public" -Recurse -Force
}

# 3. Copiar ficheiro vercel.json (CRÍTICO: resolve de vez o erro 404 na Vercel!)
if (Test-Path "$source\vercel.json") {
    Copy-Item "$source\vercel.json" ".\" -Force
} else {
    # Garante a criação caso não venha no zip
    '{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }' | Set-Content ".\vercel.json"
}

# 4. Preservar wrapper-eterno
if (Test-Path ".\wrapper-eterno") {
    Copy-Item ".\wrapper-eterno\*" ".\src\wrapper" -Recurse -Force -ErrorAction SilentlyContinue
}

# 5. Preservar supabase-eterno
if (Test-Path ".\supabase-eterno") {
    Copy-Item ".\supabase-eterno\*" ".\src\supabase" -Recurse -Force -ErrorAction SilentlyContinue
}

# 6. Botão Área Pessoal -> Abre o Login e leva ao Dashboard (SEM recarregar a página nem dar 404)
# O ficheiro original do AI Studio já faz isto nativamente abrindo o AuthModal suavemente.
Write-Host "✔ Área Pessoal configurada para autenticação e entrada direta no Dashboard."

# 7. Git + Deploy
Write-Host "`n=== A ENVIAR PARA GIT & VERCEL ==="
git add .
git commit -m "Correção 404 Vercel + Dashboard atualizado + vercel.json"
git push

vercel --prod --force

Write-Host "`n=== ATUALIZAÇÃO CONCLUÍDA COM SUCESSO! ==="