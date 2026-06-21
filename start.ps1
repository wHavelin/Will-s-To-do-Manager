$root = $PSScriptRoot

Write-Host "Starting Todo Manager..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "Set-Location '$root\backend\TodoManager.Api'; dotnet run"

Start-Sleep -Seconds 3

Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "Set-Location '$root\frontend'; npm run dev"

Write-Host ""
Write-Host "Started in two new windows:" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Yellow
