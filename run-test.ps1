$projectPath = "C:\Users\jcafg\Desktop\meus documentos\App Condominios\bentorodrigues2"
$aistudioPath = "$projectPath\aistudio"

Write-Host "=== Teste AI Studio ==="

$systemPrompt = Get-Content (Join-Path $aistudioPath "system-prompt.txt") -Raw
$testEmail    = Get-Content (Join-Path $aistudioPath "test-email.json") -Raw

Write-Host "PROMPT:"
Write-Host $systemPrompt

Write-Host "EMAIL:"
Write-Host $testEmail

$body = @{
    contents = @(
        @{
            role = "user"
            parts = @(
                @{ text = $systemPrompt },
                @{ text = $testEmail }
            )
        }
    )
} | ConvertTo-Json -Depth 10

Write-Host "BODY:"
Write-Host $body

$response = Invoke-RestMethod `
    -Uri "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent" `
    -Method POST `
    -Headers @{ 
        "Content-Type" = "application/json"; 
        "x-goog-api-key" = $env:AI_STUDIO_API_KEY 
    } `
    -Body $body

Write-Host "RESPOSTA:"
Write-Host $response

Write-Host "TEXTO:"
$response.candidates[0].content.parts[0].text
$json = $response.candidates[0].content.parts[0].text | ConvertFrom-Json

Write-Host "RESPOSTA AUTOMÁTICA:"
Write-Host $json.resposta_sugerida

$payload = @{
    from    = $json.from
    subject = $json.subject
    body    = $json.body
} | ConvertTo-Json -Depth 10

$vercelUrl = "https://bentorodrigues2.vercel.app/api/process-email"

$responseBackend = Invoke-RestMethod `
    -Uri $vercelUrl `
    -Method POST `
    -Headers @{ "Content-Type" = "application/json" } `
    -Body $payload

Write-Host "STATUS DO BACKEND:"
Write-Host $responseBackend


