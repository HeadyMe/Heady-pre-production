#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Heady Secrets Ingestion - Quick & Secure

.DESCRIPTION
    Convenient method to securely ingest secrets into Heady ecosystem.
    Supports multiple input methods: interactive, file, environment variables.

.PARAMETER Method
    Ingestion method: interactive, file, env, env-file

.PARAMETER Name
    Secret name (for interactive, file, env methods)

.PARAMETER Source
    Source file path or environment variable name

.EXAMPLE
    .\ingest-secrets.ps1 -Method interactive -Name API_KEY
    .\ingest-secrets.ps1 -Method file -Name SSH_KEY -Source c:\keys\id_rsa
    .\ingest-secrets.ps1 -Method env -Name TOKEN -Source MY_TOKEN_VAR
    .\ingest-secrets.ps1 -Method env-file -Source .env

.NOTES
    Part of Heady Secrets Management System
    All secrets are encrypted with AES-256-GCM
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('interactive', 'file', 'env', 'env-file')]
    [string]$Method,
    
    [Parameter(Mandatory=$false)]
    [string]$Name,
    
    [Parameter(Mandatory=$false)]
    [string]$Source
)

$ErrorActionPreference = 'Stop'
$ApiUrl = "http://localhost:3300"
$ApiKey = $env:HEADY_API_KEY

if (-not $ApiKey) {
    Write-Host "❌ HEADY_API_KEY environment variable not set" -ForegroundColor Red
    Write-Host "   Set it with: `$env:HEADY_API_KEY = 'your-key'" -ForegroundColor Yellow
    exit 1
}

function Write-HeadyBanner {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║              🔐 HEADY SECRETS INGESTION 🔐                  ║" -ForegroundColor Cyan
    Write-Host "║                                                              ║" -ForegroundColor Cyan
    Write-Host "║          Secure • Encrypted • Audited • Simple              ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Invoke-SecretIngest {
    param($SecretName, $SecretValue, $SourceInfo)
    
    $body = @{
        name = $SecretName
        value = $SecretValue
        source = $SourceInfo
    } | ConvertTo-Json
    
    $headers = @{
        "x-heady-api-key" = $ApiKey
        "Content-Type" = "application/json"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$ApiUrl/api/secrets/ingest" `
            -Method POST `
            -Headers $headers `
            -Body $body
        
        Write-Host "✅ $($response.message)" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Failed to ingest secret: $_" -ForegroundColor Red
        return $false
    }
}

Write-HeadyBanner

switch ($Method) {
    'interactive' {
        if (-not $Name) {
            Write-Host "❌ -Name parameter required for interactive method" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "🔐 Ingesting secret: $Name" -ForegroundColor Cyan
        Write-Host ""
        
        $secureValue = Read-Host "Enter value for $Name" -AsSecureString
        $plainValue = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue)
        )
        
        Invoke-SecretIngest -SecretName $Name -SecretValue $plainValue -SourceInfo "interactive"
    }
    
    'file' {
        if (-not $Name -or -not $Source) {
            Write-Host "❌ -Name and -Source parameters required for file method" -ForegroundColor Red
            exit 1
        }
        
        if (-not (Test-Path $Source)) {
            Write-Host "❌ Source file not found: $Source" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "🔐 Ingesting secret from file: $Source" -ForegroundColor Cyan
        
        $value = Get-Content -Path $Source -Raw
        Invoke-SecretIngest -SecretName $Name -SecretValue $value.Trim() -SourceInfo "file:$Source"
    }
    
    'env' {
        if (-not $Name -or -not $Source) {
            Write-Host "❌ -Name and -Source parameters required for env method" -ForegroundColor Red
            exit 1
        }
        
        $value = [Environment]::GetEnvironmentVariable($Source)
        
        if (-not $value) {
            Write-Host "❌ Environment variable not found: $Source" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "🔐 Ingesting secret from environment variable: $Source" -ForegroundColor Cyan
        
        Invoke-SecretIngest -SecretName $Name -SecretValue $value -SourceInfo "env:$Source"
    }
    
    'env-file' {
        if (-not $Source) {
            Write-Host "❌ -Source parameter required for env-file method" -ForegroundColor Red
            exit 1
        }
        
        if (-not (Test-Path $Source)) {
            Write-Host "❌ Source file not found: $Source" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "🔐 Ingesting secrets from .env file: $Source" -ForegroundColor Cyan
        
        $body = @{
            filepath = (Resolve-Path $Source).Path
        } | ConvertTo-Json
        
        $headers = @{
            "x-heady-api-key" = $ApiKey
            "Content-Type" = "application/json"
        }
        
        try {
            $response = Invoke-RestMethod -Uri "$ApiUrl/api/secrets/ingest-env" `
                -Method POST `
                -Headers $headers `
                -Body $body
            
            Write-Host "✅ $($response.message)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to ingest secrets: $_" -ForegroundColor Red
            exit 1
        }
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  💖 Made with Love by Eric Haywood • HeadySystems.com 💖" -ForegroundColor Magenta
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
