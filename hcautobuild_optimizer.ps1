# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: hcautobuild_optimizer.ps1
# LAYER: root
# 
#         _   _  _____    _    ____   __   __
#        | | | || ____|  / \  |  _ \ \ \ / /
#        | |_| ||  _|   / _ \ | | | | \ V / 
#        |  _  || |___ / ___ \| |_| |  | |  
#        |_| |_||_____/_/   \_\____/   |_|  
# 
#    Sacred Geometry :: Organic Systems :: Breathing Interfaces
# HEADY_BRAND:END

<#
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║     ██╗  ██╗███████╗ █████╗ ██████╗ ██╗   ██╗                                ║
║     ██║  ██║██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝                                ║
║     ███████║█████╗  ███████║██║  ██║ ╚████╔╝                                 ║
║     ██╔══██║██╔══╝  ██╔══██║██║  ██║  ╚██╔╝                                  ║
║     ██║  ██║███████╗██║  ██║██████╔╝   ██║                                   ║
║     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                                   ║
║                                                                               ║
║     ∞ HCAutoBuild Optimizer - Codemap Integration ∞                           ║
║     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                         ║
║     Integrates Heady Academy optimization nodes for enhanced performance       ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
#>

param(
    [switch]$optimize,
    [switch]$analyze,
    [switch]$jules,
    [switch]$observer,
    [switch]$builder,
    [switch]$atlas,
    [string]$workspace,
    [switch]$help
)

$ErrorActionPreference = "Stop"

# Node Registry Integration
$NODE_REGISTRY = @{
    JULES = @{
        name = "JULES"
        role = "The Hyper-Surgeon"
        tool = "goose"
        trigger = "optimization"
        script = "HeadyAcademy/Tools/Optimizer.py"
    }
    OBSERVER = @{
        name = "OBSERVER"
        role = "The Natural Observer"
        tool = "observer_daemon"
        trigger = "monitor"
    }
    BUILDER = @{
        name = "BUILDER"
        role = "The Constructor"
        tool = "hydrator"
        trigger = "new_project"
    }
    ATLAS = @{
        name = "ATLAS"
        role = "The Auto-Archivist"
        tool = "auto_doc"
        trigger = "documentation"
    }
}

function Write-NodeLog {
    param([string]$Message, [string]$Node = "OPTIMIZER", [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Node] $Message"
    
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARNING" { "Yellow" }
        "SUCCESS" { "Green" }
        "INFO" { "Cyan" }
        default { "White" }
    }
    
    Write-Host $logEntry -ForegroundColor $color
    
    # Log to file
    $logDir = ".heady\logs"
    if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Force -Path $logDir | Out-Null }
    Add-Content -Path "$logDir\hcautobuild_optimizer.log" -Value $logEntry
}

function Invoke-JulesOptimization {
    param([string]$TargetPath)
    
    Write-NodeLog "Activating JULES node for code optimization..." -Node "JULES"
    
    $julesScript = Join-Path $PSScriptRoot "HeadyAcademy\Tools\Optimizer.py"
    
    if (-not (Test-Path $julesScript)) {
        Write-NodeLog "JULES script not found: $julesScript" -Node "JULES" -Level "ERROR"
        return $false
    }
    
    try {
        # Check if Python is available
        $pythonCmd = Get-Command python -ErrorAction SilentlyContinue
        if (-not $pythonCmd) {
            Write-NodeLog "Python not available for JULES optimization" -Node "JULES" -Level "WARNING"
            return $false
        }
        
        Write-NodeLog "Running JULES optimization on: $TargetPath" -Node "JULES"
        
        # Run JULES optimization
        $result = & python $julesScript $TargetPath 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-NodeLog "JULES optimization completed successfully" -Node "JULES" -Level "SUCCESS"
            Write-NodeLog "Result: $result" -Node "JULES"
            return $true
        } else {
            Write-NodeLog "JULES optimization failed: $result" -Node "JULES" -Level "ERROR"
            return $false
        }
    } catch {
        Write-NodeLog "JULES optimization error: $($_.Exception.Message)" -Node "JULES" -Level "ERROR"
        return $false
    }
}

