# PowerShell setup script for SAYU project on Windows

Write-Host "SAYU Project Setup for Windows" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script requires administrator privileges for some operations." -ForegroundColor Yellow
}

# Function to check if a command exists
function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Check prerequisites
Write-Host "`nChecking prerequisites..." -ForegroundColor Yellow

$missing = @()

if (-not (Test-Command "node")) {
    $missing += "Node.js"
}

if (-not (Test-Command "npm")) {
    $missing += "npm"
}

if (-not (Test-Command "git")) {
    $missing += "Git"
}

if ($missing.Count -gt 0) {
    Write-Host "`nMissing required tools:" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Write-Host "`nPlease install the missing tools and run this script again." -ForegroundColor Yellow
    exit 1
}

# Display versions
Write-Host "`nInstalled versions:" -ForegroundColor Green
Write-Host "  Node.js: $(node --version)"
Write-Host "  npm: $(npm --version)"
Write-Host "  Git: $(git --version)"

# Setup environment files
Write-Host "`nSetting up environment files..." -ForegroundColor Yellow

# Backend .env
if (-not (Test-Path "backend\.env")) {
    if (Test-Path "backend\.env.example") {
        Copy-Item "backend\.env.example" "backend\.env"
        Write-Host "  Created backend\.env from .env.example" -ForegroundColor Green
        Write-Host "  Please update backend\.env with your actual values" -ForegroundColor Yellow
    } else {
        Write-Host "  backend\.env.example not found!" -ForegroundColor Red
    }
} else {
    Write-Host "  backend\.env already exists" -ForegroundColor Green
}

# Frontend .env.local
if (-not (Test-Path "frontend\.env.local")) {
    if (Test-Path "frontend\.env.local.example") {
        Copy-Item "frontend\.env.local.example" "frontend\.env.local"
        Write-Host "  Created frontend\.env.local from .env.local.example" -ForegroundColor Green
        Write-Host "  Please update frontend\.env.local with your actual values" -ForegroundColor Yellow
    } else {
        Write-Host "  frontend\.env.local.example not found!" -ForegroundColor Red
    }
} else {
    Write-Host "  frontend\.env.local already exists" -ForegroundColor Green
}

# Install dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow

# Backend
Write-Host "`nInstalling backend dependencies..." -ForegroundColor Cyan
Push-Location backend
npm install
Pop-Location

# Frontend
Write-Host "`nInstalling frontend dependencies..." -ForegroundColor Cyan
Push-Location frontend
npm install
Pop-Location

Write-Host "`nSetup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Update environment files with your actual values:"
Write-Host "   - backend\.env"
Write-Host "   - frontend\.env.local"
Write-Host ""
Write-Host "2. Start the development servers:"
Write-Host "   Backend: cd backend && npm run dev"
Write-Host "   Frontend: cd frontend && npm run dev"
Write-Host ""
Write-Host "   Or use the PowerShell startup script:"
Write-Host "   Frontend: .\frontend\start-dev.ps1"
Write-Host ""
Write-Host "3. Access the application at http://localhost:3000"