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
# ║  FILE: HeadyAcademy/Students/Wrappers/Call_Observer.ps1           ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

param(
    [Parameter(Mandatory=$false)]
    [switch]$Foreground,

    [Parameter(Mandatory=$false)]
    [switch]$Help
)

$BASE = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$ErrorActionPreference = "Stop"

function Show-Help {
    Write-Host @"
OBSERVER - Playground Monitor Wrapper

USAGE:
    Call_Observer.ps1 [-Foreground]

PARAMETERS:
    Foreground  - Run in the current terminal (blocks)
    Help        - Show this help message

EXAMPLES:
    Call_Observer.ps1
    Call_Observer.ps1 -Foreground
"@
}

function Test-Python {
    try {
        $null = Get-Command python -ErrorAction Stop
        return $true
    } catch {
        Write-Host "ERROR: Python not found in PATH" -ForegroundColor Red
        return $false
    }
}

function Test-ToolExists {
    param([string]$ToolPath)

    if (Test-Path $ToolPath) {
        return $true
    }

    Write-Host "ERROR: Observer daemon not found: $ToolPath" -ForegroundColor Red
    return $false
}

function Start-Observer {
    param([switch]$Foreground)

    $toolPath = "$BASE\Tools\Daemons\Natural_Observer.py"

    if (-not (Test-Python)) { return $false }
    if (-not (Test-ToolExists $toolPath)) { return $false }

    try {
        if ($Foreground) {
            & python $toolPath
            if ($LASTEXITCODE -eq 0) {
                return $true
            }

            Write-Host "ERROR: Observer exited with code $LASTEXITCODE" -ForegroundColor Red
            return $false
        }

        $process = Start-Process -NoNewWindow -FilePath "python" -ArgumentList $toolPath -WorkingDirectory $BASE -PassThru
        if ($process) {
            Write-Host "[OBSERVER] Daemon started (PID: $($process.Id))" -ForegroundColor Green
            return $true
        }

        Write-Host "ERROR: Failed to launch observer process" -ForegroundColor Red
        return $false
    } catch {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

if ($Help) {
    Show-Help
    exit 0
}

Write-Host "[OBSERVER] Launching Playground monitor" -ForegroundColor Cyan

$success = Start-Observer -Foreground:$Foreground

if ($success) {
    Write-Host "[OBSERVER] Running" -ForegroundColor Green
    exit 0
}

Write-Host "[OBSERVER] Failed" -ForegroundColor Red
exit 1
