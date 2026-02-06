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
# ║  FILE: HeadyAcademy/Students/Wrappers/Call_Atlas.ps1              ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

param(
    [Parameter(Mandatory=$false)]
    [string]$Target = ".",

    [Parameter(Mandatory=$false)]
    [switch]$OpenReport,

    [Parameter(Mandatory=$false)]
    [switch]$Help
)

$BASE = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$ErrorActionPreference = "Stop"

function Show-Help {
    Write-Host @"
ATLAS - Documentation Generator Wrapper

USAGE:
    Call_Atlas.ps1 [-Target <path>] [-OpenReport]

PARAMETERS:
    Target      - File or directory to document (default: current directory)
    OpenReport  - Open the generated documentation after completion
    Help        - Show this help message

EXAMPLES:
    Call_Atlas.ps1
    Call_Atlas.ps1 -Target "src/" -OpenReport
    Call_Atlas.ps1 -Target "main.py"
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

    Write-Host "ERROR: Auto_Doc tool not found: $ToolPath" -ForegroundColor Red
    return $false
}

function Resolve-TargetPath {
    param([string]$TargetPath)

    if (-not $TargetPath) {
        $TargetPath = "."
    }

    try {
        $resolvedPath = Resolve-Path $TargetPath -ErrorAction Stop
        return $resolvedPath.Path
    } catch {
        Write-Host "ERROR: Target path not found: $TargetPath" -ForegroundColor Red
        return $null
    }
}

function Get-ReportPath {
    param([string[]]$Lines)

    foreach ($line in $Lines) {
        if ($line -match "Documentation saved to:\s*(.+)$") {
            return $Matches[1].Trim()
        }
    }

    return $null
}

function Invoke-Atlas {
    param(
        [string]$TargetPath,
        [switch]$OpenReport
    )

    $toolPath = "$BASE\Tools\Auto_Doc.py"

    if (-not (Test-Python)) { return $false }
    if (-not (Test-ToolExists $toolPath)) { return $false }

    $resolvedTarget = Resolve-TargetPath $TargetPath
    if (-not $resolvedTarget) { return $false }

    try {
        $output = & python $toolPath $resolvedTarget 2>&1
        $exitCode = $LASTEXITCODE

        $output | ForEach-Object { Write-Host $_ }

        if ($exitCode -ne 0) {
            Write-Host "ERROR: Atlas failed with exit code $exitCode" -ForegroundColor Red
            return $false
        }

        if ($OpenReport) {
            $reportPath = Get-ReportPath -Lines $output
            if ($reportPath) {
                if (Test-Path $reportPath) {
                    Start-Process $reportPath
                } else {
                    Write-Host "WARN: Report not found at $reportPath" -ForegroundColor Yellow
                }
            } else {
                Write-Host "WARN: Report path not detected in output" -ForegroundColor Yellow
            }
        }

        return $true
    } catch {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

if ($Help) {
    Show-Help
    exit 0
}

Write-Host "[ATLAS] Auto-documenting $Target" -ForegroundColor Cyan

$success = Invoke-Atlas -TargetPath $Target -OpenReport:$OpenReport

if ($success) {
    Write-Host "[ATLAS] Completed" -ForegroundColor Green
    exit 0
}

Write-Host "[ATLAS] Failed" -ForegroundColor Red
exit 1
