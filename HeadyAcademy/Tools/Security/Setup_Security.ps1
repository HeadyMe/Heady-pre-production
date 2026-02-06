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
# ║  FILE: HeadyAcademy/Tools/Security/Setup_Security.ps1             ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

# Heady Academy Security Setup Script
# Configures comprehensive API key management and authentication

param(
    [string]$MasterKey,
    [switch]$GenerateKeys,
    [switch]$SetupOAuth,
    [switch]$SetupMCP,
    [switch]$Validate
)

$VAULT_DIR = ".\Vault"
$TOOLS_DIR = ".\Tools\Security"
$PYTHON = "python"

Write-Host "=== HEADY ACADEMY SECURITY SETUP ===" -ForegroundColor Cyan

# Ensure directories exist
if (!(Test-Path $VAULT_DIR)) { New-Item -ItemType Directory -Path $VAULT_DIR -Force | Out-Null }
if (!(Test-Path "$VAULT_DIR\Certs")) { New-Item -ItemType Directory -Path "$VAULT_DIR\Certs" -Force | Out-Null }

# Set master key
if ($MasterKey) {
    $env:HEADY_MASTER_KEY = $MasterKey
    Write-Host "✅ Master key set" -ForegroundColor Green
} elseif ($env:HEADY_MASTER_KEY) {
    Write-Host "✅ Master key from environment" -ForegroundColor Green
} else {
    $env:HEADY_MASTER_KEY = Read-Host "Enter master key (generate with: openssl rand -hex 32)" -AsSecureString
    $plainKey = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($env:HEADY_MASTER_KEY))
    $env:HEADY_MASTER_KEY = $plainKey
    Write-Host "✅ Master key configured" -ForegroundColor Green
}

# Generate signature key
if (!(Test-Path env:HEADY_SIGNATURE_KEY)) {
    $signatureKey = -join (1..32 | ForEach-Object { Get-Random -Maximum 16 -Minimum 0 | ForEach-Object { "{0:X}" -f $_ } })
    $env:HEADY_SIGNATURE_KEY = $signatureKey
    Write-Host "✅ Generated signature key" -ForegroundColor Green
}

# Generate MCP key
if (!(Test-Path env:HEADY_MCP_KEY)) {
    $mcpKey = -join (1..32 | ForEach-Object { Get-Random -Maximum 16 -Minimum 0 | ForEach-Object { "{0:X}" -f $_ } })
    $env:HEADY_MCP_KEY = $mcpKey
    Write-Host "✅ Generated MCP key" -ForegroundColor Green
}

if ($GenerateKeys) {
    Write-Host "`n--- API KEY SETUP ---" -ForegroundColor Yellow
    
    # Add API keys interactively
    $services = @(
        @{name="gemini"; desc="Google Gemini AI"},
        @{name="openai"; desc="OpenAI"},
        @{name="yandex"; desc="Yandex GPT"},
        @{name="github"; desc="GitHub"},
        @{name="cloudflare"; desc="Cloudflare"},
        @{name="anthropic"; desc="Anthropic Claude"},
        @{name="huggingface"; desc="Hugging Face"}
    )
    
    foreach ($service in $services) {
        $key = Read-Host "Enter $($service.desc) API key (leave empty to skip)"
        if ($key) {
            try {
                & $PYTHON "$TOOLS_DIR\Key_Manager.py" add --service $service.name --key $key --description "Added via setup script"
            } catch {
                Write-Host "❌ Failed to add $($service.name) key: $_" -ForegroundColor Red
            }
        }
    }
    
    # Generate .env file
    try {
        & $PYTHON "$TOOLS_DIR\Key_Manager.py" env --output "$VAULT_DIR\.env"
        Write-Host "✅ Generated .env file" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to generate .env: $_" -ForegroundColor Red
    }
}

if ($SetupOAuth) {
    Write-Host "`n--- OAUTH SETUP ---" -ForegroundColor Yellow
    
    $oauthProviders = @("github", "google")
    foreach ($provider in $oauthProviders) {
        Write-Host "`nSetting up OAuth for $provider" -ForegroundColor Cyan
        
        $clientId = Read-Host "Enter $provider Client ID"
        $clientSecret = Read-Host "Enter $provider Client Secret" -AsSecureString
        $plainSecret = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($clientSecret))
        
        if ($clientId -and $plainSecret) {
            $clientIdVar = "{0}_CLIENT_ID" -f $provider.ToUpper()
            $clientSecretVar = "{0}_CLIENT_SECRET" -f $provider.ToUpper()
            Set-Item -Path "env:$clientIdVar" -Value $clientId
            Set-Item -Path "env:$clientSecretVar" -Value $plainSecret
            Write-Host "✅ $provider OAuth configured" -ForegroundColor Green
        }
    }
    
    # Test OAuth URLs
    try {
        $url, $state = & $PYTHON "$TOOLS_DIR\Auth_Protocol.py" oauth --provider github
        Write-Host "✅ OAuth URL generated for GitHub" -ForegroundColor Green
        Write-Host "   URL: $url"
        Write-Host "   State: $state"
    } catch {
        Write-Host "❌ OAuth setup failed: $_" -ForegroundColor Red
    }
}

