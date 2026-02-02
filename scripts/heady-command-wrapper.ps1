#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Universal Heady Command Wrapper with Automatic MCP Integration

.DESCRIPTION
    Wraps any command to automatically utilize all HeadyMCP services
    Provides intelligent context and enhanced capabilities

.EXAMPLE
    heady npm install
    heady git commit -m "message"
    heady node script.js
#>

param(
    [Parameter(Position = 0, ValueFromRemainingArguments = $true)]
    [string[]]$Command
)

$ErrorActionPreference = 'Stop'
$HeadyRoot = 'c:\Users\erich\Heady'
$WrapperScript = Join-Path $HeadyRoot 'scripts' 'heady-mcp-wrapper.js'

if (-not $Command -or $Command.Length -eq 0) {
    Write-Host "Usage: heady <command> [args...]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  heady npm install"
    Write-Host "  heady git status"
    Write-Host "  heady node script.js"
    Write-Host "  heady autobuild"
    Write-Host ""
    Write-Host "All commands automatically utilize HeadyMCP services:" -ForegroundColor Green
    Write-Host "  • filesystem (8 tools)"
    Write-Host "  • sequential-thinking (1 tool)"
    Write-Host "  • memory (knowledge graph)"
    Write-Host "  • fetch (HTTP requests)"
    Write-Host "  • postgres (database)"
    Write-Host "  • git (version control)"
    Write-Host "  • puppeteer (browser automation)"
    Write-Host "  • cloudflare (API integration)"
    exit 0
}

# Execute command with MCP wrapper
& node $WrapperScript @Command
