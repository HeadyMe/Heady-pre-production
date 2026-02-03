# Connect-HeadyMCP.ps1
# Convenient connection utility for HeadyMCP services

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("status", "start", "stop", "restart", "test", "list")]
    [string]$Action = "status",
    
    [Parameter(Mandatory=$false)]
    [string]$Service,
    
    [switch]$All,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot
$RootDir = "$ScriptDir\.."

# MCP Configuration
$MCPConfig = @{
    HeadyManager = @{
        Port = 3300
        Command = "npm start"
        WorkDir = $RootDir
        HealthCheck = "http://localhost:3300/api/health"
    }
    MCPGateway = @{
        Port = 3301
        Command = "node mcp-servers/heady-windsurf-router/server.js"
        WorkDir = $RootDir
        HealthCheck = "http://localhost:3301/health"
    }
    Orchestrator = @{
        Port = 3100
        Command = "docker-compose up -d orchestrator"
        WorkDir = "$RootDir/../"
        HealthCheck = "http://localhost:3100/api/health"
    }
}

function Write-Status {
    param($Message, $Type = "Info")
    $Colors = @{
        Success = "Green"
        Error = "Red"
        Warning = "Yellow"
        Info = "Cyan"
        Dim = "Gray"
    }
    Write-Host $Message -ForegroundColor $Colors[$Type]
}

function Test-ServiceHealth {
    param($ServiceName, $Config)
    
    try {
        $Response = Invoke-WebRequest -Uri $Config.HealthCheck -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($Response.StatusCode -eq 200) {
            return @{ Status = "HEALTHY"; Port = $Config.Port }
        }
    } catch {
        # Check if port is listening
        $Port = $Config.Port
        $Listening = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        if ($Listening) {
            return @{ Status = "RUNNING"; Port = $Port }
        }
    }
    
    return @{ Status = "OFFLINE"; Port = $Config.Port }
}

function Show-MCPStatus {
    Write-Status "`n╔═══════════════════════════════════════════════════════════════╗" "Info"
    Write-Status "║              HeadyMCP Services Status                        ║" "Info"
    Write-Status "╚═══════════════════════════════════════════════════════════════╝`n" "Info"
    
    foreach ($ServiceName in $MCPConfig.Keys) {
        $Config = $MCPConfig[$ServiceName]
        $Health = Test-ServiceHealth -ServiceName $ServiceName -Config $Config
        
        $StatusColor = switch ($Health.Status) {
            "HEALTHY" { "Success" }
            "RUNNING" { "Warning" }
            "OFFLINE" { "Error" }
        }
        
        $Icon = switch ($Health.Status) {
            "HEALTHY" { "✓" }
            "RUNNING" { "⚠" }
            "OFFLINE" { "✗" }
        }
        
        Write-Host "  $Icon " -NoNewline -ForegroundColor $StatusColor
        Write-Host "$ServiceName " -NoNewline -ForegroundColor White
        Write-Host "[$($Health.Status)] " -NoNewline -ForegroundColor $StatusColor
        Write-Host "Port: $($Health.Port)" -ForegroundColor Gray
    }
    
    Write-Host ""
}

function Start-MCPService {
    param($ServiceName)
    
    if (-not $MCPConfig.ContainsKey($ServiceName)) {
        Write-Status "Unknown service: $ServiceName" "Error"
        return
    }
    
    $Config = $MCPConfig[$ServiceName]
    Write-Status "Starting $ServiceName..." "Info"
    
    Push-Location $Config.WorkDir
    
    if ($ServiceName -eq "HeadyManager") {
        Start-Process pwsh -ArgumentList "-NoExit", "-Command", "npm start" -WorkingDirectory $Config.WorkDir
    } elseif ($ServiceName -eq "MCPGateway") {
        Start-Process pwsh -ArgumentList "-NoExit", "-Command", $Config.Command -WorkingDirectory $Config.WorkDir
    } elseif ($ServiceName -eq "Orchestrator") {
        & docker-compose up -d orchestrator
    }
    
    Pop-Location
    
    Start-Sleep -Seconds 3
    $Health = Test-ServiceHealth -ServiceName $ServiceName -Config $Config
    
    if ($Health.Status -ne "OFFLINE") {
        Write-Status "✓ $ServiceName started successfully" "Success"
    } else {
        Write-Status "✗ Failed to start $ServiceName" "Error"
    }
}

function Stop-MCPService {
    param($ServiceName)
    
    if (-not $MCPConfig.ContainsKey($ServiceName)) {
        Write-Status "Unknown service: $ServiceName" "Error"
        return
    }
    
    $Config = $MCPConfig[$ServiceName]
    Write-Status "Stopping $ServiceName..." "Warning"
    
    if ($ServiceName -eq "Orchestrator") {
        Push-Location $Config.WorkDir
        & docker-compose stop orchestrator
        Pop-Location
    } else {
        # Find and kill process on port
        $Port = $Config.Port
        $Processes = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        if ($Processes) {
            $ProcessId = $Processes[0].OwningProcess
            Stop-Process -Id $ProcessId -Force
            Write-Status "✓ Stopped process on port $Port" "Success"
        } else {
            Write-Status "No process found on port $Port" "Dim"
        }
    }
}

