@echo off
title EcoLoop - Smart E-Waste Management Platform
echo ========================================================
echo   EcoLoop: Smart E-Waste Management & Recycling Platform
echo   NSS College of Engineering, Palakkad
echo ========================================================
echo.

set PATH=C:\Program Files\nodejs;%PATH%
set PYTHON_PATH="C:\Users\Rohith\AppData\Local\uv\cache\archive-v0\1NvyS5EHrDzd1bve\Scripts\python.exe"

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "EcoLoop Backend (FastAPI)" cmd /k "cd /d "%~dp0backend" && %PYTHON_PATH% -m uvicorn main:app --reload --port 8000"

echo [2/2] Starting React Vite Frontend on http://localhost:5173 ...
start "EcoLoop Frontend (React/Vite)" cmd /k "cd /d "%~dp0frontend" && npm.cmd run dev"

echo.
echo ========================================================
echo   EcoLoop is running!
echo   Frontend: http://localhost:5173
echo   Backend API: http://127.0.0.1:8000
echo   API Docs: http://127.0.0.1:8000/docs
echo ========================================================
echo.
pause
