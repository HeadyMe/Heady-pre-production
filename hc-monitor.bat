@echo off
REM HCAutoBuild Continuous Monitoring
powershell -ExecutionPolicy Bypass -File "%~dp0hcautobuild.ps1" -monitor