function Test-MCPConnection {
    Write-Status "`n[Testing MCP Connections]`n" "Info"
    
    # Test HeadyManager
    Write-Status "Testing HeadyManager..." "Info"
    try {
        $Response = Invoke-RestMethod -Uri "http://localhost:3300/api/health" -TimeoutSec 5
        Write-Status "  ✓ HeadyManager: $($Response.status)" "Success"
    } catch {
        Write-Status "  ✗ HeadyManager: Offline" "Error"
    }
    
    # Test MCP Config
    Write-Status "`nTesting MCP Configuration..." "Info"
    $ConfigPath = "$RootDir/mcp_config.json"
    if (Test-Path $ConfigPath) {
        $Config = Get-Content $ConfigPath | ConvertFrom-Json
        $ServerCount = $Config.mcpServers.PSObject.Properties.Count
        Write-Status "  ✓ Found $ServerCount MCP servers configured" "Success"
        
        if ($Verbose) {
            Write-Status "`n  Configured Servers:" "Dim"
            $Config.mcpServers.PSObject.Properties | ForEach-Object {
                Write-Host "    • $($_.Name)" -ForegroundColor Gray
            }
        }
    } else {
        Write-Status "  ✗ MCP config not found" "Error"
    }
    
    # Test Intelligence Verifier
    Write-Status "`nRunning Intelligence Verification..." "Info"
    $VerifierPath = "$RootDir/src/heady_intelligence_verifier.js"
    if (Test-Path $VerifierPath) {
        & node $VerifierPath
    } else {
        Write-Status "  ⚠ Intelligence verifier not found" "Warning"
    }
}

function Show-MCPServices {
    Write-Status "`n╔═══════════════════════════════════════════════════════════════╗" "Info"
    Write-Status "║              Available MCP Services                          ║" "Info"
    Write-Status "╚═══════════════════════════════════════════════════════════════╝`n" "Info"
    
    $ConfigPath = "$RootDir/mcp_config.json"
    if (-not (Test-Path $ConfigPath)) {
        Write-Status "MCP config not found at: $ConfigPath" "Error"
        return
    }
    
    $Config = Get-Content $ConfigPath | ConvertFrom-Json
    
    Write-Status "Core Services:" "Info"
    foreach ($Service in $MCPConfig.Keys) {
        $ServiceConfig = $MCPConfig[$Service]
        Write-Host "  • " -NoNewline -ForegroundColor Cyan
        Write-Host "$Service " -NoNewline -ForegroundColor White
        Write-Host "(Port: $($ServiceConfig.Port))" -ForegroundColor Gray
    }
    
    Write-Status "`nMCP Servers (from config):" "Info"
    $Config.mcpServers.PSObject.Properties | ForEach-Object {
        Write-Host "  • " -NoNewline -ForegroundColor Cyan
        Write-Host "$($_.Name) " -NoNewline -ForegroundColor White
        
        $Command = $_.Value.command
        $Args = $_.Value.args -join " "
        Write-Host "($Command $Args)" -ForegroundColor Gray
    }
    
    Write-Host ""
}

# Main execution
switch ($Action) {
    "status" {
        Show-MCPStatus
    }
    "start" {
        if ($All) {
            foreach ($ServiceName in $MCPConfig.Keys) {
                Start-MCPService -ServiceName $ServiceName
                Start-Sleep -Seconds 2
            }
        } elseif ($Service) {
            Start-MCPService -ServiceName $Service
        } else {
            Write-Status "Specify -Service <name> or use -All" "Warning"
            Write-Status "Available services: $($MCPConfig.Keys -join ', ')" "Info"
        }
    }
    "stop" {
        if ($All) {
            foreach ($ServiceName in $MCPConfig.Keys) {
                Stop-MCPService -ServiceName $ServiceName
            }
        } elseif ($Service) {
            Stop-MCPService -ServiceName $Service
        } else {
            Write-Status "Specify -Service <name> or use -All" "Warning"
        }
    }
    "restart" {
        if ($Service) {
            Stop-MCPService -ServiceName $Service
            Start-Sleep -Seconds 2
            Start-MCPService -ServiceName $Service
        } else {
            Write-Status "Specify -Service <name>" "Warning"
        }
    }
    "test" {
        Test-MCPConnection
    }
    "list" {
        Show-MCPServices
    }
}

# Show connection info
if ($Action -eq "status" -or $Action -eq "start") {
    Write-Status "`n[Connection Information]" "Info"
    Write-Host "  HeadyManager API:  http://localhost:3300" -ForegroundColor Cyan
    Write-Host "  Admin UI:          http://localhost:3300/admin" -ForegroundColor Cyan
    Write-Host "  MCP Gateway:       http://localhost:3301" -ForegroundColor Cyan
    Write-Host "  Orchestrator API:  http://localhost:3100" -ForegroundColor Cyan
    Write-Host ""
    Write-Status "Quick Commands:" "Dim"
    Write-Host "  .\scripts\Connect-HeadyMCP.ps1 -Action status    # Check status" -ForegroundColor Gray
    Write-Host "  .\scripts\Connect-HeadyMCP.ps1 -Action start -All # Start all" -ForegroundColor Gray
    Write-Host "  .\scripts\Connect-HeadyMCP.ps1 -Action test      # Test connections" -ForegroundColor Gray
    Write-Host "  .\scripts\Connect-HeadyMCP.ps1 -Action list      # List services" -ForegroundColor Gray
    Write-Host ""
}
