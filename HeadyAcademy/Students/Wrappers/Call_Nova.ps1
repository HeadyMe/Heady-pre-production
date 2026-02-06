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
# ║  FILE: HeadyAcademy/Students/Wrappers/Call_Nova.ps1               ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

param(
    [Parameter(Mandatory=$false)]
    [string]$Path = ".",
    
    [Parameter(Mandatory=$false)]
    [string]$ScanType = "all",
    
    [Parameter(Mandatory=$false)]
    [switch]$Detailed,
    
    [Parameter(Mandatory=$false)]
    [switch]$Fix,
    
    [Parameter(Mandatory=$false)]
    [switch]$Help,
    
    [Parameter(Mandatory=$false)]
    [string]$Output = ""
)

$BASE = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$ErrorActionPreference = "Stop"

function Show-Help {
    Write-Host @"
NOVA - Heady Academy Gap Scanner & Analyzer

USAGE:
    Call_Nova.ps1 [-Path <path>] [-ScanType <type>] [-Detailed] [-Fix] [-Output <file>]

PARAMETERS:
    Path        - Target path to scan (default: current directory)
    ScanType    - Type of scan to perform:
                  all     - All gap types (default)
                  code    - Code quality gaps
                  deps    - Dependency gaps
                  docs    - Documentation gaps
                  security- Security gaps
                  perf    - Performance gaps
    Detailed    - Show detailed analysis with recommendations
    Fix         - Attempt to fix identified gaps automatically
    Output      - Save report to specified file
    Help        - Show this help message

SCAN TYPES:
    all         - Comprehensive scan of all gap types
    code        - Missing error handling, unused imports, dead code
    deps        - Missing dependencies, version conflicts
    docs        - Missing documentation, outdated README
    security    - Security vulnerabilities, hardcoded secrets
    perf        - Performance bottlenecks, inefficient code

EXAMPLES:
    Call_Nova.ps1                                    # Scan current directory
    Call_Nova.ps1 -Path ".." -Detailed               # Detailed scan of parent
    Call_Nova.ps1 -ScanType security -Fix            # Fix security issues
    Call_Nova.ps1 -ScanType code -Output report.md   # Save code analysis
    Call_Nova.ps1 -Path "src/" -Detailed -Fix        # Detailed scan with fixes
"@
}

function Test-Python {
    try {
        $null = Get-Command python -ErrorAction Stop
        return $true
    } catch {
        Write-Host "❌ Python not found in PATH" -ForegroundColor Red
        return $false
    }
}

function Test-ToolExists {
    param([string]$ToolPath)
    
    if (Test-Path $ToolPath) {
        return $true
    } else {
        Write-Host "❌ Gap Scanner tool not found: $ToolPath" -ForegroundColor Red
        return $false
    }
}

function Test-TargetPath {
    param([string]$TargetPath)
    
    try {
        $resolvedPath = Resolve-Path $TargetPath -ErrorAction Stop
        if (Test-Path $resolvedPath -PathType Container) {
            return $resolvedPath.Path
        } else {
            Write-Host "❌ Target is not a directory: $TargetPath" -ForegroundColor Red
            return $null
        }
    } catch {
        Write-Host "❌ Target path not found: $TargetPath" -ForegroundColor Red
        return $null
    }
}

function Invoke-NovaScan {
    param(
        [string]$TargetPath,
        [string]$ScanType,
        [switch]$Detailed,
        [switch]$Fix,
        [string]$OutputFile
    )
    
    $toolPath = "$BASE\Tools\Gap_Scanner.py"
    
    if (-not (Test-Python)) { return $false }
    if (-not (Test-ToolExists $toolPath)) { return $false }
    
    $validPath = Test-TargetPath $TargetPath
    if (-not $validPath) { return $false }
    
    # Build arguments
    $arguments = @($validPath, "--type", $ScanType)
    
    if ($Detailed) { $arguments += "--detailed" }
    if ($Fix) { $arguments += "--fix" }
    if ($OutputFile) { $arguments += "--output", $OutputFile }
    
    try {
        Write-Host "[NOVA] Initiating gap analysis..." -ForegroundColor Cyan
        Write-Host "Target: $validPath" -ForegroundColor Gray
        Write-Host "Scan Type: $ScanType" -ForegroundColor Gray
        Write-Host "Options: Detailed=$($Detailed.IsPresent), Fix=$($Fix.IsPresent)" -ForegroundColor Gray
        
        if ($OutputFile) {
            Write-Host "Output: $OutputFile" -ForegroundColor Gray
        }
        
        Write-Host "" -ForegroundColor White
        
        # Use proper argument passing for Python
        $pythonArgs = @($toolPath) + $arguments
        $process = Start-Process -FilePath "python" -ArgumentList $pythonArgs -Wait -PassThru -NoNewWindow
        
        if ($process.ExitCode -eq 0) {
            Write-Host "✅ Gap analysis completed successfully" -ForegroundColor Green
            
            if ($OutputFile) {
                Write-Host "📄 Report saved to: $OutputFile" -ForegroundColor Cyan
            }
            
            return $true
        } else {
            Write-Host "❌ Gap analysis failed with exit code: $($process.ExitCode)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Error during gap analysis: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Main execution
if ($Help) {
    Show-Help
    exit 0
}

Write-Host "[NOVA] Heady Academy Gap Scanner v2.1" -ForegroundColor Cyan
Write-Host "Analyzing project gaps and inconsistencies..." -ForegroundColor Gray

# Validate scan type
$validScanTypes = @("all", "code", "deps", "docs", "security", "perf")
if ($ScanType -notin $validScanTypes) {
    Write-Host "❌ Invalid scan type: $ScanType" -ForegroundColor Red
    Write-Host "Valid types: $($validScanTypes -join ', ')" -ForegroundColor Yellow
    Write-Host "Use -Help for detailed information" -ForegroundColor Yellow
    exit 1
}

# Validate output path if specified
if ($Output) {
    $outputDir = Split-Path $Output -Parent
    if ($outputDir -and -not (Test-Path $outputDir -PathType Container)) {
        Write-Host "❌ Output directory does not exist: $outputDir" -ForegroundColor Red
        exit 1
    }
}

# Execute scan
$success = Invoke-NovaScan -TargetPath $Path -ScanType $ScanType -Detailed:$Detailed -Fix:$Fix -OutputFile $Output

if ($success) {
    Write-Host "[NOVA] Operation completed successfully" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "[NOVA] Operation failed" -ForegroundColor Red
    exit 1
}
