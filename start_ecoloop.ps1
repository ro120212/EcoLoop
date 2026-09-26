# EcoLoop One-Click Launcher for PowerShell
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  EcoLoop: Smart E-Waste Management & Recycling Platform" -ForegroundColor Green
Write-Host "  NSS College of Engineering, Palakkad" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Green

$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
$pythonPath = "C:\Users\Rohith\AppData\Local\uv\cache\archive-v0\1NvyS5EHrDzd1bve\Scripts\python.exe"

# Start Backend
Write-Host "`n[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; & '$pythonPath' -m uvicorn main:app --reload --port 8000"

# Start Frontend
Write-Host "[2/2] Starting React Vite Frontend on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; `$env:PATH = 'C:\Program Files\nodejs;' + `$env:PATH; npm.cmd run dev"

Write-Host "`nEcoLoop services launched!" -ForegroundColor Green
Write-Host "Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "Backend:   http://127.0.0.1:8000" -ForegroundColor White
Write-Host "API Docs:  http://127.0.0.1:8000/docs" -ForegroundColor White
