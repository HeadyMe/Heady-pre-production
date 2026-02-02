<#
.SYNOPSIS
    Build-HeadyEcosystem.ps1 - Automates integration of repository components into Heady architecture

.DESCRIPTION
    This script restructures a repository into the Heady Sacred Geometry architecture with three domains:
    - HeadySystems: Infrastructure and deployment configurations
    - HeadyConnection: Application code and frontend assets  
    - HeadyDirective: Governance, rules, and documentation

.PARAMETER DryRun
    Simulate file moves without executing them

.PARAMETER Force
    Skip confirmation prompts

.EXAMPLE
    .\Build-HeadyEcosystem.ps1
    Run the full integration with interactive prompts

.EXAMPLE
    .\Build-HeadyEcosystem.ps1 -DryRun
    Preview what would be moved without making changes

.EXAMPLE
    .\Build-HeadyEcosystem.ps1 -Force
    Run without confirmation prompts
#>

[CmdletBinding()]
param(
    [switch]$DryRun,
    [switch]$Force
)

# Color scheme for Heady branding
$Colors = @{
    Cyan = "Cyan"
    Green = "Green" 
    Magenta = "Magenta"
    Yellow = "Yellow"
    Red = "Red"
    White = "White"
}

function Write-Heady {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Colors[$Color]
}

function Test-GitRepository {
    Write-Heady "🔍 Checking Git repository status..." "Cyan"
    
    if (-not (Test-Path ".git")) {
        Write-Heady "❌ Error: Current directory is not a Git repository" "Red"
        return $false
    }
    
    $status = git status --porcelain
    if ($status) {
        Write-Heady "❌ Error: Working tree is not clean. Uncommitted changes detected:" "Red"
        Write-Host $status
        Write-Heady "Please commit or stash changes before running this script." "Yellow"
        return $false
    }
    
    Write-Heady "✅ Git repository is clean" "Green"
    return $true
}

function Test-DirectoryExists {
    param([string]$Path)
    return Test-Path $Path -PathType Container
}

function Move-HeadyItem {
    param(
        [string]$Source,
        [string]$Destination,
        [string]$Description = ""
    )
    
    if (-not (Test-Path $Source)) {
        Write-Heady "⚠️  Source not found: $Source" "Yellow"
        return
    }
    
    $destPath = Join-Path $Destination (Split-Path $Source -Leaf)
    $action = if ($DryRun) { "Would move" } else { "Moving" }
    
    Write-Heady "$action $Description`: $Source → $destPath" "Cyan"
    
    if (-not $DryRun) {
        try {
            # Ensure destination directory exists
            if (-not (Test-DirectoryExists $Destination)) {
                New-Item -ItemType Directory -Path $Destination -Force | Out-Null
            }
            
            Move-Item -Path $Source -Destination $Destination -Force
            Write-Heady "✅ Moved: $Source" "Green"
        }
        catch {
            Write-Heady "❌ Failed to move $Source`: $($_.Exception.Message)" "Red"
        }
    }
}

function Initialize-HeadyDomains {
    Write-Heady "🏗️  Initializing Heady Sacred Geometry domains..." "Magenta"
    
    $domains = @(
        @{ Name = "HeadySystems"; Description = "Infrastructure & Deployment" },
        @{ Name = "HeadyConnection"; Description = "Application & Frontend" },
        @{ Name = "HeadyDirective"; Description = "Governance & Rules" }
    )
    
    foreach ($domain in $domains) {
        if (-not (Test-DirectoryExists $domain.Name)) {
            Write-Heady "Creating domain: $($domain.Name) - $($domain.Description)" "Cyan"
            if (-not $DryRun) {
                New-Item -ItemType Directory -Path $domain.Name -Force | Out-Null
            }
        } else {
            Write-Heady "Domain exists: $($domain.Name)" "Yellow"
        }
    }
}

function Move-InfrastructureFiles {
    Write-Heady "📦 Moving infrastructure files to HeadySystems..." "Cyan"
    
    $infraFiles = @(
        @{ Source = "render.yaml"; Desc = "Render deployment config" },
        @{ Source = "Dockerfile"; Desc = "Docker configuration" },
        @{ Source = "docker-compose.yml"; Desc = "Docker Compose config" },
        @{ Source = "mcp-compose.yaml"; Desc = "HeadyMCP Orchestration config" },
        @{ Source = "mcp-servers"; Desc = "HeadyMCP microservices" },
        @{ Source = ".devcontainer"; Desc = "DevContainer config" },
        @{ Source = ".github"; Desc = "GitHub workflows" },
        @{ Source = "infrastructure"; Desc = "Infrastructure scripts" },
        @{ Source = "deploy"; Desc = "Deployment scripts" },
        @{ Source = "start-heady-system.ps1"; Desc = "System startup script" },
        @{ Source = "stop-heady-system.ps1"; Desc = "System shutdown script" },
        @{ Source = "demo-heady-functionality.ps1"; Desc = "System demonstration script" }
    )
    
    foreach ($file in $infraFiles) {
        Move-HeadyItem -Source $file.Source -Destination "HeadySystems" -Description $file.Desc
    }
}

