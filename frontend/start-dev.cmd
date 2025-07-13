@echo off
REM Windows batch script to start Next.js development server

echo Starting Next.js development server...

REM Kill existing Next.js processes
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *next*dev*" 2>nul

REM Set environment variables
set HOSTNAME=0.0.0.0
set HOST=0.0.0.0

REM Start Next.js
echo Starting on http://localhost:3000
npm run dev -- --hostname 0.0.0.0 --port 3000