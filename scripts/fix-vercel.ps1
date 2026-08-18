Write-Host "`n=== CRIAR vercel.json PARA CORRIGIR BUILD DO VERCEL ===`n"

$vercel = "vercel.json"

$content = @'
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
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

Write-Host "vercel.json criado com sucesso."
Write-Host "Agora o Vercel vai compilar o projeto correto (frontend/)."
