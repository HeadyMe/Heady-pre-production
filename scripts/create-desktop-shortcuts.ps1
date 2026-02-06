# HEADY_BRAND:BEGIN
# ╔══════════════════════════════════════════════════════════════════╗
# ║  █╗  █╗███████╗ █████╗ ██████╗ █╗   █╗                     ║
# ║  █║  █║█╔════╝█╔══█╗█╔══█╗╚█╗ █╔╝                     ║
# ║  ███████║█████╗  ███████║█║  █║ ╚████╔╝                      ║
# ║  █╔══█║█╔══╝  █╔══█║█║  █║  ╚█╔╝                       ║
# ║  █║  █║███████╗█║  █║██████╔╝   █║                        ║
# ║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                        ║
# ║                                                                  ║
# ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
# ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
# ║  FILE: scripts/create-desktop-shortcuts.ps1                       ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

$WScriptShell = New-Object -ComObject WScript.Shell
$desktop = [Environment]::GetFolderPath("Desktop")

# Heady Systems Main Application
$mainShortcut = $WScriptShell.CreateShortcut("$desktop\Heady Systems.lnk")
$mainShortcut.TargetPath = "node.exe"
$mainShortcut.Arguments = "backend\index.js"
$mainShortcut.WorkingDirectory = "c:\Users\erich\Heady"
$mainShortcut.IconLocation = "node.exe, 0"
$mainShortcut.Description = "Heady Systems - Sacred Geometry Architecture Platform"
$mainShortcut.Save()

# Heady Admin IDE
$adminShortcut = $WScriptShell.CreateShortcut("$desktop\Heady Admin IDE.lnk")
$adminShortcut.TargetPath = "http://localhost:3300/admin"
$adminShortcut.WorkingDirectory = "c:\Users\erich\Heady"
$adminShortcut.IconLocation = "shell32.dll, 14"
$adminShortcut.Description = "Heady Admin IDE - Web-based Development Environment"
$adminShortcut.Save()

# Heady Development Console
$devShortcut = $WScriptShell.CreateShortcut("$desktop\Heady Dev Console.lnk")
$devShortcut.TargetPath = "powershell.exe"
$devShortcut.Arguments = "-NoExit -Command `"cd 'c:\Users\erich\Heady'; npm run dev`""
$devShortcut.WorkingDirectory = "c:\Users\erich\Heady"
$devShortcut.IconLocation = "powershell.exe, 0"
$devShortcut.Description = "Heady Development Console - Full Stack Development"
$devShortcut.Save()

# Heady Build System
$buildShortcut = $WScriptShell.CreateShortcut("$desktop\Heady Build System.lnk")
$buildShortcut.TargetPath = "powershell.exe"
$buildShortcut.Arguments = "-NoExit -Command `"cd 'c:\Users\erich\Heady'; python src\consolidated_builder.py --project-root . --output build-info.json`""
$buildShortcut.WorkingDirectory = "c:\Users\erich\Heady"
$buildShortcut.IconLocation = "shell32.dll, 21"
$buildShortcut.Description = "Heady Build System - Automated Build Orchestration"
$buildShortcut.Save()

# Heady System Monitor
$monitorShortcut = $WScriptShell.CreateShortcut("$desktop\Heady System Monitor.lnk")
$monitorShortcut.TargetPath = "powershell.exe"
$monitorShortcut.Arguments = "-NoExit -Command `"cd 'c:\Users\erich\Heady'; python admin_console.py --project-root . --check health`""
$monitorShortcut.WorkingDirectory = "c:\Users\erich\Heady"
$monitorShortcut.IconLocation = "shell32.dll, 15"
$monitorShortcut.Description = "Heady System Monitor - Health and Performance Monitoring"
$monitorShortcut.Save()

# Heady Documentation Portal
$docsShortcut = $WScriptShell.CreateShortcut("$desktop\Heady Documentation.lnk")
$docsShortcut.TargetPath = "http://localhost:3300"
$docsShortcut.WorkingDirectory = "c:\Users\erich\Heady"
$docsShortcut.IconLocation = "shell32.dll, 23"
$docsShortcut.Description = "Heady Documentation Portal - System Documentation and Guides"
$docsShortcut.Save()

Write-Host "Heady Systems desktop shortcuts created successfully!" -ForegroundColor Green
Write-Host "Location: $desktop" -ForegroundColor Cyan
Write-Host ""
Write-Host "Available Shortcuts:" -ForegroundColor Yellow
Write-Host "   Heady Systems - Main application server" -ForegroundColor White
Write-Host "   Heady Admin IDE - Web-based development environment" -ForegroundColor White
Write-Host "   Heady Dev Console - Full-stack development console" -ForegroundColor White
Write-Host "   Heady Build System - Automated build orchestration" -ForegroundColor White
Write-Host "   Heady System Monitor - Health and performance monitoring" -ForegroundColor White
Write-Host "   Heady Documentation - System documentation portal" -ForegroundColor White