function Invoke-ObserverMonitoring {
    param([string]$WorkspacePath)
    
    Write-NodeLog "Activating OBSERVER node for enhanced monitoring..." -Node "OBSERVER"
    
    try {
        # Enhanced workspace analysis
        $analysis = @{
            timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
            workspace = $WorkspacePath
            file_count = 0
            total_size = 0
            language_distribution = @{}
            recent_activity = @()
            optimization_opportunities = @()
        }
        
        # Analyze workspace
        Get-ChildItem -Path $WorkspacePath -Recurse -File | ForEach-Object {
            $analysis.file_count++
            $analysis.total_size += $_.Length
            
            $ext = $_.Extension.ToLower()
            if ($analysis.language_distribution.ContainsKey($ext)) {
                $analysis.language_distribution[$ext]++
            } else {
                $analysis.language_distribution[$ext] = 1
            }
            
            # Check for recent activity
            if ($_.LastWriteTime -gt (Get-Date).AddDays(-1)) {
                $analysis.recent_activity += @{
                    file = $_.FullName
                    modified = $_.LastWriteTime
                    size = $_.Length
                }
            }
        }
        
        # Identify optimization opportunities
        if ($analysis.total_size -gt 100MB) {
            $analysis.optimization_opportunities += "Large workspace size detected - consider cleanup"
        }
        
        if ($analysis.file_count -gt 10000) {
            $analysis.optimization_opportunities += "High file count - consider consolidation"
        }
        
        Write-NodeLog "OBSERVER analysis complete" -Node "OBSERVER" -Level "SUCCESS"
        Write-NodeLog "Files: $($analysis.file_count), Size: $([math]::Round($analysis.total_size / 1MB, 2))MB" -Node "OBSERVER"
        
        # Save analysis report
        $reportDir = ".heady\observer_reports"
        if (-not (Test-Path $reportDir)) { New-Item -ItemType Directory -Force -Path $reportDir | Out-Null }
        
        $reportFile = Join-Path $reportDir "observer_analysis_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
        $analysis | ConvertTo-Json -Depth 10 | Set-Content $reportFile
        
        Write-NodeLog "Observer report saved: $reportFile" -Node "OBSERVER"
        
        return $analysis
    } catch {
        Write-NodeLog "OBSERVER monitoring error: $($_.Exception.Message)" -Node "OBSERVER" -Level "ERROR"
        return $false
    }
}

function Invoke-BuilderOptimization {
    param([string]$WorkspacePath)
    
    Write-NodeLog "Activating BUILDER node for project optimization..." -Node "BUILDER"
    
    try {
        $optimizations = @()
        
        # Check for build optimization opportunities
        if (Test-Path (Join-Path $WorkspacePath "package.json")) {
            $optimizations += "Node.js project detected - can optimize dependencies and build process"
        }
        
        if (Test-Path (Join-Path $WorkspacePath "requirements.txt")) {
            $optimizations += "Python project detected - can optimize dependencies and packaging"
        }
        
        if (Test-Path (Join-Path $WorkspacePath "Dockerfile")) {
            $optimizations += "Docker project detected - can optimize image size and layers"
        }
        
        # Check for common optimization patterns
        $largeFiles = Get-ChildItem -Path $WorkspacePath -Recurse -File | Where-Object { $_.Length -gt 10MB }
        if ($largeFiles.Count -gt 0) {
            $optimizations += "Found $($largeFiles.Count) large files - consider compression or optimization"
        }
        
        $oldFiles = Get-ChildItem -Path $WorkspacePath -Recurse -File | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-90) }
        if ($oldFiles.Count -gt 50) {
            $optimizations += "Found $($oldFiles.Count) files older than 90 days - consider cleanup"
        }
        
        Write-NodeLog "BUILDER optimization complete" -Node "BUILDER" -Level "SUCCESS"
        
        foreach ($opt in $optimizations) {
            Write-NodeLog "→ $opt" -Node "BUILDER"
        }
        
        return $optimizations
    } catch {
        Write-NodeLog "BUILDER optimization error: $($_.Exception.Message)" -Node "BUILDER" -Level "ERROR"
        return $false
    }
}

