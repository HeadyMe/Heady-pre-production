@echo off
cd /d "C:\Users\erich\Heady"
node src\heady_intelligence_verifier.js
if %ERRORLEVEL% NEQ 0 exit /b 1
node src\hc_autobuild.js %*