function Move-ApplicationFiles {
    Write-Heady "🔗 Moving application files to HeadyConnection..." "Cyan"
    
    $appFiles = @(
        @{ Source = "heady-manager.js"; Desc = "Main Application Entry Point" },
        @{ Source = "backend"; Desc = "Backend Service Layer" },
        @{ Source = "src"; Desc = "Source code" },
        @{ Source = "tailwind.config.js"; Desc = "Tailwind config" },
        @{ Source = "components"; Desc = "React components" },
        @{ Source = "pages"; Desc = "Page components" },
        @{ Source = "styles"; Desc = "Style files" }
    )
    
    foreach ($file in $appFiles) {
        Move-HeadyItem -Source $file.Source -Destination "HeadyConnection" -Description $file.Desc
    }
}

function Move-GovernanceFiles {
    Write-Heady "📋 Moving governance files to HeadyDirective..." "Cyan"
    
    # Move README.md
    Move-HeadyItem -Source "README.md" -Destination "HeadyDirective" -Description "Main documentation"
    
    # Move other documentation
    $docFiles = @(
        @{ Source = "docs"; Desc = "Documentation" },
        @{ Source = "CONTRIBUTING.md"; Desc = "Contributing guidelines" },
        @{ Source = "LICENSE"; Desc = "License file" },
        @{ Source = "CHANGELOG.md"; Desc = "Changelog" },
        @{ Source = "HEADY_CONTEXT.md"; Desc = "System Context & Master Protocol" },
        @{ Source = "SQUASH_MERGE_PLAN.md"; Desc = "Squash Merge Strategy" }
    )
    
    foreach ($file in $docFiles) {
        Move-HeadyItem -Source $file.Source -Destination "HeadyDirective" -Description $file.Desc
    }
    
    # Create .windsurfrules if it doesn't exist
    $rulesPath = "HeadyDirective\.windsurfrules"
    if (-not (Test-Path $rulesPath)) {
        Write-Heady "Creating .windsurfrules in HeadyDirective" "Magenta"
        if (-not $DryRun) {
            $rulesContent = @"
# Heady Directive: Context Persistence & Governance Rules
# Sacred Geometry Architecture Guidelines

## Core Principles
- Maintain cognitive interleaving between domains
- Preserve semantic relationships across boundaries
- Enable frictionless data flow between Systems, Connection, and Directive

## Domain Responsibilities
- HeadySystems: Infrastructure, deployment, and operational concerns
- HeadyConnection: User interface, API endpoints, and application logic  
- HeadyDirective: Governance, documentation, and architectural rules

## File Organization Rules
- Infrastructure configs belong in HeadySystems
- Application code belongs in HeadyConnection
- Documentation and rules belong in HeadyDirective
- Cross-domain references should use relative paths
"@
            Set-Content -Path $rulesPath -Value $rulesContent -Encoding UTF8
        }
    }
}

function Update-McpConfig {
    Write-Heady "🔧 Updating MCP configuration..." "Cyan"
    
    $mcpConfigPath = "mcp_config.json"
    if (Test-Path $mcpConfigPath) {
        Write-Heady "Found mcp_config.json, updating paths..." "Yellow"
        
        if (-not $DryRun) {
            try {
                $config = Get-Content $mcpConfigPath -Raw | ConvertFrom-Json
                
                # Update paths to reflect new structure
                if ($config.PSObject.Properties.Name -contains "servers") {
                    foreach ($server in $config.servers) {
                        if ($server.PSObject.Properties.Name -contains "args") {
                            for ($i = 0; $i -lt $server.args.Count; $i++) {
                                $server.args[$i] = $server.args[$i] -replace "^src/", "HeadyConnection/src/" -replace "^public/", "HeadyConnection/public/"
                            }
                        }
                    }
                }
                
                $config | ConvertTo-Json -Depth 10 | Set-Content $mcpConfigPath -Encoding UTF8
                Write-Heady "✅ Updated MCP configuration paths" "Green"
            }
            catch {
                Write-Heady "⚠️  Failed to update MCP config: $($_.Exception.Message)" "Yellow"
            }
        }
    } else {
        Write-Heady "No mcp_config.json found, skipping..." "Yellow"
    }
}

