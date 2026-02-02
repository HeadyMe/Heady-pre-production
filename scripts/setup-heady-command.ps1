#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Setup global 'heady' command with automatic MCP integration

.DESCRIPTION
    Installs the 'heady' command globally so any command can utilize HeadyMCP services
#>

param(
    [switch]$Uninstall
)

$ErrorActionPreference = 'Stop'

$ScriptRoot = Split-Path -Parent $PSScriptRoot
$WrapperScript = Join-Path $ScriptRoot 'scripts' 'heady-command-wrapper.ps1'
$BinDir = Join-Path $ScriptRoot 'scripts' 'bin'

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

function Install-HeadyCommand {
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║       Heady Command - Global MCP Integration             ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    # Create bin directory
    if (-not (Test-Path $BinDir)) {
        New-Item -ItemType Directory -Path $BinDir -Force | Out-Null
    }
    
    # Create heady.ps1 in bin
    $headyScript = Join-Path $BinDir 'heady.ps1'
    $scriptContent = @"
#!/usr/bin/env pwsh
& '$WrapperScript' @args
"@
    $scriptContent | Out-File -FilePath $headyScript -Encoding UTF8
    Write-Status 'Created heady.ps1 in bin directory' 'Success'
    
    # Create heady.bat for cmd.exe
    $headyBat = Join-Path $BinDir 'heady.bat'
    $batContent = "@echo off`npowershell -ExecutionPolicy Bypass -File `"$WrapperScript`" %*"
    $batContent | Out-File -FilePath $headyBat -Encoding ASCII
    Write-Status 'Created heady.bat for cmd.exe' 'Success'
    
    # Add to PATH
    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    if ($userPath -notlike "*$BinDir*") {
        $newPath = "$userPath;$BinDir"
        [Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
        Write-Status "Added to PATH: $BinDir" 'Success'
    } else {
        Write-Status 'Already in PATH' 'Warning'
    }
    
    # Create PowerShell profile alias
    $profilePath = $PROFILE.CurrentUserAllHosts
    $aliasLine = "Set-Alias -Name heady -Value '$headyScript' -Scope Global"
    
    if (Test-Path $profilePath) {
        $profileContent = Get-Content $profilePath -Raw
        if ($profileContent -notlike "*heady*") {
            Add-Content -Path $profilePath -Value "`n# Heady Command with MCP Integration"
            Add-Content -Path $profilePath -Value $aliasLine
            Write-Status 'Added alias to PowerShell profile' 'Success'
        }
    } else {
        $profileDir = Split-Path -Parent $profilePath
        if (-not (Test-Path $profileDir)) {
            New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
        }
        '# Heady Command with MCP Integration' | Out-File -FilePath $profilePath -Encoding UTF8
        $aliasLine | Out-File -FilePath $profilePath -Append -Encoding UTF8
        Write-Status 'Created PowerShell profile with alias' 'Success'
    }
    
    Write-Host ''
    Write-Status 'Installation Complete!' 'Success'
    Write-Host ""
    Write-Host 'USAGE:' -ForegroundColor Yellow
    Write-Host '  heady <command> [args...]'
    Write-Host ""
    Write-Host "EXAMPLES:" -ForegroundColor Yellow
    Write-Host "  heady npm install       # npm with MCP filesystem monitoring"
    Write-Host "  heady git status        # git with MCP version control"
    Write-Host "  heady node script.js    # node with full MCP context"
    Write-Host "  heady autobuild         # autobuild with MCP intelligence"
    Write-Host ""
    Write-Host "FEATURES:" -ForegroundColor Yellow
    Write-Host "  ✓ Automatic connection to all 8 MCP services"
    Write-Host "  ✓ Intelligent context gathering"
    Write-Host "  ✓ Command-specific suggestions"
    Write-Host "  ✓ Post-execution analysis"
    Write-Host "  ✓ Sequential thinking for complex operations"
    Write-Host ""
    Write-Host "NOTE:" -ForegroundColor Yellow
    Write-Host "  Restart your terminal or run: . `$PROFILE"
    Write-Host "  to activate the 'heady' command in current session"
    Write-Host ""
}

function Uninstall-HeadyCommand {
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║         Heady Command - Uninstallation                   ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    # Remove from PATH
    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    if ($userPath -like "*$BinDir*") {
        $newPath = $userPath -replace [regex]::Escape(";$BinDir"), ''
        $newPath = $newPath -replace [regex]::Escape("$BinDir;"), ''
        [Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
        Write-Status 'Removed from PATH' 'Success'
    }
    
    # Remove from profile
    $profilePath = $PROFILE.CurrentUserAllHosts
    if (Test-Path $profilePath) {
        $profileContent = Get-Content $profilePath
        $newContent = $profileContent | Where-Object { $_ -notlike "*heady*" }
        $newContent | Out-File -FilePath $profilePath -Encoding UTF8
        Write-Status 'Removed from PowerShell profile' 'Success'
    }
    
    Write-Host ''
    Write-Status 'Uninstallation Complete!' 'Success'
    Write-Host ''
}

# Main execution
if ($Uninstall) {
    Uninstall-HeadyCommand
} else {
    Install-HeadyCommand
}
