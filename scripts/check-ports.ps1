<#
.SYNOPSIS
    Checks for port conflicts
.DESCRIPTION
    Identifies processes using specified ports
.EXAMPLE
    .\check-ports.ps1 -Ports 3304,3300
#>

param(
    [Parameter(Mandatory=$false)]
    [int[]]$Ports = @(3304, 3300, 3301, 3302, 3303)
)

$ErrorActionPreference = 'Stop'

foreach ($port in $Ports) {
    try {
        $process = Get-NetTCPConnection -LocalPort $port -ErrorAction Stop | 
            Select-Object -First 1 -ExpandProperty OwningProcess
        
        if ($process) {
            $procInfo = Get-Process -Id $process -ErrorAction SilentlyContinue
            Write-Host "Port $port is in use by process $process ($($procInfo.Name))" -ForegroundColor Red
        } else {
            Write-Host "Port $port is available" -ForegroundColor Green
        }
    } catch {
        Write-Host "Port $port check failed: $_" -ForegroundColor Yellow
    }
}
