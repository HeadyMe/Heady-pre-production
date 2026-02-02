@echo off
cd /d "C:\Users\erich\Heady"
powershell -ExecutionPolicy Bypass -File "C:\Users\erich\Heady\scripts\Invoke-Checkpoint.ps1" %*
