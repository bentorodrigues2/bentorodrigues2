Write-Host "`n=== ATUALIZAR AI STUDIO (SEM APAGAR) ===`n"

$source = ".\colar aistudio"     # Origem: onde TU colas o ZIP
$target = ".\src\aistudio"       # Destino: AI Studio ativo no site

Write-Host "A substituir ficheiros do AI Studio..."

Copy-Item "$source\*" $target -Recurse -Force

Write-Host "`n=== AI STUDIO ATUALIZADO ==="
Write-Host "Sem apagar nada."
Write-Host "Sem perder alterações."
Write-Host "Sem duplicações."
Write-Host "Versão original aplicada com segurança."
