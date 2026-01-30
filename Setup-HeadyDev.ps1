# ===================================================================
# Setup-HeadyDev.ps1
# HeadySystems Secure Development Environment Scaffolding Script
# ===================================================================
# This script sets up a complete development environment with:
# - 1Password SSH Agent integration
# - Project directory structure
# - Secret management using 1Password references
# - Docker Compose configuration
# - Secure development launcher
# ===================================================================

param(
    [string]$ProjectPath = ".\HeadySystems-Core",
    [string]$VaultName = "HeadySystems"
)

# Color-coded output functions
function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

function Write-WarningMessage {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-ErrorMessage {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Section {
    param([string]$Message)
    Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Cyan
}

# ===================================================================
# STEP 1: SSH Configuration for 1Password Agent (Windows)
# ===================================================================
function Configure-SSHAgent {
    Write-Section "SSH Configuration: 1Password Agent"
    
    try {
        # Check if we're on Windows
        # PowerShell 5.1 is Windows-only, so only check $IsWindows on PowerShell Core 6+
        if ($PSVersionTable.PSVersion.Major -ge 6 -and -not $IsWindows) {
            Write-WarningMessage "This SSH configuration is Windows-specific. Skipping on non-Windows platform."
            return
        }

        # Define the 1Password SSH Agent pipe
        $sshAgentPipe = "\\.\pipe\openssh-ssh-agent"
        
        # Get PowerShell profile path
        $profilePath = $PROFILE.CurrentUserAllHosts
        if (-not $profilePath) {
            $profilePath = $PROFILE
        }

        Write-Info "Profile path: $profilePath"

        # Ensure profile directory exists
        $profileDir = Split-Path -Parent $profilePath
        if (-not (Test-Path $profileDir)) {
            New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
            Write-Success "Created profile directory: $profileDir"
        }

        # Check if profile file exists
        if (-not (Test-Path $profilePath)) {
            New-Item -ItemType File -Path $profilePath -Force | Out-Null
            Write-Success "Created PowerShell profile: $profilePath"
        }

        # Check if SSH_AUTH_SOCK is already configured
        $profileContent = Get-Content $profilePath -Raw -ErrorAction SilentlyContinue
        
        if ($profileContent -match 'SSH_AUTH_SOCK.*openssh-ssh-agent') {
            Write-Success "1Password SSH Agent is already configured in profile"
        }
        else {
            # Append SSH configuration to profile
            $sshConfig = @"

# ===================================================================
# 1Password SSH Agent Configuration
# Added by Setup-HeadyDev.ps1 on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
# ===================================================================
`$env:SSH_AUTH_SOCK = "$sshAgentPipe"
Write-Host "✓ 1Password SSH Agent configured" -ForegroundColor Green

"@
            Add-Content -Path $profilePath -Value $sshConfig
            Write-Success "Added 1Password SSH Agent configuration to profile"
            Write-Info "Configuration added to: $profilePath"
            
            # Set for current session
            $env:SSH_AUTH_SOCK = $sshAgentPipe
            Write-Success "SSH_AUTH_SOCK set for current session"
        }

        # Verify the pipe exists (1Password app must be running)
        if (Test-Path $sshAgentPipe) {
            Write-Success "1Password SSH Agent pipe is accessible"
        }
        else {
            Write-WarningMessage "1Password SSH Agent pipe not found. Make sure 1Password is installed and SSH Agent is enabled."
            Write-Info "To enable: 1Password → Settings → Developer → SSH Agent"
        }
    }
    catch {
        Write-ErrorMessage "Failed to configure SSH Agent: $_"
        throw
    }
}

# ===================================================================
# STEP 2: Create Project Directory Structure
# ===================================================================
function Create-ProjectStructure {
    Write-Section "File Structure: Creating Project Directory"
    
    try {
        # Convert to absolute path
        $absolutePath = Resolve-Path -Path $ProjectPath -ErrorAction SilentlyContinue
        if (-not $absolutePath) {
            $absolutePath = Join-Path (Get-Location) $ProjectPath
        }

        # Create project directory
        if (Test-Path $absolutePath) {
            Write-WarningMessage "Directory already exists: $absolutePath"
            Write-Info "Using existing directory"
        }
        else {
            New-Item -ItemType Directory -Path $absolutePath -Force | Out-Null
            Write-Success "Created project directory: $absolutePath"
        }

        return $absolutePath
    }
    catch {
        Write-ErrorMessage "Failed to create project directory: $_"
        throw
    }
}

# ===================================================================
# STEP 3: Create .env File with 1Password References
# ===================================================================
function Create-EnvFile {
    param([string]$ProjectDir)
    
    Write-Section "Secret Template: Creating .env with 1Password References"
    
    try {
        $envPath = Join-Path $ProjectDir ".env"
        
        # Create .env file with 1Password secret references
        $envContent = @"
# ===================================================================
# HeadySystems Development Environment
# ===================================================================
# This file uses 1Password secret references for secure credential management.
# Syntax: op://VaultName/ItemName/FieldName
# 
# To inject secrets at runtime, use:
#   op run --env-file .env -- <your-command>
# 
# Generated by Setup-HeadyDev.ps1 on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
# ===================================================================

# Database Configuration
# Reference format: op://VaultName/ItemName/FieldName
POSTGRES_USER=op://$VaultName/HeadyDatabase/username
POSTGRES_PASSWORD=op://$VaultName/HeadyDatabase/password
POSTGRES_DB=headysystems
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
DATABASE_URL=op://$VaultName/HeadyDatabase/connection_string

# Cloudflare API Configuration
CLOUDFLARE_API_TOKEN=op://$VaultName/CloudflareAPI/api_token
CLOUDFLARE_ACCOUNT_ID=op://$VaultName/CloudflareAPI/account_id

# OpenAI API Configuration
OPENAI_API_KEY=op://$VaultName/OpenAI/api_key

# Heady System Configuration
HEADY_API_KEY=op://$VaultName/HeadySystem/api_key
HF_TOKEN=op://$VaultName/HuggingFace/token

# Node.js Configuration
NODE_ENV=development
PORT=3300

# ===================================================================
# 1Password Setup Instructions
# ===================================================================
# 1. Create a vault named "$VaultName" in 1Password
# 2. Create the following items with corresponding fields:
#
#    Item: HeadyDatabase
#      - username (e.g., postgres)
#      - password (strong random password)
#      - connection_string (e.g., postgresql://postgres:password@postgres:5432/headysystems)
#
#    Item: CloudflareAPI
#      - api_token (from Cloudflare dashboard)
#      - account_id (from Cloudflare dashboard)
#
#    Item: OpenAI
#      - api_key (from OpenAI platform)
#
#    Item: HeadySystem
#      - api_key (generate with: openssl rand -base64 32)
#
#    Item: HuggingFace
#      - token (from https://huggingface.co/settings/tokens)
#
# 3. Use 'op run --env-file .env -- docker compose up' to inject secrets
# ===================================================================
"@

        # Write .env file
        Set-Content -Path $envPath -Value $envContent -Encoding UTF8
        Write-Success "Created .env file: $envPath"
        Write-Info "Configure 1Password items as described in the .env file"
        
        return $envPath
    }
    catch {
        Write-ErrorMessage "Failed to create .env file: $_"
        throw
    }
}

# ===================================================================
# STEP 4: Create Docker Compose Configuration
# ===================================================================
function Create-DockerCompose {
    param([string]$ProjectDir)
    
    Write-Section "Docker Config: Creating docker-compose.yml"
    
    try {
        $composeFile = Join-Path $ProjectDir "docker-compose.yml"
        
        # Create docker-compose.yml
        $composeContent = @"
# ===================================================================
# HeadySystems Docker Compose Configuration
# ===================================================================
# This configuration sets up a complete development environment with:
# - Node.js application server
# - PostgreSQL database
# - Environment variables injected via 1Password
#
# Usage:
#   Run with 1Password: .\Run-Dev.ps1
#   Or manually: op run --env-file .env -- docker compose up
#
# Generated by Setup-HeadyDev.ps1 on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
# ===================================================================

services:
  # Node.js Application Server
  heady-app:
    image: node:18-alpine
    container_name: headysystems-app
    working_dir: /app
    ports:
      - "`${PORT:-3300}:3300"
    environment:
      # Node.js Configuration
      - NODE_ENV=`${NODE_ENV:-development}
      - PORT=`${PORT:-3300}
      
      # Database Configuration
      - DATABASE_URL=`${DATABASE_URL}
      - POSTGRES_HOST=`${POSTGRES_HOST:-postgres}
      - POSTGRES_PORT=`${POSTGRES_PORT:-5432}
      - POSTGRES_DB=`${POSTGRES_DB:-headysystems}
      - POSTGRES_USER=`${POSTGRES_USER}
      - POSTGRES_PASSWORD=`${POSTGRES_PASSWORD}
      
      # API Keys (injected by 1Password)
      - HEADY_API_KEY=`${HEADY_API_KEY}
      - HF_TOKEN=`${HF_TOKEN}
      - CLOUDFLARE_API_TOKEN=`${CLOUDFLARE_API_TOKEN}
      - CLOUDFLARE_ACCOUNT_ID=`${CLOUDFLARE_ACCOUNT_ID}
      - OPENAI_API_KEY=`${OPENAI_API_KEY}
    volumes:
      - ./app:/app
      - /app/node_modules
    command: npm run dev
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - heady-network
    restart: unless-stopped

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: headysystems-postgres
    environment:
      - POSTGRES_USER=`${POSTGRES_USER}
      - POSTGRES_PASSWORD=`${POSTGRES_PASSWORD}
      - POSTGRES_DB=`${POSTGRES_DB:-headysystems}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    networks:
      - heady-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U `$`${POSTGRES_USER} -d `$`${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

volumes:
  postgres_data:
    driver: local

networks:
  heady-network:
    driver: bridge
"@

        # Write docker-compose.yml
        Set-Content -Path $composeFile -Value $composeContent -Encoding UTF8
        Write-Success "Created docker-compose.yml: $composeFile"
        Write-Info "Environment variables will be injected from .env via 1Password"
        
        return $composeFile
    }
    catch {
        Write-ErrorMessage "Failed to create docker-compose.yml: $_"
        throw
    }
}

# ===================================================================
# STEP 5: Create Development Launcher Script
# ===================================================================
function Create-LauncherScript {
    param([string]$ProjectDir)
    
    Write-Section "Launcher: Creating Run-Dev.ps1"
    
    try {
        $launcherPath = Join-Path $ProjectDir "Run-Dev.ps1"
        
        # Create Run-Dev.ps1 launcher script
        $launcherContent = @"
# ===================================================================
# Run-Dev.ps1
# HeadySystems Development Environment Launcher
# ===================================================================
# This script launches the development environment with secrets
# injected from 1Password at runtime. No plaintext secrets are
# stored in files or environment variables.
#
# Prerequisites:
# - 1Password CLI installed (op)
# - 1Password desktop app running
# - Vault "$VaultName" configured with required items
#
# Generated by Setup-HeadyDev.ps1 on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
# ===================================================================

# Enable strict error handling
`$ErrorActionPreference = "Stop"

Write-Host "`n∞ HEADYSYSTEMS DEVELOPMENT LAUNCHER ∞`n" -ForegroundColor Cyan

# ===================================================================
# Pre-flight Checks
# ===================================================================

Write-Host "Running pre-flight checks..." -ForegroundColor Yellow

# Check if 1Password CLI is installed
try {
    `$opVersion = op --version 2>`$null
    if (`$LASTEXITCODE -eq 0) {
        Write-Host "✓ 1Password CLI found (version: `$opVersion)" -ForegroundColor Green
    }
    else {
        throw "1Password CLI not working"
    }
}
catch {
    Write-Host "❌ 1Password CLI (op) not found or not working" -ForegroundColor Red
    Write-Host "`nInstall 1Password CLI from:" -ForegroundColor Yellow
    Write-Host "  https://developer.1password.com/docs/cli/get-started/`n" -ForegroundColor White
    exit 1
}

# Check if Docker is running
try {
    `$null = docker version 2>`$null
    if (`$LASTEXITCODE -eq 0) {
        Write-Host "✓ Docker is running" -ForegroundColor Green
    }
    else {
        throw "Docker not running"
    }
}
catch {
    Write-Host "❌ Docker is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again.`n" -ForegroundColor Yellow
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".\.env")) {
    Write-Host "❌ .env file not found in current directory" -ForegroundColor Red
    Write-Host "Please run Setup-HeadyDev.ps1 first.`n" -ForegroundColor Yellow
    exit 1
}
else {
    Write-Host "✓ .env file found" -ForegroundColor Green
}

# Check if docker-compose.yml exists
if (-not (Test-Path ".\docker-compose.yml")) {
    Write-Host "❌ docker-compose.yml not found in current directory" -ForegroundColor Red
    Write-Host "Please run Setup-HeadyDev.ps1 first.`n" -ForegroundColor Yellow
    exit 1
}
else {
    Write-Host "✓ docker-compose.yml found" -ForegroundColor Green
}

# Test 1Password authentication
Write-Host "`nTesting 1Password authentication..." -ForegroundColor Yellow
try {
    `$null = op vault list 2>`$null
    if (`$LASTEXITCODE -eq 0) {
        Write-Host "✓ 1Password authentication successful" -ForegroundColor Green
    }
    else {
        throw "Authentication failed"
    }
}
catch {
    Write-Host "❌ 1Password authentication failed" -ForegroundColor Red
    Write-Host "Please sign in to 1Password and try again:" -ForegroundColor Yellow
    Write-Host "  op signin`n" -ForegroundColor White
    exit 1
}

Write-Host "`n✓ All pre-flight checks passed`n" -ForegroundColor Green

# ===================================================================
# Launch Development Environment
# ===================================================================

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Launching HeadySystems Development Environment" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "Injecting secrets from 1Password vault '$VaultName'..." -ForegroundColor Yellow
Write-Host "Starting Docker containers...`n" -ForegroundColor Yellow

try {
    # Use op run to inject secrets and start Docker Compose
    # This ensures no plaintext secrets are exposed
    & op run --env-file .env -- docker compose up
    
    if (`$LASTEXITCODE -ne 0) {
        throw "Docker Compose failed with exit code `$LASTEXITCODE"
    }
}
catch {
    Write-Host "`n❌ Failed to start development environment: `$_" -ForegroundColor Red
    Write-Host "`nTroubleshooting tips:" -ForegroundColor Yellow
    Write-Host "1. Verify 1Password vault '$VaultName' exists and has required items" -ForegroundColor White
    Write-Host "2. Check that all secret references in .env match your 1Password items" -ForegroundColor White
    Write-Host "3. Ensure Docker Desktop is running" -ForegroundColor White
    Write-Host "4. Review .env file for correct op:// reference syntax`n" -ForegroundColor White
    exit 1
}

Write-Host "`n🎉 Development environment stopped`n" -ForegroundColor Green
"@

        # Write Run-Dev.ps1
        Set-Content -Path $launcherPath -Value $launcherContent -Encoding UTF8
        Write-Success "Created launcher script: $launcherPath"
        Write-Info "Use .\Run-Dev.ps1 to start the development environment"
        
        return $launcherPath
    }
    catch {
        Write-ErrorMessage "Failed to create launcher script: $_"
        throw
    }
}

# ===================================================================
# STEP 6: Create README
# ===================================================================
function Create-ReadmeFile {
    param([string]$ProjectDir)
    
    Write-Section "Documentation: Creating README.md"
    
    try {
        $readmePath = Join-Path $ProjectDir "README.md"
        
        $readmeContent = @"
# HeadySystems-Core Development Environment

Secure development environment for HeadySystems, using 1Password for secret management and Docker for containerization.

## 📋 Prerequisites

- **1Password Desktop App** - [Download](https://1password.com/downloads/)
- **1Password CLI (op)** - [Install Guide](https://developer.1password.com/docs/cli/get-started/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **PowerShell 5.1+** (Windows) or **PowerShell Core 6+** (cross-platform)

## 🚀 Quick Start

### 1. Setup 1Password Vault

Create a vault named "$VaultName" in 1Password with the following items:

**Item: HeadyDatabase**
- username: ``postgres``
- password: (generate strong password)
- connection_string: ``postgresql://postgres:<password>@postgres:5432/headysystems``

**Item: CloudflareAPI**
- api_token: (from Cloudflare dashboard)
- account_id: (from Cloudflare dashboard)

**Item: OpenAI**
- api_key: (from OpenAI platform)

**Item: HeadySystem**
- api_key: (generate with: ``openssl rand -base64 32``)

**Item: HuggingFace**
- token: (from https://huggingface.co/settings/tokens)

### 2. Authenticate with 1Password CLI

``````powershell
# Sign in to 1Password
op signin

# Verify authentication
op vault list
``````

### 3. Launch Development Environment

``````powershell
# Navigate to project directory
cd HeadySystems-Core

# Launch with secrets injection
.\Run-Dev.ps1
``````

The script will:
- ✅ Verify 1Password CLI is installed and authenticated
- ✅ Check Docker is running
- ✅ Inject secrets from 1Password vault
- ✅ Start Docker containers with proper environment variables
- ✅ Launch the application

## 📁 Project Structure

``````
HeadySystems-Core/
├── .env                    # 1Password secret references (op:// syntax)
├── docker-compose.yml      # Docker services configuration
├── Run-Dev.ps1            # Development environment launcher
└── README.md              # This file
``````

## 🔐 Security Features

- **No Plaintext Secrets**: All secrets stored in 1Password vault
- **Runtime Injection**: Secrets injected only when needed via ``op run``
- **SSH Agent Integration**: 1Password SSH Agent configured in PowerShell profile
- **Environment Isolation**: Development environment isolated in Docker containers

## 🛠️ Available Commands

``````powershell
# Start development environment
.\Run-Dev.ps1

# Start in detached mode
op run --env-file .env -- docker compose up -d

# View logs
docker compose logs -f

# Stop environment
docker compose down

# Stop and remove volumes
docker compose down -v
``````

## 🔍 Troubleshooting

### "1Password CLI not found"
Install from: https://developer.1password.com/docs/cli/get-started/

### "1Password authentication failed"
Run: ``op signin``

### "Docker is not running"
Start Docker Desktop

### "Secret reference not found"
Verify vault name and item names match your 1Password configuration

## 📚 Documentation

- [1Password CLI Documentation](https://developer.1password.com/docs/cli/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [HeadySystems Main Repository](https://github.com/HeadyMe/Heady)

## 🔄 Next Steps

1. ✅ Configure 1Password vault with required items
2. ✅ Authenticate with 1Password CLI
3. ✅ Launch development environment
4. 📝 Add your application code to ``./app`` directory
5. 🚀 Start developing!

---

**Generated by**: Setup-HeadyDev.ps1  
**Date**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  
**Vault**: $VaultName
"@

        Set-Content -Path $readmePath -Value $readmeContent -Encoding UTF8
        Write-Success "Created README.md: $readmePath"
        
        return $readmePath
    }
    catch {
        Write-ErrorMessage "Failed to create README.md: $_"
        throw
    }
}

# ===================================================================
# Main Execution
# ===================================================================

try {
    Write-Host "`n∞═══════════════════════════════════════════════════∞" -ForegroundColor Cyan
    Write-Host "  HEADYSYSTEMS SECURE DEVELOPMENT ENVIRONMENT SETUP" -ForegroundColor Cyan
    Write-Host "∞═══════════════════════════════════════════════════∞`n" -ForegroundColor Cyan

    Write-Info "Project Path: $ProjectPath"
    Write-Info "Vault Name: $VaultName"
    Write-Host ""

    # Execute setup steps
    Configure-SSHAgent
    $projectDir = Create-ProjectStructure
    $envFile = Create-EnvFile -ProjectDir $projectDir
    $composeFile = Create-DockerCompose -ProjectDir $projectDir
    $launcherFile = Create-LauncherScript -ProjectDir $projectDir
    $readmeFile = Create-ReadmeFile -ProjectDir $projectDir

    # Summary
    Write-Section "Setup Complete!"
    
    Write-Host "📁 Project Files Created:" -ForegroundColor Cyan
    Write-Host "   • Project Directory: $projectDir" -ForegroundColor White
    Write-Host "   • Environment File: $envFile" -ForegroundColor White
    Write-Host "   • Docker Compose: $composeFile" -ForegroundColor White
    Write-Host "   • Launcher Script: $launcherFile" -ForegroundColor White
    Write-Host "   • Documentation: $readmeFile" -ForegroundColor White
    Write-Host ""
    
    Write-Host "🔐 1Password Configuration:" -ForegroundColor Cyan
    Write-Host "   • SSH Agent configured in PowerShell profile" -ForegroundColor White
    Write-Host "   • Vault name: $VaultName" -ForegroundColor White
    Write-Host "   • Secret references use op:// syntax" -ForegroundColor White
    Write-Host ""
    
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Configure 1Password vault '$VaultName' with required items (see README.md)" -ForegroundColor Yellow
    Write-Host "   2. Sign in to 1Password CLI: op signin" -ForegroundColor Yellow
    Write-Host "   3. Navigate to project: cd $ProjectPath" -ForegroundColor Yellow
    Write-Host "   4. Launch development environment: .\Run-Dev.ps1" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Success "Setup completed successfully!"
    Write-Host ""
}
catch {
    Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host "  SETUP FAILED" -ForegroundColor Red
    Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Red
    
    Write-ErrorMessage "An error occurred during setup: $_"
    Write-Host "`nPlease review the error message above and try again.`n" -ForegroundColor Yellow
    exit 1
}
