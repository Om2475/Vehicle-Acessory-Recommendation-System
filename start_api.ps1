# 🚀 Quick Start Script for Database & API
# Run this script to start the API server with database support

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🚀 VEHICLE ACCESSORIES RECOMMENDATION SYSTEM" -ForegroundColor Cyan
Write-Host "   Database & API Server Startup" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "ML_Engine")) {
    Write-Host "❌ Error: ML_Engine directory not found!" -ForegroundColor Red
    Write-Host "   Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

# Check if database exists
if (-not (Test-Path "ML_Engine/vehicle_accessories.db")) {
    Write-Host "⚠️  Database not found. Creating database..." -ForegroundColor Yellow
    Write-Host ""
    python ML_Engine/database.py
    Write-Host ""
}

# Check if Python packages are installed
Write-Host "📦 Checking dependencies..." -ForegroundColor Cyan
$packages = @("fastapi", "uvicorn", "bcrypt", "pandas")
$missing = @()

foreach ($package in $packages) {
    python -c "import $package" 2>$null
    if ($LASTEXITCODE -ne 0) {
        $missing += $package
    }
}

if ($missing.Count -gt 0) {
    Write-Host "⚠️  Missing packages: $($missing -join ', ')" -ForegroundColor Yellow
    Write-Host "   Installing..." -ForegroundColor Yellow
    pip install fastapi uvicorn bcrypt pandas scikit-learn
    Write-Host ""
}

Write-Host "✅ All dependencies installed!" -ForegroundColor Green
Write-Host ""

# Start the API server
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🚀 STARTING API SERVER" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📡 API will be available at:" -ForegroundColor Yellow
Write-Host "   http://localhost:8000" -ForegroundColor White
Write-Host ""
Write-Host "📚 Interactive API Documentation:" -ForegroundColor Yellow
Write-Host "   http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Change to ML_Engine directory and start server
Set-Location ML_Engine
python api.py
