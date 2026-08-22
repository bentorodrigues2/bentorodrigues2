Write-Host "`n=== SCRIPT GOD — ATUALIZAR AI STUDIO COMPLETO ===`n"

# ORIGEM E DESTINO
$source = ".\colar aistudio"
$target = ".\src\aistudio"

Write-Host "A substituir ficheiros do AI Studio..."
Copy-Item "$source\*" $target -Recurse -Force

Write-Host "A copiar wrapper eterno..."
Copy-Item ".\wrapper-eterno\*" ".\src\wrapper" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "A copiar supabase eterno..."
Copy-Item ".\supabase-eterno\*" ".\src\supabase" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "`n=== GIT ADD ==="
git add .

Write-Host "`n=== GIT COMMIT ==="
git commit -m "Atualização automática AI Studio + Wrapper + Supabase"

Write-Host "`n=== GIT PUSH ==="
git push

Write-Host "`n=== DEPLOY VERCEL ==="
vercel --prod

Write-Host "`n=== SCRIPT GOD CONCLUÍDO ==="
Write-Host "AI Studio atualizado, commit feito, push enviado, deploy realizado."
