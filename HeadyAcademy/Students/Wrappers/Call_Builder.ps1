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
# ║  FILE: HeadyAcademy/Students/Wrappers/Call_Builder.ps1            ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

param(
    [Parameter(Mandatory=$false)]
    [string]$Project = "new_project",

    [Parameter(Mandatory=$false)]
    [string]$Template = "python",

    [Parameter(Mandatory=$false)]
    [switch]$Help
)

$BASE = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$ErrorActionPreference = "Stop"

function Show-Help {
    Write-Host @"
BUILDER - Project Scaffolding Wrapper

USAGE:
    Call_Builder.ps1 [-Project <name>] [-Template <type>]

PARAMETERS:
    Project     - Name of the project to create (default: new_project)
    Template    - Project template type (default: python)
    Help        - Show this help message

EXAMPLES:
    Call_Builder.ps1
    Call_Builder.ps1 -Project "myapp" -Template "python"
    Call_Builder.ps1 -Project "webapp" -Template "web"
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

    Write-Host "ERROR: Hydrator tool not found: $ToolPath" -ForegroundColor Red
    return $false
}

function Test-ProjectName {
    param([string]$Name)

    if (-not $Name) {
        Write-Host "ERROR: Project name is required" -ForegroundColor Red
        return $false
    }

    if ($Name -match '[^\w\-]') {
        Write-Host "ERROR: Project name contains invalid characters" -ForegroundColor Red
        return $false
    }

    return $true
}

function Invoke-Builder {
    param(
        [string]$ProjectName,
        [string]$TemplateType
    )

    $toolPath = "$BASE\Tools\Hydrator.py"

    if (-not (Test-Python)) { return $false }
    if (-not (Test-ToolExists $toolPath)) { return $false }
    if (-not (Test-ProjectName $ProjectName)) { return $false }

    try {
        $output = & python $toolPath $ProjectName $TemplateType 2>&1
        $exitCode = $LASTEXITCODE

        $output | ForEach-Object { Write-Host $_ }

        if ($exitCode -ne 0) {
            Write-Host "ERROR: Builder failed with exit code $exitCode" -ForegroundColor Red
            return $false
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

Write-Host "[BUILDER] Hydrating new project $Project..." -ForegroundColor Cyan

$success = Invoke-Builder -ProjectName $Project -TemplateType $Template

if ($success) {
    Write-Host "[BUILDER] Completed" -ForegroundColor Green
    exit 0
}

Write-Host "[BUILDER] Failed" -ForegroundColor Red
exit 1
