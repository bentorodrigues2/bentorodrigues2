Write-Host "`n=== CORRIGIR ROOT DIRECTORY DO VERCEL ===`n"

$vercel = "vercel.json"

$content = @'
{
  "version": 2,
  "rootDirectory": "frontend",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/$1" }
  ]
}
'@

Set-Content $vercel $content

Write-Host "vercel.json atualizado com rootDirectory=frontend."
Write-Host "O Vercel agora vai compilar o projeto correto."
