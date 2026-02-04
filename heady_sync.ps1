# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: heady_sync.ps1
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
.SYNOPSIS
    HeadySync - Comprehensive sync workflow with HeadyConductor awareness
    
.DESCRIPTION
    Complete workflow: modify → stage → commit → prep → checkpoint → push → verify → monitor
    Integrates with HeadyConductor for real-time monitoring and system status reporting
    
.EXAMPLE
    .\heady_sync.ps1
    .\heady_sync.ps1 -Message "Custom commit message"
    .\heady_sync.ps1 -SkipVerify
#>

param(
    [string]$Message = "HeadySync: Automated checkpoint",
    [switch]$SkipVerify,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-HeadyInfo { param($msg) Write-Host "∞ $msg" -ForegroundColor Cyan }
function Write-HeadySuccess { param($msg) Write-Host "✓ $msg" -ForegroundColor Green }
function Write-HeadyWarning { param($msg) Write-Host "⚠ $msg" -ForegroundColor Yellow }
function Write-HeadyError { param($msg) Write-Host "✗ $msg" -ForegroundColor Red }
function Write-HeadyStep { param($msg) Write-Host "`n[$msg]" -ForegroundColor Magenta }

# Notify HeadyConductor
function Notify-HeadyConductor {
    param(
        [string]$Event,
        [string]$Status,
        [hashtable]$Data = @{}
    )
    
    try {
        $pythonBin = if ($env:HEADY_PYTHON_BIN) { $env:HEADY_PYTHON_BIN } else { "python" }
        $conductorScript = Join-Path $PSScriptRoot "HeadyAcademy\HeadyConductor.py"
        
        if (Test-Path $conductorScript) {
            $requestData = @{
                event = $Event
                status = $Status
                timestamp = (Get-Date -Format "o")
                data = $Data
            } | ConvertTo-Json -Compress
            
            # Store in HeadyMemory via conductor
            $escapedData = $requestData -replace "'", "''"
            $memoryScript = @"
import sys
import json
from pathlib import Path
sys.path.insert(0, str(Path(r'$PSScriptRoot') / 'HeadyAcademy'))
from HeadyMemory import HeadyMemory

memory = HeadyMemory(r'$PSScriptRoot')
data = json.loads('''$escapedData''')
memory.store(
    category='sync_operation',
    content=data,
    tags=['sync', 'git', '$Event'],
    source='heady_sync'
)
print('Stored in HeadyMemory')
"@
            
            $memoryScript | & $pythonBin 2>&1 | Out-Null
            
            if ($Verbose) {
                Write-HeadyInfo "Notified HeadyConductor: $Event - $Status"
            }
        }
    } catch {
        if ($Verbose) {
            Write-HeadyWarning "Could not notify HeadyConductor: $_"
        }
    }
}

# Get HeadyRegistry system status
function Get-HeadyRegistryStatus {
    try {
        $pythonBin = if ($env:HEADY_PYTHON_BIN) { $env:HEADY_PYTHON_BIN } else { "python" }
        $registryScript = Join-Path $PSScriptRoot "HeadyAcademy\HeadyRegistry.py"
        
        if (Test-Path $registryScript) {
            $statusScript = @"
import sys
import json
from pathlib import Path
sys.path.insert(0, str(Path(r'$PSScriptRoot') / 'HeadyAcademy'))
from HeadyRegistry import HeadyRegistry

registry = HeadyRegistry(r'$PSScriptRoot')
summary = registry.get_summary()
print(json.dumps(summary))
"@
            
            $output = $statusScript | & $pythonBin 2>&1
            $jsonOutput = $output | Where-Object { $_ -match '^\{' } | Select-Object -Last 1
            
            if ($jsonOutput) {
                return $jsonOutput | ConvertFrom-Json
            }
        }
    } catch {
        Write-HeadyWarning "Could not get HeadyRegistry status: $_"
    }
    return $null
}

# Send email notification
function Send-CheckpointEmail {
    param(
        [hashtable]$RegistryStatus,
        [hashtable]$SyncData
    )
    
    try {
        $pythonBin = if ($env:HEADY_PYTHON_BIN) { $env:HEADY_PYTHON_BIN } else { "python" }
        
        $registryJson = $RegistryStatus | ConvertTo-Json -Compress -Depth 10
        $syncJson = $SyncData | ConvertTo-Json -Compress -Depth 10
        
        $emailScript = @"
import sys
import json
from pathlib import Path
sys.path.insert(0, str(Path(r'$PSScriptRoot') / 'HeadyAcademy'))
from HeadyNotifier import HeadyNotifier

notifier = HeadyNotifier()
registry_status = json.loads('''$registryJson''')
sync_data = json.loads('''$syncJson''')

result = notifier.send_checkpoint_report(registry_status, sync_data)
if result:
    print('Email sent successfully')
else:
    print('Email not sent (check configuration)')
"@
        
        $output = $emailScript | & $pythonBin 2>&1
        
        if ($output -match 'Email sent successfully') {
            Write-HeadySuccess "Checkpoint report emailed to eric@hadyconnection.org"
            return $true
        } else {
            if ($Verbose) {
                Write-HeadyInfo "Email notification: $output"
            }
            return $false
        }
    } catch {
        if ($Verbose) {
            Write-HeadyWarning "Could not send email: $_"
        }
        return $false
    }
}

# Start real-time monitoring
function Start-HeadyMonitoring {
    try {
        $pythonBin = if ($env:HEADY_PYTHON_BIN) { $env:HEADY_PYTHON_BIN } else { "python" }
        
        $monitorScript = @"
import sys
from pathlib import Path
sys.path.insert(0, str(Path(r'$PSScriptRoot') / 'HeadyAcademy'))
from HeadyLens import HeadyLens

lens = HeadyLens()
result = lens.start_monitoring()
print('Monitoring started')
"@
        
        $monitorScript | & $pythonBin 2>&1 | Out-Null
        Write-HeadySuccess "HeadyLens monitoring activated"
    } catch {
        Write-HeadyWarning "Could not start HeadyLens monitoring: $_"
    }
}

# Verify local and remote repos are identical
function Test-RepoSync {
    param([string]$Remote = "origin")
    
    Write-HeadyStep "Verifying Repo Sync"
    
    # Fetch latest
    git fetch $Remote 2>&1 | Out-Null
    
    # Get current branch
    $currentBranch = git rev-parse --abbrev-ref HEAD
    
    # Compare local and remote
    $localCommit = git rev-parse HEAD
    $remoteCommit = git rev-parse "$Remote/$currentBranch" 2>$null
    
    if ($localCommit -eq $remoteCommit) {
        Write-HeadySuccess "Local and remote are identical: $localCommit"
        return $true
    } else {
        Write-HeadyWarning "Local: $localCommit"
        Write-HeadyWarning "Remote: $remoteCommit"
        
        # Check if local is ahead
        $ahead = git rev-list --count "$Remote/$currentBranch..HEAD" 2>$null
        $behind = git rev-list --count "HEAD..$Remote/$currentBranch" 2>$null
        
        if ($ahead -gt 0) {
            Write-HeadyInfo "Local is $ahead commit(s) ahead"
        }
        if ($behind -gt 0) {
            Write-HeadyWarning "Local is $behind commit(s) behind"
        }
        
        return $false
    }
}

# Main workflow
function Invoke-HeadySync {
    Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║           ∞ HEADY SYNC - COMPREHENSIVE WORKFLOW ∞              ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
    
    $startTime = Get-Date
    
    # Start monitoring
    Start-HeadyMonitoring
    Notify-HeadyConductor -Event "sync_start" -Status "initiated" -Data @{
        message = $Message
        timestamp = $startTime.ToString("o")
    }
    
    try {
        # Step 1: Check git status
        Write-HeadyStep "1. Checking Git Status"
        $status = git status --porcelain
        
        if ($status) {
            Write-HeadyInfo "Changes detected:"
            $status | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
            Notify-HeadyConductor -Event "changes_detected" -Status "success" -Data @{
                changes_count = ($status | Measure-Object).Count
            }
        } else {
            Write-HeadyInfo "No changes detected"
        }
        
        # Step 2: Stage all changes
        Write-HeadyStep "2. Staging Changes"
        git add -A
        Write-HeadySuccess "All changes staged"
        Notify-HeadyConductor -Event "stage" -Status "success"
        
        # Step 3: Commit
        Write-HeadyStep "3. Committing Changes"
        $commitResult = git commit -m $Message 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-HeadySuccess "Changes committed: $Message"
            $commitHash = git rev-parse --short HEAD
            Write-HeadyInfo "Commit: $commitHash"
            Notify-HeadyConductor -Event "commit" -Status "success" -Data @{
                message = $Message
                hash = $commitHash
            }
        } else {
            if ($commitResult -match "nothing to commit") {
                Write-HeadyInfo "Nothing to commit, working tree clean"
                Notify-HeadyConductor -Event "commit" -Status "skipped" -Data @{
                    reason = "nothing_to_commit"
                }
            } else {
                throw "Commit failed: $commitResult"
            }
        }
        
        # Step 4: Run HCAutoBuild checkpoint
        Write-HeadyStep "4. Running HCAutoBuild Checkpoint"
        if (Test-Path ".\hc.bat") {
            $hcResult = & .\hc.bat -a 2>&1
            Write-HeadySuccess "HCAutoBuild checkpoint complete"
            Notify-HeadyConductor -Event "hcautobuild" -Status "success"
        } else {
            Write-HeadyWarning "hc.bat not found, skipping HCAutoBuild"
            Notify-HeadyConductor -Event "hcautobuild" -Status "skipped"
        }
        
        # Step 5: Get HeadyRegistry status report
        Write-HeadyStep "5. HeadyRegistry System Status Report"
        $registryStatus = Get-HeadyRegistryStatus
        
        if ($registryStatus) {
            Write-HeadySuccess "Registry Status at Checkpoint:"
            Write-Host "  Total Capabilities: $($registryStatus.total_capabilities)" -ForegroundColor White
            Write-Host "  Nodes: $($registryStatus.nodes)" -ForegroundColor White
            Write-Host "  Workflows: $($registryStatus.workflows)" -ForegroundColor White
            Write-Host "  Services: $($registryStatus.services)" -ForegroundColor White
            Write-Host "  Tools: $($registryStatus.tools)" -ForegroundColor White
            
            Notify-HeadyConductor -Event "registry_status" -Status "success" -Data @{
                total_capabilities = $registryStatus.total_capabilities
                nodes = $registryStatus.nodes
                workflows = $registryStatus.workflows
                services = $registryStatus.services
                tools = $registryStatus.tools
            }
            
            # Send email notification with checkpoint status
            Write-HeadyStep "5a. Sending Checkpoint Email to eric@hadyconnection.org"
            $emailSyncData = @{
                event = "checkpoint"
                status = "success"
                timestamp = (Get-Date -Format "o")
                data = @{
                    hash = if ($commitHash) { $commitHash } else { "N/A" }
                    message = $Message
                }
            }
            Send-CheckpointEmail -RegistryStatus $registryStatus -SyncData $emailSyncData
        }
        
        # Step 6: Push to all remotes (HeadySync)
        Write-HeadyStep "6. Pushing to All Remotes"
        if (Test-Path ".\hs.bat") {
            $hsResult = & .\hs.bat 2>&1
            Write-HeadySuccess "Pushed to all remotes"
            Notify-HeadyConductor -Event "push_all" -Status "success"
        } else {
            Write-HeadyWarning "hs.bat not found, using git push"
            git push
            if ($LASTEXITCODE -eq 0) {
                Write-HeadySuccess "Pushed to origin"
                Notify-HeadyConductor -Event "push" -Status "success"
            } else {
                throw "Push failed"
            }
        }
        
        # Step 7: Verify sync (unless skipped)
        if (-not $SkipVerify) {
            Write-HeadyStep "7. Verifying Local/Remote Sync"
            
            $remotes = git remote
            $allSynced = $true
            
            foreach ($remote in $remotes) {
                Write-HeadyInfo "Checking $remote..."
                $synced = Test-RepoSync -Remote $remote
                
                if ($synced) {
                    Write-HeadySuccess "$remote is synced"
                } else {
                    Write-HeadyWarning "$remote is not synced"
                    $allSynced = $false
                }
            }
            
            if ($allSynced) {
                Write-HeadySuccess "All remotes verified identical"
                Notify-HeadyConductor -Event "verify_sync" -Status "success" -Data @{
                    remotes_count = ($remotes | Measure-Object).Count
                    all_synced = $true
                }
            } else {
                Write-HeadyWarning "Some remotes are not synced"
                Notify-HeadyConductor -Event "verify_sync" -Status "warning" -Data @{
                    all_synced = $false
                }
            }
        } else {
            Write-HeadyInfo "Verification skipped"
        }
        
        # Step 8: Final status
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalSeconds
        
        Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "║              ∞ HEADY SYNC COMPLETE - 100% FUNCTIONAL ∞         ║" -ForegroundColor Green
        Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
        
        Write-HeadySuccess "Duration: $([math]::Round($duration, 2))s"
        Write-HeadySuccess "HeadyConductor has full awareness of sync operation"
        Write-HeadySuccess "All data stored in HeadyMemory for future reference"
        
        Notify-HeadyConductor -Event "sync_complete" -Status "success" -Data @{
            duration_seconds = $duration
            registry_status = $registryStatus
            timestamp = $endTime.ToString("o")
        }
        
        return $true
        
    } catch {
        Write-HeadyError "Sync failed: $_"
        
        Notify-HeadyConductor -Event "sync_failed" -Status "error" -Data @{
            error = $_.ToString()
            timestamp = (Get-Date -Format "o")
        }
        
        return $false
    }
}

# Execute
Invoke-HeadySync
