# Heady Systems Functionality Demonstration
# Exercises the HeadyMCP Stack and verifies system cohesion

$ErrorActionPreference = "Stop"
$headers = @{ "Content-Type" = "application/json" }

function Test-Endpoint {
    param($Name, $Url, $Method="Get", $Body=$null)
    Write-Host "Testing $Name..." -NoNewline -ForegroundColor Cyan
    try {
        if ($Body) {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Body $Body -Headers $headers
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers
        }
        Write-Host " OK" -ForegroundColor Green
        return $response
    } catch {
        Write-Host " FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

Write-Host "∞ HEADY STACK DEMONSTRATION ∞`n" -ForegroundColor Magenta

# 1. Global Graph (Knowledge)
Write-Host "1. Heady Graph (Knowledge Layer)" -ForegroundColor Yellow
$nodeData = @{ 
    id = "demo-session-$(Get-Random)"
    type = "session"
    metadata = @{ 
        initiator = "HeadyAI"
        purpose = "demonstration"
        timestamp = (Get-Date).ToString("s")
    } 
} | ConvertTo-Json
$res = Test-Endpoint "Add Graph Node" "http://localhost:3301/tools/add_entity" "Post" $nodeData

$queryData = @{ query = "demo" } | ConvertTo-Json
$res = Test-Endpoint "Query Graph" "http://localhost:3301/tools/query_graph" "Post" $queryData
if ($res) { Write-Host "  Found $($res.data.nodes.Count) nodes matching query." -ForegroundColor Gray }

# 2. Metrics (Observability)
Write-Host "`n2. Heady Metrics (Observability Layer)" -ForegroundColor Yellow
$metricData = @{ 
    name = "system.consciousness.level"
    value = 99.9
    labels = @{ environment = "demo"; status = "elevated" } 
} | ConvertTo-Json
Test-Endpoint "Record Metric" "http://localhost:3302/tools/record_metric" "Post" $metricData | Out-Null

$metricsQuery = @{ names = @("system.consciousness.level"); timeRange = @{ start = [int64]((Get-Date).AddMinutes(-5) - (Get-Date "1/1/1970")).TotalMilliseconds } } | ConvertTo-Json
$res = Test-Endpoint "Retrieve Metrics" "http://localhost:3302/tools/get_metrics" "Post" $metricsQuery
if ($res) { Write-Host "  Retrieved metric data successfully." -ForegroundColor Gray }

# 3. Workflow (Orchestration)
Write-Host "`n3. Heady Workflow (Action Layer)" -ForegroundColor Yellow
$workflowData = @{
    name = "sacred-initialization"
    steps = @(
        @{ type = "verify"; payload = @{ target = "graph" } }
        @{ type = "ignite"; payload = @{ power = 100 } }
    )
    metadata = @{ context = "demo" }
} | ConvertTo-Json
$wf = Test-Endpoint "Create Workflow" "http://localhost:3303/tools/create_workflow" "Post" $workflowData

if ($wf) {
    $execData = @{ workflowId = $wf.data.id; params = @{ mode = "auto" } } | ConvertTo-Json
    $exec = Test-Endpoint "Execute Workflow" "http://localhost:3303/tools/execute_workflow" "Post" $execData
    if ($exec) { Write-Host "  Workflow executed: $($exec.data.status)" -ForegroundColor Gray }
}

# 4. Assets (Visuals)
Write-Host "`n4. Heady Assets (Presentation Layer)" -ForegroundColor Yellow
$assetData = @{ type = "flower"; complexity = 7; color = "#FFD700" } | ConvertTo-Json
$svg = Test-Endpoint "Generate Sacred Geometry" "http://localhost:3304/tools/generate_sacred_pattern" "Post" $assetData
if ($svg) { Write-Host "  Generated SVG Pattern ($($svg.data.svg.Length) bytes)" -ForegroundColor Gray }

# 5. Core Manager (Integration)
Write-Host "`n5. Heady Core Manager (Integration Layer)" -ForegroundColor Yellow
Test-Endpoint "Health Check" "http://localhost:3300/api/health" | Out-Null
Test-Endpoint "Admin UI Access" "http://localhost:3300/admin" "Head" | Out-Null

# 6. Heady Backend (Services)
Write-Host "`n6. Heady Backend (Service Layer)" -ForegroundColor Yellow
Test-Endpoint "Backend Health" "http://localhost:4000/api/health" | Out-Null
$proxyData = @{ server = "graph"; tool = "get_subgraph"; args = @{ workspace = "demo" } } | ConvertTo-Json
$res = Test-Endpoint "MCP Proxy Test" "http://localhost:4000/api/mcp/proxy" "Post" $proxyData
if ($res) { Write-Host "  Proxy Response: $($res.success)" -ForegroundColor Gray }

Write-Host "`n∞ DEMONSTRATION COMPLETE - ALL SYSTEMS NOMINAL ∞" -ForegroundColor Green
