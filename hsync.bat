@echo off
REM HEADY_BRAND:BEGIN
REM HEADY SYSTEMS :: SACRED GEOMETRY
REM FILE: hsync.bat
REM LAYER: root
REM HEADY_BRAND:END

REM HeadySync - Shortcut command for comprehensive sync workflow
REM Usage: hsync [message]

setlocal enabledelayedexpansion

if "%~1"=="" (
    powershell -ExecutionPolicy Bypass -File "%~dp0heady_sync.ps1"
) else (
    powershell -ExecutionPolicy Bypass -File "%~dp0heady_sync.ps1" -Message "%*"
)

endlocal
