Write-Host "`n=== SCRIPT GOD ULTRA FINAL — PORTAL + ROUTER + AI STUDIO ===`n"

# 1. CORRIGIR AUTOMATICAMENTE O BOTÃO "ÁREA PESSOAL"
$layoutTopPath = ".\src\components\LayoutTop.tsx"

Write-Host "A corrigir LayoutTop.tsx..."
(Get-Content $layoutTopPath) `
    -replace 'onClick=\{\(\) => setShowAuth\(true\)\}', 'onClick={() => { window.location.href = "/auth"; }}' `
    | Set-Content $layoutTopPath

Write-Host "✔ Botão 'Área Pessoal' corrigido para abrir o Portal do AI Studio."

# 2. CORRIGIR AUTOMATICAMENTE O ROUTER DO App.tsx
$appPath = ".\src\App.tsx"

Write-Host "A corrigir router do App.tsx..."

(Get-Content $appPath) `
    -replace 'if \(path === "/dashboard"\) setCurrentRoute\("/dashboard"\);', 'if (path === "/dashboard") setCurrentRoute("/dashboard"); else if (path === "/auth") setCurrentRoute("/auth");' `
    -replace 'if \(browserIsLoggedOut\) \{', 'if (browserIsLoggedOut) {' `
    -replace 'if \(currentRoute === "/"\) \{', 'if (currentRoute === "/auth") { return (<div className="h-screen w-screen flex items-center justify-center p-4"><PortalAutenticacao initialEmail={browserEmail} initialErrorMessage={loginErrorMessage} onLoginSuccess={handleLoginFromTop} /></div>); } if (currentRoute === "/") {' `
    | Set-Content $appPath

Write-Host "✔ Router corrigido — /auth agora abre o PortalAutenticacao."

# 3. ATUALIZAR AI STUDIO
$source = ".\colar aistudio"
$target = ".\src\aistudio"

Write-Host "`nA substituir ficheiros do AI Studio..."
Copy-Item "$source\*" $target -Recurse -Force

# 4. COPIAR WRAPPER ETERNO
Write-Host "A copiar wrapper eterno..."
Copy-Item ".\wrapper-eterno\*" ".\src\wrapper" -Recurse -Force -ErrorAction SilentlyContinue

# 5. COPIAR SUPABASE ETERNO
Write-Host "A copiar supabase eterno..."
Copy-Item ".\supabase-eterno\*" ".\src\supabase" -Recurse -Force -ErrorAction SilentlyContinue

# 6. GIT ADD
Write-Host "`n=== GIT ADD ==="
git add .

# 7. GIT COMMIT
Write-Host "`n=== GIT COMMIT ==="
git commit -m "Correção automática do Portal + Router + Atualização AI Studio + Wrapper + Supabase"

# 8. GIT PUSH
Write-Host "`n=== GIT PUSH ==="
git push

# 9. DEPLOY VERCEL
Write-Host "`n=== DEPLOY VERCEL ==="
vercel --prod

Write-Host "`n=== SCRIPT GOD ULTRA FINAL CONCLUÍDO ==="
Write-Host "Portal corrigido, router corrigido, AI Studio atualizado, commit feito, push enviado, deploy realizado."
