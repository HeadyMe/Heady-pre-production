# HEADY SSH SECURITY PROTOCOL
# Creates/loads deploy key for GitHub authentication

$sshDir = Join-Path $HOME ".ssh"
$keyPath = Join-Path $sshDir "github_deploy_key"
$pubPath = "$keyPath.pub"

Write-Host "∞ INITIATING SSH SECURITY PROTOCOL ∞" -ForegroundColor Cyan

if (-not (Test-Path $sshDir)) {
    New-Item -ItemType Directory -Force -Path $sshDir | Out-Null
}

if (-not (Test-Path $keyPath)) {
    Write-Host "  > Generating deploy key..." -ForegroundColor DarkGray
    ssh-keygen -t ed25519 -C "deploy-key" -f $keyPath -N "" | Out-Null
    Write-Host "  ✓ Key created: $keyPath" -ForegroundColor Green
} else {
    Write-Host "  ! Key already exists: $keyPath" -ForegroundColor Yellow
}

try {
    $agent = Get-Service ssh-agent -ErrorAction SilentlyContinue
    if ($agent -and $agent.Status -ne 'Running') {
        Start-Service ssh-agent
    }
} catch {
    Write-Host "  ! ssh-agent service not available: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "  > Adding key to agent..." -ForegroundColor DarkGray
ssh-add $keyPath | Out-Null

Write-Host "  ✓ Public key: $pubPath" -ForegroundColor Green
Write-Host "  > Add this key to GitHub Deploy Keys or SSH Keys." -ForegroundColor Cyan
Write-Host "PROTOCOL COMPLETE." -ForegroundColor Cyan