function Invoke-AtlasDocumentation {
    param([string]$WorkspacePath)
    
    Write-NodeLog "Activating ATLAS node for documentation generation..." -Node "ATLAS"
    
    try {
        $documentation = @{
            timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
            workspace = $WorkspacePath
            structure = @{}
            apis = @()
            dependencies = @()
            documentation_files = @()
        }
        
        # Analyze workspace structure
        Get-ChildItem -Path $WorkspacePath -Directory | ForEach-Object {
            $documentation.structure[$_.Name] = @{
                type = "directory"
                created = $_.CreationTime
                file_count = (Get-ChildItem -Path $_.FullName -Recurse -File).Count
            }
        }
        
        # Look for API definitions
        $apiFiles = @("swagger.json", "openapi.yaml", "api.yml", "routes.js", "api.js")
        foreach ($apiFile in $apiFiles) {
            $found = Get-ChildItem -Path $WorkspacePath -Recurse -Filter $apiFile -ErrorAction SilentlyContinue
            if ($found) {
                $documentation.apis += $found.FullName
            }
        }
        
        # Analyze dependencies
        $packageFiles = @("package.json", "requirements.txt", "Pipfile", "composer.json")
        foreach ($pkgFile in $packageFiles) {
            $found = Get-ChildItem -Path $WorkspacePath -Recurse -Filter $pkgFile -ErrorAction SilentlyContinue
            if ($found) {
                $documentation.dependencies += @{
                    file = $found.FullName
                    type = $found.Extension
                    size = $found.Length
                }
            }
        }
        
        # Check existing documentation
        $docFiles = @("README.md", "CHANGELOG.md", "CONTRIBUTING.md", "docs/", "doc/")
        foreach ($docFile in $docFiles) {
            $found = Get-ChildItem -Path $WorkspacePath -Recurse -Filter $docFile -ErrorAction SilentlyContinue
            if ($found) {
                $documentation.documentation_files += $found.FullName
            }
        }
        
        Write-NodeLog "ATLAS documentation analysis complete" -Node "ATLAS" -Level "SUCCESS"
        Write-NodeLog "APIs found: $($documentation.apis.Count)" -Node "ATLAS"
        Write-NodeLog "Dependencies found: $($documentation.dependencies.Count)" -Node "ATLAS"
        Write-NodeLog "Documentation files: $($documentation.documentation_files.Count)" -Node "ATLAS"
        
        # Save documentation report
        $reportDir = ".heady\atlas_reports"
        if (-not (Test-Path $reportDir)) { New-Item -ItemType Directory -Force -Path $reportDir | Out-Null }
        
        $reportFile = Join-Path $reportDir "atlas_documentation_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
        $documentation | ConvertTo-Json -Depth 10 | Set-Content $reportFile
        
        Write-NodeLog "ATLAS report saved: $reportFile" -Node "ATLAS"
        
        return $documentation
    } catch {
        Write-NodeLog "ATLAS documentation error: $($_.Exception.Message)" -Node "ATLAS" -Level "ERROR"
        return $false
    }
}

