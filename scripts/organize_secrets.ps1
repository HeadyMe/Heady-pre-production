# HEADY SECRET LOADER
$envFile = "$PSScriptRoot\.env"
if (-not (Test-Path $envFile)) {
    $template = @"
# HEADY MASTER KEYS
# -----------------
DATABASE_URL=
GITHUB_PERSONAL_ACCESS_TOKEN=
HF_TOKEN=
HEADY_API_KEY=
"@
    Set-Content -Path $envFile -Value $template
    Write-Host "  > Created .env template" -ForegroundColor Green
}
# ACL Hardening could go here
# Load to session
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([A-Z_]+)\s*=\s*(.*)') {
        [System.Environment]::SetEnvironmentVariable($Matches[1], $Matches[2], "Process")
    }
}
Write-Host "  > Secrets Loaded into Memory" -ForegroundColor Cyan
