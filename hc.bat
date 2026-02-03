@echo off
<<<<<<< C:/Users/erich/Heady/hc.bat
<<<<<<< C:/Users/erich/Heady/hc.bat
<<<<<<< C:/Users/erich/Heady/hc.bat
<<<<<<< C:/Users/erich/Heady/hc.bat
cd /d "C:\Users\erich\Heady"
powershell -ExecutionPolicy Bypass -File "C:\Users\erich\Heady\scripts\Invoke-Checkpoint.ps1" %*
=======
=======
>>>>>>> C:/Users/erich/.windsurf/worktrees/Heady/Heady-e3f3d3cd/hc.bat
=======
>>>>>>> C:/Users/erich/.windsurf/worktrees/Heady/Heady-e3f3d3cd/hc.bat
=======
>>>>>>> C:/Users/erich/.windsurf/worktrees/Heady/Heady-20681cb5/hc.bat
setlocal
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"
powershell -ExecutionPolicy Bypass -File ".\scripts\hc.ps1" %*
endlocal
