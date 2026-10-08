# ==============================================================================
# local-ai-stack — Cross-Platform One-Command Installer (Windows PowerShell)
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "        LOCAL AI STACK           " -ForegroundColor Cyan
Write-Host "  Your private AI environment    " -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking prerequisites..." -ForegroundColor White

# 1. Check Node.js
try {
    $nodeVer = (node -v).TrimStart('v')
    $major = [int]($nodeVer.Split('.')[0])
    if ($major -ge 18) {
        Write-Host "  Node.js:          v$nodeVer" -ForegroundColor Green
    } else {
        Write-Host "  Node.js:          v$nodeVer (Warning: Node.js 18+ recommended)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  Node.js:          Not installed" -ForegroundColor Red
    Write-Host "Error: Node.js (v18+) is required to run local-ai-stack." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 2. Check Docker
try {
    $dockerVer = docker --version
    Write-Host "  Docker:           $dockerVer" -ForegroundColor Green

    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Docker Daemon:    Running" -ForegroundColor Green
    } else {
        Write-Host "  Docker Daemon:    Not running" -ForegroundColor Yellow
        Write-Host "Please ensure Docker Desktop for Windows is running." -ForegroundColor Yellow
    }
} catch {
    Write-Host "  Docker:           Not detected" -ForegroundColor Yellow
    Write-Host "Download Docker Desktop: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Launching local-ai-stack initialization..." -ForegroundColor Cyan
Write-Host ""

if (Test-Path "dist\index.js") {
    node dist\index.js init @args
    node dist\index.js up
} else {
    npx local-ai-stack init @args
    npx local-ai-stack up
}