if ($SetupMCP) {
    Write-Host "`n--- MCP SERVER SETUP ---" -ForegroundColor Yellow
    
    $mcpServers = @("heady_bridge", "heady_nova", "heady_oculus")
    foreach ($server in $mcpServers) {
        try {
            $key = & $PYTHON "$TOOLS_DIR\MCP_Auth.py" server_key --server $server
            Write-Host "✅ Generated key for $server" -ForegroundColor Green
            Write-Host "   Key: $key"
        } catch {
            Write-Host "❌ Failed to generate key for $server" -ForegroundColor Red
        }
    }
    
    # Generate client tokens
    $clients = @(
        @{client="heady_master"; permissions="read,write,admin"},
        @{client="heady_scout"; permissions="read"}
    )
    
    foreach ($client in $clients) {
        foreach ($server in $mcpServers) {
            try {
                $null = & $PYTHON "$TOOLS_DIR\MCP_Auth.py" client_token --client $client.client --server $server --permissions $client.permissions
                Write-Host "✅ Generated token for $($client.client) -> $server" -ForegroundColor Green
            } catch {
                Write-Host "❌ Failed to generate token for $($client.client) -> $server" -ForegroundColor Red
            }
        }
    }
}

if ($Validate) {
    Write-Host "`n--- VALIDATION ---" -ForegroundColor Yellow
    
    # Validate API keys
    try {
        & $PYTHON "$TOOLS_DIR\Key_Manager.py" validate
    } catch {
        Write-Host "❌ Key validation failed: $_" -ForegroundColor Red
    }
    
    # Check MCP status
    try {
        & $PYTHON "$TOOLS_DIR\MCP_Auth.py" status
    } catch {
        Write-Host "❌ MCP status check failed: $_" -ForegroundColor Red
    }
    
    # Test JWT generation
    try {
        $null = & $PYTHON "$TOOLS_DIR\Auth_Protocol.py" jwt --user test_user
        Write-Host "✅ JWT generation working" -ForegroundColor Green
    } catch {
        Write-Host "❌ JWT generation failed: $($_)" -ForegroundColor Red
    }
}

# Save environment variables to .env
$envContent = @(
    "# Heady Academy Security Configuration",
    "# Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
    "# DO NOT COMMIT TO VERSION CONTROL",
    "",
    "HEADY_MASTER_KEY=$env:HEADY_MASTER_KEY",
    "HEADY_SIGNATURE_KEY=$env:HEADY_SIGNATURE_KEY", 
    "HEADY_MCP_KEY=$env:HEADY_MCP_KEY"
)

if ($env:GITHUB_CLIENT_ID) { $envContent += "GITHUB_CLIENT_ID=$($env:GITHUB_CLIENT_ID)" }
if ($env:GITHUB_CLIENT_SECRET) { $envContent += "GITHUB_CLIENT_SECRET=$($env:GITHUB_CLIENT_SECRET)" }
if ($env:GOOGLE_CLIENT_ID) { $envContent += "GOOGLE_CLIENT_ID=$($env:GOOGLE_CLIENT_ID)" }
if ($env:GOOGLE_CLIENT_SECRET) { $envContent += "GOOGLE_CLIENT_SECRET=$($env:GOOGLE_CLIENT_SECRET)" }

$envContent | Set-Content "$VAULT_DIR\.security.env" -Encoding UTF8

Write-Host "`n=== SECURITY SETUP COMPLETE ===" -ForegroundColor Green
Write-Host "Configuration files:" -ForegroundColor Cyan
Write-Host "  - Security keys: $VAULT_DIR\keys.encrypted" -ForegroundColor White
Write-Host "  - MCP config: $VAULT_DIR\mcp_config.json" -ForegroundColor White
Write-Host "  - Auth config: $VAULT_DIR\auth_config.json" -ForegroundColor White
Write-Host "  - Environment: $VAULT_DIR\.security.env" -ForegroundColor White
Write-Host "`n⚠️  Keep these files secure and never commit to version control!" -ForegroundColor Yellow
