@echo off
pwsh -File "%~dp0scripts\New-Checkpoint.ps1" %*
if %ERRORLEVEL% NEQ 0 exit /b 1
node src\hc_autobuild.js %*
