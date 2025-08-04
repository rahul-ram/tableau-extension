@echo off
echo Starting Tableau Extension in HTTPS Mode
echo.

echo [1/2] Starting FastAPI Backend with HTTPS...
cd backend
set USE_HTTPS=true
start "Backend HTTPS" cmd /k "env\Scripts\activate && python main.py"
cd ..

echo [2/2] Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo [3/3] Starting Frontend Development Server with HTTPS...
set NODE_ENV=production
start "Frontend HTTPS" cmd /k "npm run dev:https"

echo.
echo ========================================
echo 🔒 HTTPS Development servers started!
echo.
echo 📱 Frontend: https://localhost:8080
echo 🔌 Backend:  https://localhost:4173
echo 📚 API Docs: https://localhost:4173/docs
echo.
echo ⚠️  Accept certificate warnings in browser
echo    for both URLs to work properly
echo.
echo Press any key to close this window...
echo ========================================
pause >nul