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
# ║  FILE: HeadyAcademy/Students/Wrappers/Call_Sentinel.ps1           ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

param(
    [Parameter(Mandatory=$false)]
    [string]$Action = "verify",

    [Parameter(Mandatory=$false)]
    [string]$Role = $env:HEADY_ROLE,

    [Parameter(Mandatory=$false)]
    [string]$User = $env:HEADY_USER,

    [Parameter(Mandatory=$false)]
    [switch]$Help
)

$BASE = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$ErrorActionPreference = "Stop"

function Show-Help {
    Write-Host @"
SENTINEL - Access Ledger Wrapper

USAGE:
    Call_Sentinel.ps1 [-Action <grant|verify>] [-Role <role>] [-User <user>]

PARAMETERS:
    Action   - grant or verify (default: verify)
    Role     - role name (default: HEADY_ROLE env or ADMIN)
    User     - user identifier (default: HEADY_USER env or USER)
    Help     - show this help message

EXAMPLES:
    Call_Sentinel.ps1 -Action verify -Role ADMIN -User alice
    Call_Sentinel.ps1 -Action grant -Role DEVOPS -User bob
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

    Write-Host "ERROR: Heady_Chain tool not found: $ToolPath" -ForegroundColor Red
    return $false
}

function Invoke-Sentinel {
    param(
        [string]$Action,
        [string]$Role,
        [string]$User
    )

    $toolPath = "$BASE\Tools\Heady_Chain.py"

    if (-not (Test-Python)) { return $false }
    if (-not (Test-ToolExists $toolPath)) { return $false }

    $actionNormalized = $Action.ToLower()
    $validActions = @("grant", "verify")
    if ($actionNormalized -notin $validActions) {
        Write-Host "ERROR: Invalid action '$Action'. Use grant or verify." -ForegroundColor Red
        return $false
    }

    if (-not $Role) { $Role = "ADMIN" }
    if (-not $User) { $User = "USER" }

    try {
        $output = & python $toolPath $actionNormalized $Role $User 2>&1
        $exitCode = $LASTEXITCODE

        $output | ForEach-Object { Write-Host $_ }

        if ($exitCode -ne 0) {
            Write-Host "ERROR: Sentinel failed with exit code $exitCode" -ForegroundColor Red
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

Write-Host "[SENTINEL] Action=$Action Role=$Role User=$User" -ForegroundColor Cyan

$success = Invoke-Sentinel -Action $Action -Role $Role -User $User

if ($success) {
    Write-Host "[SENTINEL] Completed" -ForegroundColor Green
    exit 0
}

Write-Host "[SENTINEL] Failed" -ForegroundColor Red
exit 1
