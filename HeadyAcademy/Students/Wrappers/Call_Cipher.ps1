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
# ║  FILE: HeadyAcademy/Students/Wrappers/Call_Cipher.ps1             ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

param(
    [Parameter(Mandatory=$false)]
    [string]$Target = "",

    [Parameter(Mandatory=$false)]
    [switch]$OpenOutput,

    [Parameter(Mandatory=$false)]
    [switch]$Help
)

$BASE = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$ErrorActionPreference = "Stop"

function Show-Help {
    Write-Host @"
CIPHER - Heady Crypt Wrapper

USAGE:
    Call_Cipher.ps1 -Target <file> [-OpenOutput]

PARAMETERS:
    Target      - File to obfuscate
    OpenOutput  - Open the generated output file
    Help        - Show this help message

EXAMPLES:
    Call_Cipher.ps1 -Target "secrets.txt"
    Call_Cipher.ps1 -Target "config.json" -OpenOutput
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

    Write-Host "ERROR: Heady_Crypt tool not found: $ToolPath" -ForegroundColor Red
    return $false
}

function Resolve-TargetPath {
    param([string]$TargetPath)

    if (-not $TargetPath) {
        Write-Host "ERROR: Target file is required" -ForegroundColor Red
        return $null
    }

    try {
        $resolvedPath = Resolve-Path $TargetPath -ErrorAction Stop
        if (Test-Path $resolvedPath -PathType Leaf) {
            return $resolvedPath.Path
        }

        Write-Host "ERROR: Target is not a file: $TargetPath" -ForegroundColor Red
        return $null
    } catch {
        Write-Host "ERROR: Target file not found: $TargetPath" -ForegroundColor Red
        return $null
    }
}

function Get-OutputPath {
    param([string[]]$Lines)

    foreach ($line in $Lines) {
        if ($line -match "Output:\s*(.+)$") {
            return $Matches[1].Trim()
        }
    }

    return $null
}

function Invoke-Cipher {
    param(
        [string]$TargetPath,
        [switch]$OpenOutput
    )

    $toolPath = "$BASE\Tools\Heady_Crypt.py"

    if (-not (Test-Python)) { return $false }
    if (-not (Test-ToolExists $toolPath)) { return $false }

    $resolvedTarget = Resolve-TargetPath $TargetPath
    if (-not $resolvedTarget) { return $false }

    try {
        $output = & python $toolPath $resolvedTarget 2>&1
        $exitCode = $LASTEXITCODE

        $output | ForEach-Object { Write-Host $_ }

        if ($exitCode -ne 0) {
            Write-Host "ERROR: CIPHER failed with exit code $exitCode" -ForegroundColor Red
            return $false
        }

        if ($OpenOutput) {
            $outputPath = Get-OutputPath -Lines $output
            if ($outputPath) {
                if (Test-Path $outputPath) {
                    Start-Process $outputPath
                } else {
                    Write-Host "WARN: Output file not found at $outputPath" -ForegroundColor Yellow
                }
            } else {
                Write-Host "WARN: Output path not detected in output" -ForegroundColor Yellow
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

Write-Host "[CIPHER] Obfuscating target" -ForegroundColor Cyan

$success = Invoke-Cipher -TargetPath $Target -OpenOutput:$OpenOutput

if ($success) {
    Write-Host "[CIPHER] Completed" -ForegroundColor Green
    exit 0
}

Write-Host "[CIPHER] Failed" -ForegroundColor Red
exit 1
