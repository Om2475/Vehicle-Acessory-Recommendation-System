# Phase 1: Data Preparation Setup Script
# Run this script to set up your Python environment

Write-Host "🚀 Setting up Vehicle Accessories Recommendation System - Phase 1" -ForegroundColor Cyan
Write-Host "=" * 70

# Check if Python is installed
Write-Host "`n📋 Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "✅ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "Please install Python 3.9+ from https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# Navigate to ML_Engine directory
$mlEngineDir = Join-Path $PSScriptRoot "ML_Engine"
Set-Location $mlEngineDir

# Create virtual environment
Write-Host "`n📦 Creating virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "⚠️  Virtual environment already exists. Skipping..." -ForegroundColor Yellow
} else {
    python -m venv venv
    Write-Host "✅ Virtual environment created!" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "`n🔌 Activating virtual environment..." -ForegroundColor Yellow
$activateScript = Join-Path $mlEngineDir "venv\Scripts\Activate.ps1"

# Check execution policy
$executionPolicy = Get-ExecutionPolicy
if ($executionPolicy -eq "Restricted") {
    Write-Host "⚠️  Execution policy is Restricted. Changing to RemoteSigned..." -ForegroundColor Yellow
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    Write-Host "✅ Execution policy updated!" -ForegroundColor Green
}

& $activateScript

# Upgrade pip
Write-Host "`n⬆️  Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip --quiet

# Install requirements
Write-Host "`n📥 Installing Python packages..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes..." -ForegroundColor Gray
pip install -r requirements.txt --quiet

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All packages installed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Error installing packages. Please check the error messages above." -ForegroundColor Red
    exit 1
}

# Download NLTK data
Write-Host "`n📚 Downloading NLTK data..." -ForegroundColor Yellow
python -c @"
import nltk
import ssl

try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

print('Downloading NLTK data...')
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)
nltk.download('vader_lexicon', quiet=True)
print('✅ NLTK data downloaded!')
"@

# Launch Jupyter
Write-Host "`n" -NoNewline
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "✅ SETUP COMPLETE!" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Cyan

Write-Host "`n📂 Your working directory: $mlEngineDir" -ForegroundColor Cyan
Write-Host "`n🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. The virtual environment is now activated" -ForegroundColor White
Write-Host "   2. Navigate to: ML_Engine/notebooks/" -ForegroundColor White
Write-Host "   3. Open: 01_data_exploration.ipynb" -ForegroundColor White
Write-Host "`n💡 To launch Jupyter Notebook, run:" -ForegroundColor Yellow
Write-Host "   jupyter notebook" -ForegroundColor Cyan

Write-Host "`n🔥 Ready to start Phase 1!" -ForegroundColor Green
