#!/bin/bash

echo "Starting Tableau Extension Development Environment"
echo ""

echo "[1/2] Starting FastAPI Backend..."
cd backend && python start.py &
BACKEND_PID=$!

echo "[2/2] Waiting for backend to start..."
sleep 3

echo "[3/3] Starting Frontend Development Server..."
cd .. && npm run dev:http &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "🎉 Development servers started!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔌 Backend:  http://localhost:4173"
echo "📚 API Docs: http://localhost:4173/docs"
echo ""
echo "Press Ctrl+C to stop all servers..."
echo "========================================"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping development servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ Development servers stopped."
    exit 0
}

# Set trap to catch Ctrl+C
trap cleanup INT

# Wait for processes
wait