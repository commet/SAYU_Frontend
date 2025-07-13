# PowerShell script to start both backend and frontend servers

Write-Host "Starting SAYU Development Servers" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check if npm is installed
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "npm is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Kill existing Node.js processes on ports 3000 and 3001
Write-Host "`nCleaning up existing processes..." -ForegroundColor Yellow
$ports = @(3000, 3001)
foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($process) {
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        Write-Host "  Stopped process on port $port" -ForegroundColor Green
    }
}

# Start backend server in new window
Write-Host "`nStarting backend server on port 3001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; Write-Host 'Backend Server' -ForegroundColor Cyan; npm run dev"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend server in new window
Write-Host "Starting frontend server on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; Write-Host 'Frontend Server' -ForegroundColor Cyan; npm run dev"

Write-Host "`nServers are starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:3001" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "`nPress Ctrl+C in each window to stop the servers" -ForegroundColor Gray