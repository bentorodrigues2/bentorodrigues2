Write-Host "=== ATUALIZAÇÃO AI STUDIO ==="

$source = "colar aistudio"

Write-Host "Frontend..."
Copy-Item "$source\src\*" "src\" -Recurse -Force
Copy-Item "$source\public\*" "public\" -Recurse -Force

Write-Host "Backend..."
Copy-Item "$source\server.ts" ".\" -Force

Write-Host "AI Studio atualizado."
