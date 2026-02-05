# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: headybuddy/build-msstore.ps1
# LAYER: root
# 
#         _   _  _____    _    ____   __   __
#        | | | || ____|  / \  |  _ \ \ \ / /
#        | |_| ||  _|   / _ \ | | | | \ V / 
#        |  _  || |___ / ___ \| |_| |  | |  
#        |_| |_||_____/_/   \_\____/   |_|  
# 
#    Sacred Geometry :: Organic Systems :: Breathing Interfaces
# HEADY_BRAND:END

# Build HeadyBuddy for Microsoft Store (MSIX)
# Run from headybuddy directory

Write-Host "🚀 Building HeadyBuddy for Microsoft Store..." -ForegroundColor Cyan

# Check prerequisites
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm not found. Install Node.js first." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Build MSIX package
Write-Host "📦 Building MSIX package..." -ForegroundColor Yellow
npx electron-builder --win msix

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📁 Output: dist/HeadyBuddy-1.0.0.msix" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Get code signing certificate from DigiCert, Sectigo, or SSL.com" -ForegroundColor White
    Write-Host "2. Install Windows SDK for signtool.exe" -ForegroundColor White
    Write-Host "3. Sign the MSIX:" -ForegroundColor White
    Write-Host "   signtool sign /fd SHA256 /a /f your-cert.pfx /p password dist/HeadyBuddy-1.0.0.msix" -ForegroundColor Yellow
    Write-Host "4. Submit to Microsoft Store via Partner Center" -ForegroundColor White
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
}
