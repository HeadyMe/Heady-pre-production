@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"
powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%scripts\hc.ps1" %*
endlocal
