@echo off
REM HEADY SYSTEMS :: HCAutoBuild Shortcut
REM Usage: hc_autobuild [options]
REM Options: -Continuous, -ForceCheckpoint, -StatusOnly

powershell -ExecutionPolicy Bypass -File "%~dp0hc_autobuild.ps1" %*