function Get-LocalBranches {
    $branches = git branch --format="%(refname:short)"
    return $branches -split "`n" | Where-Object { $_ -and $_ -ne "main" -and $_ -ne "master" }
}

function Merge-FeatureBranches {
    Write-Heady "🌿 Feature Branch Merge Manager" "Magenta"
    
    $branches = Get-LocalBranches
    
    if (-not $branches) {
        Write-Heady "No feature branches found to merge." "Yellow"
        return
    }
    
    Write-Heady "Available feature branches:" "Cyan"
    for ($i = 0; $i -lt $branches.Count; $i++) {
        Write-Host "  [$($i + 1)] $($branches[$i])"
    }
    
    if (-not $Force) {
        $selection = Read-Host "`nEnter branch number to merge (or press Enter to skip)"
        if (-not $selection -or $selection -notmatch '^\d+$' -or [int]$selection -lt 1 -or [int]$selection -gt $branches.Count) {
            Write-Heady "Skipping branch merge." "Yellow"
            return
        }
        
        $selectedBranch = $branches[[int]$selection - 1]
    } else {
        $selectedBranch = $branches[0]
        Write-Heady "Auto-selecting first branch: $selectedBranch" "Yellow"
    }
    
    Write-Heady "Merging branch: $selectedBranch" "Cyan"
    
    if (-not $DryRun) {
        try {
            # Ensure we're on main branch
            git checkout main
            git pull origin main
            
            # Squash merge
            git merge --squash $selectedBranch
            
            Write-Heady "Branch staged for squash merge. Please provide a semantic commit message." "Green"
            Write-Heady "Examples: 'feat: Integrated Cognitive Interleaving', 'fix: Resolved domain boundary issues'" "Cyan"
            
            $commitMessage = Read-Host "Enter commit message"
            if ($commitMessage) {
                git commit -m $commitMessage
                Write-Heady "✅ Squash merge completed: $commitMessage" "Green"
                
                # Optionally delete the merged branch
                $deleteBranch = Read-Host "Delete merged branch '$selectedBranch'? (y/N)"
                if ($deleteBranch -match '^[Yy]') {
                    git branch -D $selectedBranch
                    Write-Heady "🗑️  Deleted branch: $selectedBranch" "Yellow"
                }
            } else {
                Write-Heady "⚠️  Merge staged but not committed. Run 'git commit' to complete." "Yellow"
            }
        }
        catch {
            Write-Heady "❌ Merge failed: $($_.Exception.Message)" "Red"
            Write-Heady "You may need to resolve conflicts manually." "Yellow"
        }
    }
}

