@echo off
REM HCAutoBuild Status Check
powershell -ExecutionPolicy Bypass -File "%~dp0hcautobuild.ps1" -status
