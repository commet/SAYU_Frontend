@echo off
echo Stopping all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul
echo Starting development server with memory optimization...
set NODE_OPTIONS=--max-old-space-size=2048
cd frontend
npm run dev