# Stop Heady System Services
# Terminates processes listening on Heady ports (3300-3304)

$ports = @(3300, 3301, 3302, 3303, 3304)

Write-Host "Stopping Heady System Services..." -ForegroundColor Yellow

foreach ($port in $ports) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        foreach ($conn in $connections) {
            $procId = $conn.OwningProcess
            if ($procId) {
                $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
                if ($proc) {
                    Write-Host "Killing process $($proc.Id) ($($proc.ProcessName)) on port $port..." -ForegroundColor Red
                    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                }
            }
        }
    } catch {
        # Port might not be in use, ignore
    }
}

Write-Host "Heady System stopped." -ForegroundColor Green
