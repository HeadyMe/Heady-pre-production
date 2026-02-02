#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Install HCAB (HC AutoBuild) as a global command

.DESCRIPTION
    Adds HCAB to system PATH for global access
#>

param(
    [switch]$Uninstall
)

$ErrorActionPreference = 'Stop'

$ScriptRoot = Split-Path -Parent $PSScriptRoot
$BinDir = Join-Path $ScriptRoot 'scripts' 'bin'
$HCABScript = Join-Path $BinDir 'hcab.ps1'

function Write-Status {
    param([string]$Message, [string]$Level = 'Info')
    
    $color = switch ($Level) {
        'Success' { 'Green' }
        'Warning' { 'Yellow' }
        'Error' { 'Red' }
        default { 'Cyan' }
    }
    
    $prefix = switch ($Level) {
        'Success' { '✓' }
        'Warning' { '⚠' }
        'Error' { '✗' }
        default { 'ℹ' }
    }
    
    Write-Host "$prefix $Message" -ForegroundColor $color
}

function Install-HCAB {
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║         HCAB Global Installation                      ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    # Create bin directory if it doesn't exist
    if (-not (Test-Path $BinDir)) {
        New-Item -ItemType Directory -Path $BinDir -Force | Out-Null
        Write-Status "Created bin directory: $BinDir" "Success"
    }
    
    # Verify HCAB script exists
    if (-not (Test-Path $HCABScript)) {
        Write-Status "HCAB script not found at: $HCABScript" "Error"
        exit 1
    }
    
    # Get current user PATH
    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    
    # Check if already in PATH
    if ($userPath -like "*$BinDir*") {
        Write-Status "HCAB bin directory already in PATH" "Warning"
    } else {
        # Add to PATH
        $newPath = "$userPath;$BinDir"
        [Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
        Write-Status "Added HCAB bin directory to PATH" "Success"
        Write-Status "PATH: $BinDir" "Info"
    }
    
    # Create PowerShell profile alias
    $profilePath = $PROFILE.CurrentUserAllHosts
    $aliasLine = "Set-Alias -Name hcab -Value '$HCABScript' -Scope Global"
    
    if (Test-Path $profilePath) {
        $profileContent = Get-Content $profilePath -Raw
        if ($profileContent -notlike "*hcab*") {
            Add-Content -Path $profilePath -Value "`n# HC AutoBuild Global Alias"
            Add-Content -Path $profilePath -Value $aliasLine
            Write-Status "Added alias to PowerShell profile" "Success"
        } else {
            Write-Status "Alias already exists in PowerShell profile" "Warning"
        }
    } else {
        # Create profile if it doesn't exist
        $profileDir = Split-Path -Parent $profilePath
        if (-not (Test-Path $profileDir)) {
            New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
        }
        
        "# HC AutoBuild Global Alias" | Out-File -FilePath $profilePath -Encoding UTF8
        $aliasLine | Out-File -FilePath $profilePath -Append -Encoding UTF8
        Write-Status "Created PowerShell profile with alias" "Success"
    }
    
    # Create batch file for cmd.exe compatibility
    $batchFile = Join-Path $BinDir 'hcab.bat'
    $batchContent = "@echo off`npowershell -ExecutionPolicy Bypass -File `"$HCABScript`" %*"
    $batchContent | Out-File -FilePath $batchFile -Encoding ASCII
    Write-Status "Created batch file for cmd.exe: hcab.bat" "Success"
    
    Write-Host ""
    Write-Status "Installation Complete!" "Success"
    Write-Host ""
    Write-Host "USAGE:" -ForegroundColor Yellow
    Write-Host "  hcab build              - Full autobuild cycle"
    Write-Host "  hcab merge              - Intelligent merge"
    Write-Host "  hcab analyze            - Analyze codebase"
    Write-Host "  hcab test               - Run tests"
    Write-Host "  hcab deploy -Target staging"
    Write-Host ""
    Write-Host "NOTE:" -ForegroundColor Yellow
    Write-Host "  Restart your terminal or run: . `$PROFILE"
    Write-Host "  to activate the 'hcab' command in current session"
    Write-Host ""
}

function Uninstall-HCAB {
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║         HCAB Global Uninstallation                    ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    # Remove from PATH
    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    if ($userPath -like "*$BinDir*") {
        $newPath = $userPath -replace [regex]::Escape(";$BinDir"), ''
        $newPath = $newPath -replace [regex]::Escape("$BinDir;"), ''
        [Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
        Write-Status "Removed HCAB bin directory from PATH" "Success"
    }
    
    # Remove from PowerShell profile
    $profilePath = $PROFILE.CurrentUserAllHosts
    if (Test-Path $profilePath) {
        $profileContent = Get-Content $profilePath
        $newContent = $profileContent | Where-Object { $_ -notlike "*hcab*" }
        $newContent | Out-File -FilePath $profilePath -Encoding UTF8
        Write-Status "Removed alias from PowerShell profile" "Success"
    }
    
    Write-Host ""
    Write-Status "Uninstallation Complete!" "Success"
    Write-Host ""
}

# Main execution
if ($Uninstall) {
    Uninstall-HCAB
} else {
    Install-HCAB
}
