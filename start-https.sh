#!/bin/bash

echo "Starting Tableau Extension in HTTPS Mode"
echo ""

echo "[1/2] Starting FastAPI Backend with HTTPS..."
cd backend
export USE_HTTPS=true
source env/Scripts/activate && python main.py &
BACKEND_PID=$!
cd ..

echo "[2/2] Waiting for backend to start..."
sleep 3

echo "[3/3] Starting Frontend Development Server with HTTPS..."
export NODE_ENV=production
npm run dev:https &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "🔒 HTTPS Development servers started!"
echo ""
echo "📱 Frontend: https://localhost:8080"
echo "🔌 Backend:  https://localhost:4173"
echo "📚 API Docs: https://localhost:4173/docs"
echo ""
echo "⚠️  Accept certificate warnings in browser"
echo "   for both URLs to work properly"
echo ""
echo "Press Ctrl+C to stop all servers..."
echo "========================================"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping HTTPS development servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ HTTPS development servers stopped."
    exit 0
}

# Set trap to catch Ctrl+C
trap cleanup INT

# Wait for processes
wait