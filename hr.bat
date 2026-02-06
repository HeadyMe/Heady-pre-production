@echo off
REM Heady Recon & Build Shortcut
REM Usage: hr "your task description" OR hr --monitor

if "%~1"=="--monitor" (
    echo [HR] Initiating Real-time System Monitor...
    node scripts/monitor.js
    exit /b
)

echo [HR] Initiating Heady Recon...
node -e "const HeadyRecon = require('./scripts/recon.js'); const recon = new HeadyRecon(); const analysis = recon.analyzeInput('%~1'); console.log(JSON.stringify(recon.generateReport(analysis), null, 2));"

echo.
echo [HR] Prepping HCAutoBuild...
pwsh -File .\commit_and_build.ps1

echo.
echo [HR] Synchronizing Remotes...
pwsh -File .\nexus_deploy.ps1

echo.
echo [HR] Status Report Generated.
