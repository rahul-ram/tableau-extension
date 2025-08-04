@echo off
echo Testing HTTPS Configuration
echo.

echo [1/3] Testing Frontend HTTPS...
curl -k -s -o nul -w "Frontend: %%{http_code}\n" https://localhost:8080

echo [2/3] Testing Backend HTTPS...
curl -k -s -o nul -w "Backend: %%{http_code}\n" https://localhost:4173/health

echo [3/3] Testing API endpoint...
curl -k -s -o nul -w "API: %%{http_code}\n" https://localhost:4173/reportsApi/getWorkspace?userEmail=test@example.com

echo.
echo ✅ HTTPS testing complete!
echo Open https://localhost:8080 in your browser
echo Accept certificate warnings for both URLs
echo.
pause