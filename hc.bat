@echo off
<<<<<<< C:/Users/erich/Heady/hc.bat
cd /d "C:\Users\erich\Heady"
powershell -ExecutionPolicy Bypass -File "C:\Users\erich\Heady\scripts\Invoke-Checkpoint.ps1" %*
=======
setlocal
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"
powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%scripts\hc.ps1" %*
endlocal
>>>>>>> C:/Users/erich/.windsurf/worktrees/Heady/Heady-94472bd8/hc.bat
