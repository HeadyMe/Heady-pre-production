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
# ║  FILE: HeadyAcademy/Setup_Vault.ps1                               ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

# HEADY ACADEMY VAULT SETUP (PowerShell Version)
$VAULT_ENV = ".\Vault\.env"
$VAULT_CERTS = ".\Vault\Certs"
Write-Host "=== HEADY ACADEMY VAULT SETUP ==="

# Ensure directories exist
if (!(Test-Path $VAULT_ENV)) { 
    New-Item -ItemType File -Path $VAULT_ENV -Force | Out-Null 
    Write-Host ">> Created vault environment file"
}

if (!(Test-Path $VAULT_CERTS)) { 
    New-Item -ItemType Directory -Path $VAULT_CERTS -Force | Out-Null 
    Write-Host ">> Created certificates directory"
}

function Invest-Key {
    param([string]$KeyName, [string]$Description = "")
    if ($Description) {
        Write-Host "  $Description"
    }
    $val = Read-Host "Enter $KeyName (Leave empty to skip)" -AsSecureString
    $plainVal = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($val))
    if ($plainVal) {
        $content = Get-Content $VAULT_ENV -ErrorAction SilentlyContinue | Where-Object { $_ -notmatch "^$KeyName=" }
        if (-not $content) { $content = @() }
        $content += "$KeyName=$plainVal"
        $content | Set-Content $VAULT_ENV
        Write-Host ">> $KeyName secured."
    } else {
        Write-Host ">> $KeyName skipped."
    }
}

function New-SelfSignedCertificate {
    param([string]$CertName)
    $certPath = Join-Path $VAULT_CERTS "$CertName.pfx"
    if (!(Test-Path $certPath)) {
        try {
            $cert = New-SelfSignedCertificate -DnsName $CertName -CertStoreLocation Cert:\CurrentUser\My -KeyExportPolicy Exportable
            $password = ConvertTo-SecureString -String "HeadyVault2024" -Force -AsPlainText
            Export-PfxCertificate -Cert $cert -FilePath $certPath -Password $password | Out-Null
            Write-Host ">> Generated certificate: $CertName"
        } catch {
            Write-Host ">> Certificate generation failed: $_"
        }
    } else {
        Write-Host ">> Certificate already exists: $CertName"
    }
}

Write-Host "`n--- API Keys ---"
Invest-Key "GEMINI_API_KEY" "Google Gemini AI API key"
Invest-Key "OPENAI_API_KEY" "OpenAI API key for content generation"
Invest-Key "YANDEX_API_KEY" "Yandex GPT API key for Sasha"
Invest-Key "GITHUB_TOKEN" "Personal access token for Scout"
Invest-Key "CLOUDFLARE_API_TOKEN" "Cloudflare API for Bridge"

Write-Host "`n--- Security Keys ---"
Invest-Key "HEADY_SIGNATURE_KEY" "HMAC key for message signing"
Invest-Key "ADMIN_PASSWORD_HASH" "Hashed admin password"
Invest-Key "LEDGER_MASTER_KEY" "Master key for HeadyChain"
Invest-Key "WARP_LICENSE_KEY" "Cloudflare WARP license"

Write-Host "`n--- Optional Configuration ---"
Invest-Key "HEADY_ROLE" "Default role for Sentinel (ADMIN/USER)"
Invest-Key "HEADY_USER" "Default username for Sentinel"
Invest-Key "SMTP_SERVER" "Email server for notifications"
Invest-Key "SMTP_USER" "SMTP username"
Invest-Key "SMTP_PASS" "SMTP password"

Write-Host "`n--- Certificates ---"
New-SelfSignedCertificate "HeadyMaster"
New-SelfSignedCertificate "HeadyBridge"

Write-Host "`n=== VAULT SETUP COMPLETE ==="
Write-Host "Environment file: $VAULT_ENV"
Write-Host "Certificates: $VAULT_CERTS"
Write-Host "`nNote: Keep these files secure and never commit to version control."
