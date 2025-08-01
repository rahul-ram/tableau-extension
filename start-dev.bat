@echo off
echo Starting Tableau Extension Development Environment
echo.

echo [1/2] Starting FastAPI Backend...
start /B cmd /c "cd backend && python start.py"

echo [2/2] Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo [3/3] Starting Frontend Development Server...
start /B cmd /c "npm run dev:http"

echo.
echo ========================================
echo 🎉 Development servers starting!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔌 Backend:  http://localhost:4173
echo 📚 API Docs: http://localhost:4173/docs
echo.
echo Press any key to stop all servers...
echo ========================================

pause > nul

echo.
echo 🛑 Stopping development servers...
taskkill /F /IM python.exe 2>nul
taskkill /F /IM node.exe 2>nul
echo ✅ Development servers stopped.
pause