# PowerShell script to start Next.js development server

Write-Host "Starting Next.js development server..." -ForegroundColor Green

# Kill existing Next.js processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*next*dev*"
} | Stop-Process -Force

# Set environment variables
$env:HOSTNAME = "0.0.0.0"
$env:HOST = "0.0.0.0"

# Start Next.js
Write-Host "Starting on http://localhost:3000" -ForegroundColor Yellow
npm run dev -- --hostname 0.0.0.0 --port 3000