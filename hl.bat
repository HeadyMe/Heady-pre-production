@echo off
REM Heady Layer Switcher - Quick Launcher
REM Usage: hl              (show current layer)
REM        hl list          (list all layers with health)
REM        hl switch local  (switch to local)
REM        hl switch cloud-me  (switch to HeadyMe cloud)
REM        hl health        (health check all layers)
cd /d "C:\Users\erich\Heady"
powershell -ExecutionPolicy Bypass -File "C:\Users\erich\Heady\scripts\heady-layer.ps1" %*
