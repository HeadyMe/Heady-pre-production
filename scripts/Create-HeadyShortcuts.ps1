#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Create Desktop Shortcuts for Heady UIs with Branding
    
.DESCRIPTION
    Creates desktop shortcuts for Heady Admin UI and Main UI with custom icons
    Uses Sacred Geometry branding images
    
.NOTES
    Author: Eric Haywood (HeadySystems Inc.)
    Version: 1.0.0
#>

param(
    [switch]$Force,
    [string]$DesktopPath = [Environment]::GetFolderPath("Desktop")
)

$ErrorActionPreference = "Stop"

function Write-Sacred {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "🔷 $Message" -ForegroundColor $Color
}

function Convert-SvgToIco {
    param(
        [string]$SvgPath,
        [string]$IcoPath
    )
    
    Write-Sacred "Converting SVG to ICO: $SvgPath" "Cyan"
    
    # For now, we'll use the SVG directly or create a simple ICO
    # In production, you'd use ImageMagick or similar
    # For Windows shortcuts, we can reference the SVG or use a default icon
    
    return $SvgPath
}

function Create-Shortcut {
    param(
        [string]$Name,
        [string]$TargetUrl,
        [string]$IconPath,
        [string]$Description
    )
    
    $shortcutPath = Join-Path $DesktopPath "$Name.url"
    
    if ((Test-Path $shortcutPath) -and -not $Force) {
        Write-Sacred "⚠ Shortcut already exists: $Name (use -Force to overwrite)" "Yellow"
        return
    }
    
    # Create URL shortcut (Internet Shortcut)
    $shortcutContent = @"
[InternetShortcut]
URL=$TargetUrl
IconIndex=0
IconFile=$IconPath
"@
    
    Set-Content -Path $shortcutPath -Value $shortcutContent -Encoding ASCII
    Write-Sacred "✓ Created shortcut: $Name" "Green"
}

function Create-BrowserShortcut {
    param(
        [string]$Name,
        [string]$TargetUrl,
        [string]$IconPath,
        [string]$Description
    )
    
    $shortcutPath = Join-Path $DesktopPath "$Name.lnk"
    
    if ((Test-Path $shortcutPath) -and -not $Force) {
        Write-Sacred "⚠ Shortcut already exists: $Name (use -Force to overwrite)" "Yellow"
        return
    }
    
    # Create Windows Shortcut (.lnk)
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    
    # Use default browser to open URL
    $Shortcut.TargetPath = "cmd.exe"
    $Shortcut.Arguments = "/c start `"$Name`" `"$TargetUrl`""
    $Shortcut.Description = $Description
    $Shortcut.WindowStyle = 7  # Minimized
    
    # Try to set icon if available
    if (Test-Path $IconPath) {
        $Shortcut.IconLocation = $IconPath
    }
    
    $Shortcut.Save()
    Write-Sacred "✓ Created browser shortcut: $Name" "Green"
}

function Create-HeadyLauncher {
    param(
        [string]$Name,
        [string]$Command,
        [string]$IconPath,
        [string]$Description
    )
    
    $shortcutPath = Join-Path $DesktopPath "$Name.lnk"
    
    if ((Test-Path $shortcutPath) -and -not $Force) {
        Write-Sacred "⚠ Shortcut already exists: $Name (use -Force to overwrite)" "Yellow"
        return
    }
    
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    
    $Shortcut.TargetPath = "powershell.exe"
    $Shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -Command `"$Command`""
    $Shortcut.WorkingDirectory = $PSScriptRoot
    $Shortcut.Description = $Description
    
    if (Test-Path $IconPath) {
        $Shortcut.IconLocation = $IconPath
    }
    
    $Shortcut.Save()
    Write-Sacred "✓ Created launcher shortcut: $Name" "Green"
}

# Main Execution
try {
    Write-Host "`n"
    Write-Sacred "═══════════════════════════════════════════════════════" "DarkCyan"
    Write-Sacred "    HEADY DESKTOP SHORTCUTS - SACRED GEOMETRY BRANDING" "DarkCyan"
    Write-Sacred "═══════════════════════════════════════════════════════" "DarkCyan"
    Write-Host "`n"
    
    Write-Sacred "Desktop Path: $DesktopPath" "Magenta"
    Write-Host "`n"
    
    # Get absolute paths
    $projectRoot = $PSScriptRoot
    $adminIconPath = Join-Path $projectRoot "public\assets\heady-admin-logo.svg"
    $mainIconPath = Join-Path $projectRoot "public\assets\heady-logo.svg"
    
    # Verify icon files exist
    if (-not (Test-Path $adminIconPath)) {
        Write-Sacred "⚠ Admin icon not found: $adminIconPath" "Yellow"
        $adminIconPath = ""
    }
    
    if (-not (Test-Path $mainIconPath)) {
        Write-Sacred "⚠ Main icon not found: $mainIconPath" "Yellow"
        $mainIconPath = ""
    }
    
    # Create shortcuts
    Write-Sacred "Creating Heady UI Shortcuts..." "Cyan"
    Write-Host "`n"
    
    # 1. Heady Admin UI
    Create-BrowserShortcut `
        -Name "Heady Admin Console" `
        -TargetUrl "http://localhost:3300/admin" `
        -IconPath $adminIconPath `
        -Description "Heady Systems Admin Control Center - Governance & Orchestration"
    
    # 2. Heady Main UI
    Create-BrowserShortcut `
        -Name "Heady Systems" `
        -TargetUrl "http://localhost:3300" `
        -Description "Heady Systems - Sacred Geometry Interface"
    
    # 3. Heady Orchestrator Launcher
    $orchestratorCmd = "cd '$projectRoot'; npm run orchestrate"
    Create-HeadyLauncher `
        -Name "Start Heady Orchestrator" `
        -Command $orchestratorCmd `
        -IconPath $mainIconPath `
        -Description "Launch Heady Unified Orchestration System"
    
    # 4. Heady Manager Launcher
    $managerCmd = "cd '$projectRoot'; npm start"
    Create-HeadyLauncher `
        -Name "Start Heady Manager" `
        -Command $managerCmd `
        -IconPath $mainIconPath `
        -Description "Launch Heady Manager API Server"
    
    # 5. Codex Builder Launcher
    $codexCmd = "cd '$projectRoot'; npm run codex:build; Read-Host 'Press Enter to close'"
    Create-HeadyLauncher `
        -Name "Run Codex Builder" `
        -Command $codexCmd `
        -IconPath $adminIconPath `
        -Description "Execute Codex v13 Deterministic Repository Builder"
    
    Write-Host "`n"
    Write-Sacred "═══════════════════════════════════════════════════════" "DarkCyan"
    Write-Sacred "✨ Desktop shortcuts created successfully!" "Green"
    Write-Sacred "═══════════════════════════════════════════════════════" "DarkCyan"
    Write-Host "`n"
    
    Write-Sacred "📌 Shortcuts created on desktop:" "Magenta"
    Write-Sacred "   • Heady Admin Console (http://localhost:3300/admin)" "Cyan"
    Write-Sacred "   • Heady Systems (http://localhost:3300)" "Cyan"
    Write-Sacred "   • Start Heady Orchestrator" "Cyan"
    Write-Sacred "   • Start Heady Manager" "Cyan"
    Write-Sacred "   • Run Codex Builder" "Cyan"
    Write-Host "`n"
    
    Write-Sacred "🔷 Sacred Geometry branding applied!" "Green"
    Write-Host "`n"
    
} catch {
    Write-Host "`n❌ Shortcut creation failed: $_" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor DarkGray
    exit 1
}
