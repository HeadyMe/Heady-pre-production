@echo off
REM HCAutoBuild Force Checkpoint
powershell -ExecutionPolicy Bypass -File "%~dp0hcautobuild.ps1" -checkpoint