function Initialize-CognitiveInterleaving {
    Write-Heady "🧠 Scaffolding Cognitive Interleaving..." "Magenta"
    
    # Create TODO.md in HeadySystems with Fibonacci-prioritized tasks
    $todoPath = "HeadySystems\TODO.md"
    if (-not (Test-Path $todoPath)) {
        Write-Heady "Creating TODO.md with Fibonacci prioritization..." "Cyan"
        
        if (-not $DryRun) {
            $todoContent = @"
# Heady Systems - Cognitive Interleaving Tasks

## Fibonacci Priority Scale
- 1: Quick wins, minimal effort
- 2: Low effort, clear value  
- 3: Medium effort, moderate value
- 5: Significant effort, high value
- 8: Major effort, critical value
- 13: Epic effort, transformative value

## Current Sprint

### Priority 8 - Critical Infrastructure
- [ ] Implement domain boundary validation
- [ ] Set up cross-domain communication protocols
- [ ] Configure automated deployment pipeline

### Priority 5 - High Value Features  
- [ ] Create domain-specific health checks
- [ ] Implement semantic logging across domains
- [ ] Set up monitoring and alerting

### Priority 3 - Medium Effort
- [ ] Document API contracts between domains
- [ ] Create domain testing strategies
- [ ] Implement configuration management

### Priority 2 - Quick Wins
- [ ] Add domain markers to README files
- [ ] Create domain-specific .gitignore files
- [ ] Set up domain-specific linting rules

### Priority 1 - Immediate
- [ ] Verify all files moved correctly
- [ ] Test basic functionality across domains
- [ ] Update documentation with new structure

## Backlog
- [ ] Implement domain-specific CI/CD workflows
- [ ] Create domain migration scripts
- [ ] Set up domain-level monitoring dashboards
"@
            Set-Content -Path $todoPath -Value $todoContent -Encoding UTF8
        }
    }
    
    # Create placeholder MCP type definitions
    $mcpTypesPath = "HeadyConnection\src\types\mcp.d.ts"
    $mcpTypesDir = Split-Path $mcpTypesPath -Parent
    
    if (-not (Test-DirectoryExists $mcpTypesDir)) {
        if (-not $DryRun) {
            New-Item -ItemType Directory -Path $mcpTypesDir -Force | Out-Null
        }
    }
    
    if (-not (Test-Path $mcpTypesPath)) {
        Write-Heady "Creating MCP type definitions..." "Cyan"
        
        if (-not $DryRun) {
            $mcpTypesContent = @"
// Model Context Protocol Type Definitions
// Heady Connection Domain

export interface MCPRequest {
  id: string;
  method: string;
  params?: Record<string, any>;
  timestamp: number;
}

export interface MCPResponse {
  id: string;
  result?: any;
  error?: MCPError;
  timestamp: number;
}

export interface MCPError {
  code: number;
  message: string;
  data?: any;
}

export interface MCPServer {
  name: string;
  version: string;
  capabilities: string[];
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

// Heady-specific MCP extensions
export interface HeadyDomainConfig {
  domain: 'HeadySystems' | 'HeadyConnection' | 'HeadyDirective';
  capabilities: string[];
  resources: MCPResource[];
  tools: MCPTool[];
}

export interface HeadyCognitiveFlow {
  domains: HeadyDomainConfig[];
  interleavingStrategy: 'sequential' | 'parallel' | 'adaptive';
  persistenceEnabled: boolean;
}
"@
            Set-Content -Path $mcpTypesPath -Value $mcpTypesContent -Encoding UTF8
        }
    }
}

function Show-HeadyStructure {
    Write-Heady "🌳 Heady Ecosystem Structure:" "Green"
    
    $structure = @"
Heady/
├── HeadySystems/           # Infrastructure & Deployment
│   ├── render.yaml
│   ├── Dockerfile
│   ├── .github/
│   └── TODO.md
├── HeadyConnection/        # Application & Frontend  
│   ├── src/
│   │   └── types/
│   │       └── mcp.d.ts
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
├── HeadyDirective/         # Governance & Rules
│   ├── README.md
│   ├── .windsurfrules
│   └── docs/
└── .git/
"@
    
    Write-Host $structure -ForegroundColor $Colors.White
}

# Main execution
function Main {
    Write-Heady "🚀 Build-HeadyEcosystem.ps1 - Sacred Architecture Integration" "Magenta"
    Write-Heady "===========================================================" "Magenta"
    
    if ($DryRun) {
        Write-Heady "🔍 DRY RUN MODE - No changes will be made" "Yellow"
    }
    
    # Safety checks
    if (-not (Test-GitRepository)) {
        exit 1
    }
    
    if (-not $Force -and -not $DryRun) {
        Write-Heady "`n⚠️  This will restructure your entire repository." "Yellow"
        Write-Heady "Files will be moved into Heady domains." "Yellow"
        $confirm = Read-Host "Continue? (y/N)"
        if ($confirm -notmatch '^[Yy]') {
            Write-Heady "Operation cancelled." "Red"
            exit 0
        }
    }
    
    try {
        # Initialize domains
        Initialize-HeadyDomains
        
        # Move files to appropriate domains
        Move-InfrastructureFiles
        Move-ApplicationFiles  
        Move-GovernanceFiles
        
        # Update configurations
        Update-McpConfig
        
        # Branch merging (optional)
        if (-not $DryRun) {
            if ($Force) {
                Write-Heady "Skipping branch merge prompt due to -Force." "Yellow"
            } else {
                $mergeBranches = Read-Host "`nMerge feature branches? (y/N)"
                if ($mergeBranches -match '^[Yy]') {
                    Merge-FeatureBranches
                }
            }
        }
        
        # Initialize cognitive interleaving
        Initialize-CognitiveInterleaving
        
        # Show final structure
        Show-HeadyStructure
        
        Write-Heady "`n✅ Heady Ecosystem Integration Complete!" "Green"
        Write-Heady "Your repository now follows the Sacred Geometry architecture." "Magenta"
        
        if ($DryRun) {
            Write-Heady "Run without -DryRun to execute these changes." "Yellow"
        } else {
            Write-Heady "Review the changes and commit them when ready." "Cyan"
        }
    }
    catch {
        Write-Heady "❌ Critical error during integration: $($_.Exception.Message)" "Red"
        exit 1
    }
}

# Run the script
Main