function Invoke-CodemapOptimization {
    param([string]$WorkspacePath)
    
    Write-Host "∞ HCAutoBuild Codemap Optimization ∞" -ForegroundColor Cyan
    
    $results = @{
        workspace = $WorkspacePath
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
        nodes_executed = @()
        optimizations_found = 0
        success = $true
    }
    
    # Execute requested nodes
    if ($jules -or $optimize) {
        Write-NodeLog "Executing JULES optimization..." -Node "COORDINATOR"
        if (Invoke-JulesOptimization $WorkspacePath) {
            $results.nodes_executed += "JULES"
            $results.optimizations_found++
        } else {
            $results.success = $false
        }
    }
    
    if ($observer -or $analyze) {
        Write-NodeLog "Executing OBSERVER monitoring..." -Node "COORDINATOR"
        $observerResult = Invoke-ObserverMonitoring $WorkspacePath
        if ($observerResult) {
            $results.nodes_executed += "OBSERVER"
            $results.optimizations_found += $observerResult.optimization_opportunities.Count
        } else {
            $results.success = $false
        }
    }
    
    if ($builder) {
        Write-NodeLog "Executing BUILDER optimization..." -Node "COORDINATOR"
        $builderResult = Invoke-BuilderOptimization $WorkspacePath
        if ($builderResult) {
            $results.nodes_executed += "BUILDER"
            $results.optimizations_found += $builderResult.Count
        } else {
            $results.success = $false
        }
    }
    
    if ($atlas) {
        Write-NodeLog "Executing ATLAS documentation..." -Node "COORDINATOR"
        if (Invoke-AtlasDocumentation $WorkspacePath) {
            $results.nodes_executed += "ATLAS"
            $results.optimizations_found++
        } else {
            $results.success = $false
        }
    }
    
    # Generate summary report
    Write-Host "`n╔═══════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                    Codemap Optimization Summary                           ║" -ForegroundColor Cyan
    Write-Host "╠══════════════════════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
    Write-Host "║ Workspace: $WorkspacePath $((' ' * (50 - $WorkspacePath.Length)))║" -ForegroundColor White
    Write-Host "║ Nodes Executed: $($results.nodes_executed.Count) $((' ' * (44 - $($results.nodes_executed.Count.ToString().Length)))║" -ForegroundColor White
    Write-Host "║ Optimizations Found: $($results.optimizations_found) $((' ' * (39 - $($results.optimizations_found.ToString().Length)))║" -ForegroundColor White
    Write-Host "║ Status: $(if ($results.success) { 'SUCCESS' } else { 'PARTIAL' }) $((' ' * (47 - (if ($results.success) { 7 } else { 7 })))║" -ForegroundColor $(if ($results.success) { "Green" } else { "Yellow" })
    Write-Host "╠══════════════════════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
    
    if ($results.nodes_executed.Count -gt 0) {
        Write-Host "║ Nodes Activated:                                                      ║" -ForegroundColor Cyan
        foreach ($node in $results.nodes_executed) {
            $nodeInfo = $NODE_REGISTRY[$node]
            Write-Host "║   • $($nodeInfo.name) - $($nodeInfo.role) $((' ' * (35 - ($nodeInfo.name.Length + $nodeInfo.role.Length)))║" -ForegroundColor Green
        }
    }
    
    Write-Host "╚══════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    
    # Save results
    $reportDir = ".heady\optimization_reports"
    if (-not (Test-Path $reportDir)) { New-Item -ItemType Directory -Force -Path $reportDir | Out-Null }
    
    $reportFile = Join-Path $reportDir "codemap_optimization_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
    $results | ConvertTo-Json -Depth 10 | Set-Content $reportFile
    
    Write-NodeLog "Optimization report saved: $reportFile" -Node "COORDINATOR" -Level "SUCCESS"
    
    return $results
}

# Main execution
try {
    if ($help) {
        Write-Host @"
HCAutoBuild Optimizer - Codemap Integration

USAGE:
    .\hcautobuild_optimizer.ps1 [OPTIONS]

OPTIONS:
    -optimize        Run full optimization (all nodes)
    -analyze         Run analysis nodes (OBSERVER, ATLAS)
    -jules           Run JULES optimization node only
    -observer        Run OBSERVER monitoring node only
    -builder         Run BUILDER optimization node only
    -atlas           Run ATLAS documentation node only
    -workspace PATH  Specify target workspace
    -help            Show this help message

NODES:
    JULES    - The Hyper-Surgeon (Code Optimization)
    OBSERVER - The Natural Observer (Enhanced Monitoring)
    BUILDER  - The Constructor (Project Optimization)
    ATLAS    - The Auto-Archivist (Documentation)

EXAMPLES:
    .\hcautobuild_optimizer.ps1 -optimize
    .\hcautobuild_optimizer.ps1 -jules -workspace "C:\Project"
    .\hcautobuild_optimizer.ps1 -analyze
"@
        exit 0
    }
    
    $targetWorkspace = if ($workspace) { $workspace } else { $PSScriptRoot }
    
    if (-not (Test-Path $targetWorkspace)) {
        Write-NodeLog "Workspace not found: $targetWorkspace" -Level "ERROR"
        exit 1
    }
    
    Write-NodeLog "Starting codemap optimization on: $targetWorkspace" -Node "COORDINATOR"
    
    $result = Invoke-CodemapOptimization $targetWorkspace
    
    if ($result.success) {
        Write-NodeLog "Codemap optimization completed successfully" -Node "COORDINATOR" -Level "SUCCESS"
        exit 0
    } else {
        Write-NodeLog "Codemap optimization completed with issues" -Node "COORDINATOR" -Level "WARNING"
        exit 1
    }
    
} catch {
    Write-NodeLog "Fatal error: $($_.Exception.Message)" -Node "COORDINATOR" -Level "ERROR"
    exit 1
}
