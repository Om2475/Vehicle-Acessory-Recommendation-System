# Quick Start Script - Activate environment and launch Jupyter
# Run this after initial setup is complete

Write-Host "🚀 Vehicle Accessories Recommendation System" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

$mlEngineDir = Join-Path $PSScriptRoot "ML_Engine"

# Check if venv exists
if (-not (Test-Path "$mlEngineDir\venv")) {
    Write-Host "`n❌ Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please run setup_phase1.ps1 first" -ForegroundColor Yellow
    exit 1
}

# Navigate to ML_Engine
Set-Location $mlEngineDir

# Activate virtual environment
Write-Host "`n🔌 Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Display status
Write-Host "`n✅ Environment activated!" -ForegroundColor Green
Write-Host "`n📂 Current directory: $mlEngineDir" -ForegroundColor Cyan

# Launch Jupyter
Write-Host "`n🚀 Launching Jupyter Notebook..." -ForegroundColor Yellow
Write-Host "   (Your browser will open automatically)" -ForegroundColor Gray
Write-Host "`n💡 To stop Jupyter: Press Ctrl+C twice" -ForegroundColor Yellow
Write-Host "`n" -NoNewline

jupyter notebook
