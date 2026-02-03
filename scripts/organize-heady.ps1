<#
.SYNOPSIS
    Organizes Heady project files into standardized structure
.DESCRIPTION
    Moves files to appropriate subdirectories based on type
.EXAMPLE
    .\organize-heady.ps1 -Path 'c:\Users\erich\Heady'
#>

param(
    [Parameter(Mandatory=$true)]
    [string[]]$Paths
)

$ErrorActionPreference = 'Stop'

foreach ($path in $Paths) {
    if (-not (Test-Path $path)) {
        Write-Host "Path $path does not exist" -ForegroundColor Yellow
        continue
    }

    Get-ChildItem -Path $path -File | ForEach-Object {
        try {
            $destination = switch -Wildcard ($_.Extension) {
                '.vmdk' { "$path\VirtualMachines" }
                '.vmx' { "$path\VirtualMachines" }
                '.vmxf' { "$path\VirtualMachines" }
                '.vmsd' { "$path\VirtualMachines" }
                '.nvram' { "$path\VirtualMachines" }
                '.log' { "$path\Logs" }
                '.png' { "$path\Assets\Images" }
                '.jpg' { "$path\Assets\Images" }
                '.jpeg' { "$path\Assets\Images" }
                '.md' { "$path\Docs" }
                '.pdf' { "$path\Docs" }
                '.json' { "$path\Config" }
                '.yaml' { "$path\Config" }
                default { $null }
            }

            if ($destination) {
                Move-Item $_.FullName -Destination $destination -Force
                Write-Host "Moved $($_.Name) to $destination" -ForegroundColor Green
            }
        } catch {
            Write-Host "Error processing $($_.FullName): $_" -ForegroundColor Red
        }
    }
}
