#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Test Heady Registry Routing System

.DESCRIPTION
    Quick test script to verify the HeadyRegistry Router is working correctly

.PARAMETER Request
    The request to analyze and route

.PARAMETER Execute
    If specified, execute the routing plan

.EXAMPLE
    .\test-routing.ps1 -Request "Generate comprehensive API documentation"
    
.EXAMPLE
    .\test-routing.ps1 -Request "Generate comprehensive API documentation" -Execute
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$Request = "Generate comprehensive markdown documentation for the Heady Manager API",
    
    [Parameter(Mandatory=$false)]
    [switch]$Execute
)

$ErrorActionPreference = "Stop"

Write-Host "`n=== HEADY REGISTRY ROUTING TEST ===" -ForegroundColor Cyan
Write-Host "Request: $Request`n" -ForegroundColor Yellow

# Test 1: Router Analysis
Write-Host "[Test 1] Testing HeadyRegistryRouter..." -ForegroundColor Green
$routerPath = Join-Path $PSScriptRoot "..\src\heady_registry_router.js"

if (-not (Test-Path $routerPath)) {
    Write-Host "ERROR: Router not found at $routerPath" -ForegroundColor Red
    exit 1
}

$routerArgs = @("`"$Request`"")
$routerResult = node $routerPath $routerArgs 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Router analysis successful" -ForegroundColor Green
    Write-Host $routerResult
} else {
    Write-Host "✗ Router analysis failed" -ForegroundColor Red
    Write-Host $routerResult
    exit 1
}

# Test 2: Bridge Analysis
Write-Host "`n[Test 2] Testing WindsurfHeadyBridge..." -ForegroundColor Green
$bridgePath = Join-Path $PSScriptRoot "..\src\windsurf_heady_bridge.js"

if (-not (Test-Path $bridgePath)) {
    Write-Host "ERROR: Bridge not found at $bridgePath" -ForegroundColor Red
    exit 1
}

$bridgeArgs = @("`"$Request`"")
if ($Execute) {
    $bridgeArgs += "--execute"
}

$bridgeResult = node $bridgePath $bridgeArgs 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Bridge analysis successful" -ForegroundColor Green
    Write-Host $bridgeResult
} else {
    Write-Host "✗ Bridge analysis failed" -ForegroundColor Red
    Write-Host $bridgeResult
    exit 1
}

# Test 3: Registry Validation
Write-Host "`n[Test 3] Validating HeadyRegistry..." -ForegroundColor Green
$registryPath = Join-Path $PSScriptRoot "..\.heady-memory\heady-registry.json"

if (-not (Test-Path $registryPath)) {
    Write-Host "ERROR: Registry not found at $registryPath" -ForegroundColor Red
    exit 1
}

try {
    $registry = Get-Content $registryPath -Raw | ConvertFrom-Json
    
    if ($registry.routing) {
        Write-Host "✓ Registry has routing configuration" -ForegroundColor Green
        Write-Host "  Router: $($registry.routing.router.canonical)" -ForegroundColor Gray
        Write-Host "  Capabilities: $($registry.routing.capabilities.PSObject.Properties.Name.Count)" -ForegroundColor Gray
    } else {
        Write-Host "✗ Registry missing routing configuration" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Registry validation failed: $_" -ForegroundColor Red
    exit 1
}

# Test 4: Audit Log Check
Write-Host "`n[Test 4] Checking Audit Logs..." -ForegroundColor Green
$auditPath = Join-Path $PSScriptRoot "..\audit_logs\windsurf_routing.jsonl"

if (Test-Path $auditPath) {
    $logLines = Get-Content $auditPath | Select-Object -Last 5
    Write-Host "✓ Audit log exists with $($logLines.Count) recent entries" -ForegroundColor Green
    
    if ($logLines.Count -gt 0) {
        Write-Host "`nRecent routing decisions:" -ForegroundColor Gray
        $logLines | ForEach-Object {
            $entry = $_ | ConvertFrom-Json
            Write-Host "  [$($entry.timestamp)] $($entry.request)" -ForegroundColor DarkGray
        }
    }
} else {
    Write-Host "⚠ Audit log not yet created (will be created on first routing)" -ForegroundColor Yellow
}

Write-Host "`n=== ALL TESTS PASSED ===" -ForegroundColor Green
Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Test with different request types:" -ForegroundColor White
Write-Host "   .\test-routing.ps1 -Request 'Perform security audit on authentication'" -ForegroundColor Gray
Write-Host "   .\test-routing.ps1 -Request 'Generate code for user registration'" -ForegroundColor Gray
Write-Host "   .\test-routing.ps1 -Request 'Research best practices for API design'" -ForegroundColor Gray
Write-Host "`n2. Execute a real routing:" -ForegroundColor White
Write-Host "   .\test-routing.ps1 -Request 'Your request here' -Execute" -ForegroundColor Gray
Write-Host "`n3. Review the full guide:" -ForegroundColor White
Write-Host "   docs\HEADY_REGISTRY_ROUTING_GUIDE.md" -ForegroundColor Gray
Write-Host ""
