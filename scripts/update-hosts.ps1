# Add entries to hosts file
$entries = @(
    '127.0.0.1 headymcp.com',
    '127.0.0.1 gpu.headymcp.com',
    '127.0.0.1 mcp.headymcp.com',
    '127.0.0.1 cms.headymcp.com'
)

$hostsPath = "$env:windir\System32\drivers\etc\hosts"

foreach ($entry in $entries) {
    if (-not (Select-String -Path $hostsPath -Pattern $entry -SimpleMatch)) {
        Add-Content -Path $hostsPath -Value $entry
    }
}

Write-Host "Hosts file updated."
