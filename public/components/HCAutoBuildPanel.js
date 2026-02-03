/**
 * HCAutoBuild Panel Component
 * Real-time build orchestration UI for Heady Admin
 */

const { useState, useEffect } = React;

function HCAutoBuildPanel({ showToast }) {
    const [buildStatus, setBuildStatus] = useState(null);
    const [buildHistory, setBuildHistory] = useState([]);
    const [isBuilding, setIsBuilding] = useState(false);
    const [selectedPhases, setSelectedPhases] = useState(['analyze', 'extract', 'merge', 'test', 'deploy']);
    const [buildMode, setBuildMode] = useState('auto');
    const [dryRun, setDryRun] = useState(false);
    const [verbose, setVerbose] = useState(false);
    const [currentPhase, setCurrentPhase] = useState(null);
    const [phaseProgress, setPhaseProgress] = useState({});

    // Fetch build status on mount and periodically
    useEffect(() => {
        fetchBuildStatus();
        const interval = setInterval(fetchBuildStatus, 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchBuildStatus = async () => {
        try {
            const response = await fetch('/api/mcp/call', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-heady-api-key': localStorage.getItem('heady_api_key')
                },
                body: JSON.stringify({
                    server: 'heady-autobuild',
                    tool: 'hc_autobuild_status',
                    args: { includeHistory: true }
                })
            });

            const data = await response.json();
            if (data.ok && data.result) {
                const result = JSON.parse(data.result.content[0].text);
                setBuildStatus(result.status);
                if (result.status.history) {
                    setBuildHistory(result.status.history);
                }
                
                // Update current phase if building
                if (result.status.autobuildState?.status === 'running') {
                    setIsBuilding(true);
                    setCurrentPhase(result.status.buildConfig?.currentPhase);
                    setPhaseProgress(result.status.buildConfig?.phaseResults || {});
                } else {
                    setIsBuilding(false);
                }
            }
        } catch (error) {
            console.error('Failed to fetch build status:', error);
        }
    };

    const executeBuild = async () => {
        if (isBuilding) {
            showToast('Build already in progress', 'warning');
            return;
        }

        setIsBuilding(true);
        showToast('Starting HCAutoBuild...', 'info');

        try {
            const response = await fetch('/api/mcp/call', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-heady-api-key': localStorage.getItem('heady_api_key')
                },
                body: JSON.stringify({
                    server: 'heady-autobuild',
                    tool: 'hc_autobuild_execute',
                    args: {
                        mode: buildMode,
                        phases: selectedPhases,
                        dryRun,
                        verbose
                    }
                })
            });

            const data = await response.json();
            if (data.ok) {
                const result = JSON.parse(data.result.content[0].text);
                showToast(`Build completed: ${result.buildId}`, 'success');
                fetchBuildStatus();
            } else {
                showToast('Build failed', 'error');
            }
        } catch (error) {
            showToast(`Build error: ${error.message}`, 'error');
        } finally {
            setIsBuilding(false);
        }
    };

    const executePhase = async (phase) => {
        showToast(`Executing ${phase} phase...`, 'info');

        try {
            const response = await fetch('/api/mcp/call', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-heady-api-key': localStorage.getItem('heady_api_key')
                },
                body: JSON.stringify({
                    server: 'heady-autobuild',
                    tool: `hc_autobuild_${phase}`,
                    args: {}
                })
            });

            const data = await response.json();
            if (data.ok) {
                showToast(`${phase} phase completed`, 'success');
                fetchBuildStatus();
            }
        } catch (error) {
            showToast(`${phase} phase failed: ${error.message}`, 'error');
        }
    };

    const generateCheckpoint = async () => {
        try {
            const response = await fetch('/api/mcp/call', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-heady-api-key': localStorage.getItem('heady_api_key')
                },
                body: JSON.stringify({
                    server: 'heady-autobuild',
                    tool: 'hc_autobuild_checkpoint',
                    args: { stage: 'manual' }
                })
            });

            const data = await response.json();
            if (data.ok) {
                showToast('Checkpoint generated', 'success');
            }
        } catch (error) {
            showToast(`Checkpoint failed: ${error.message}`, 'error');
        }
    };

    const togglePhase = (phase) => {
        setSelectedPhases(prev => 
            prev.includes(phase) 
                ? prev.filter(p => p !== phase)
                : [...prev, phase]
        );
    };

    const getPhaseStatus = (phase) => {
        if (!phaseProgress[phase]) return 'pending';
        return phaseProgress[phase].status;
    };

    const getPhaseIcon = (status) => {
        switch (status) {
            case 'success': return '✓';
            case 'failed': return '✗';
            case 'running': return '⟳';
            default: return '○';
        }
    };

    const getPhaseColor = (status) => {
        switch (status) {
            case 'success': return 'var(--success)';
            case 'failed': return 'var(--error)';
            case 'running': return 'var(--warning)';
            default: return 'var(--text-secondary)';
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ marginBottom: '10px', color: 'var(--primary)' }}>
                    🏗️ HCAutoBuild - Automated Build Orchestration
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Intelligent multi-repository build system with squash merge, testing, and deployment
                </p>
            </div>

            {/* Build Configuration */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Build Configuration</h3>
                
                <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
                    <div className="form-group">
                        <label>Build Mode</label>
                        <select value={buildMode} onChange={(e) => setBuildMode(e.target.value)}>
                            <option value="auto">Auto</option>
                            <option value="manual">Manual</option>
                            <option value="hybrid">Hybrid</option>
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label>
                            <input 
                                type="checkbox" 
                                checked={dryRun} 
                                onChange={(e) => setDryRun(e.target.checked)}
                                style={{ width: 'auto', marginRight: '8px' }}
                            />
                            Dry Run (Preview Only)
                        </label>
                    </div>
                    
                    <div className="form-group">
                        <label>
                            <input 
                                type="checkbox" 
                                checked={verbose} 
                                onChange={(e) => setVerbose(e.target.checked)}
                                style={{ width: 'auto', marginRight: '8px' }}
                            />
                            Verbose Logging
                        </label>
                    </div>
                </div>

                {/* Phase Selection */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>
                        Build Phases
                    </label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {['analyze', 'extract', 'merge', 'test', 'deploy'].map(phase => (
                            <button
                                key={phase}
                                onClick={() => togglePhase(phase)}
                                style={{
                                    padding: '8px 16px',
                                    background: selectedPhases.includes(phase) ? 'var(--primary)' : 'var(--bg-light)',
                                    color: selectedPhases.includes(phase) ? 'white' : 'var(--text-secondary)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <span style={{ color: getPhaseColor(getPhaseStatus(phase)) }}>
                                    {getPhaseIcon(getPhaseStatus(phase))}
                                </span>
                                {' '}
                                {phase.charAt(0).toUpperCase() + phase.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button 
                        className="btn btn-success" 
                        onClick={executeBuild}
                        disabled={isBuilding || selectedPhases.length === 0}
                        style={{ opacity: (isBuilding || selectedPhases.length === 0) ? 0.5 : 1 }}
                    >
                        {isBuilding ? '⟳ Building...' : '▶ Execute Build'}
                    </button>
                    
                    <button className="btn btn-secondary" onClick={() => executePhase('analyze')}>
                        🔍 Analyze Only
                    </button>
                    
                    <button className="btn btn-secondary" onClick={() => executePhase('merge')}>
                        🔀 Merge Only
                    </button>
                    
                    <button className="btn btn-secondary" onClick={generateCheckpoint}>
                        📸 Generate Checkpoint
                    </button>
                    
                    <button className="btn btn-secondary" onClick={fetchBuildStatus}>
                        🔄 Refresh Status
                    </button>
                </div>
            </div>

            {/* Current Build Status */}
            {buildStatus?.currentBuild && (
                <div className="card" style={{ marginBottom: '20px' }}>
                    <h3 style={{ marginBottom: '15px' }}>Current Build</h3>
                    
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                        <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '5px' }}>
                                Build ID
                            </div>
                            <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                                {buildStatus.currentBuild.id}
                            </div>
                        </div>
                        
                        <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '5px' }}>
                                Status
                            </div>
                            <div style={{ 
                                color: buildStatus.currentBuild.status === 'completed' ? 'var(--success)' :
                                       buildStatus.currentBuild.status === 'failed' ? 'var(--error)' :
                                       buildStatus.currentBuild.status === 'running' ? 'var(--warning)' :
                                       'var(--text-secondary)',
                                fontWeight: '500'
                            }}>
                                {buildStatus.currentBuild.status?.toUpperCase()}
                            </div>
                        </div>
                        
                        <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '5px' }}>
                                Current Phase
                            </div>
                            <div style={{ fontWeight: '500' }}>
                                {currentPhase || 'N/A'}
                            </div>
                        </div>
                        
                        <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '5px' }}>
                                Duration
                            </div>
                            <div style={{ fontFamily: 'monospace' }}>
                                {buildStatus.currentBuild.endTime 
                                    ? `${Math.round((new Date(buildStatus.currentBuild.endTime) - new Date(buildStatus.currentBuild.startTime)) / 1000)}s`
                                    : 'In progress...'}
                            </div>
                        </div>
                    </div>

                    {/* Phase Progress */}
                    {Object.keys(phaseProgress).length > 0 && (
                        <div style={{ marginTop: '20px' }}>
                            <h4 style={{ marginBottom: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                Phase Progress
                            </h4>
                            {Object.entries(phaseProgress).map(([phase, result]) => (
                                <div key={phase} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '8px',
                                    marginBottom: '5px',
                                    background: 'var(--bg-dark)',
                                    borderRadius: '6px'
                                }}>
                                    <span style={{ 
                                        color: getPhaseColor(result.status),
                                        marginRight: '10px',
                                        fontSize: '16px'
                                    }}>
                                        {getPhaseIcon(result.status)}
                                    </span>
                                    <span style={{ flex: 1, textTransform: 'capitalize' }}>
                                        {phase}
                                    </span>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                                        {result.duration ? `${result.duration}ms` : ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Build Summary */}
                    {buildStatus.currentBuild.summary && (
                        <div style={{ marginTop: '20px', padding: '15px', background: 'var(--bg-dark)', borderRadius: '8px' }}>
                            <h4 style={{ marginBottom: '10px', fontSize: '14px' }}>Build Summary</h4>
                            <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                <div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Status</div>
                                    <div style={{ fontWeight: '500' }}>{buildStatus.currentBuild.summary.status}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Phases</div>
                                    <div style={{ fontWeight: '500' }}>{buildStatus.currentBuild.summary.phases}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Errors</div>
                                    <div style={{ fontWeight: '500', color: buildStatus.currentBuild.summary.errors > 0 ? 'var(--error)' : 'var(--success)' }}>
                                        {buildStatus.currentBuild.summary.errors}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Build History */}
            <div className="card">
                <h3 style={{ marginBottom: '15px' }}>Build History</h3>
                
                {buildHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                        No build history available
                    </div>
                ) : (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {buildHistory.slice().reverse().map((build, index) => (
                            <div key={build.id} style={{
                                padding: '15px',
                                marginBottom: '10px',
                                background: 'var(--bg-dark)',
                                borderRadius: '8px',
                                borderLeft: `4px solid ${
                                    build.status === 'completed' ? 'var(--success)' :
                                    build.status === 'failed' ? 'var(--error)' :
                                    'var(--warning)'
                                }`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <div style={{ fontWeight: '500' }}>
                                        Build #{buildHistory.length - index}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        {new Date(build.startTime).toLocaleString()}
                                    </div>
                                </div>
                                
                                <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', fontSize: '13px' }}>
                                    <div>
                                        <span style={{ color: 'var(--text-secondary)' }}>ID: </span>
                                        <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                                            {build.id.substring(0, 16)}...
                                        </span>
                                    </div>
                                    <div>
                                        <span style={{ color: 'var(--text-secondary)' }}>Status: </span>
                                        <span style={{ 
                                            color: build.status === 'completed' ? 'var(--success)' :
                                                   build.status === 'failed' ? 'var(--error)' :
                                                   'var(--warning)',
                                            fontWeight: '500'
                                        }}>
                                            {build.status}
                                        </span>
                                    </div>
                                    <div>
                                        <span style={{ color: 'var(--text-secondary)' }}>Duration: </span>
                                        <span>
                                            {build.endTime 
                                                ? `${Math.round((new Date(build.endTime) - new Date(build.startTime)) / 1000)}s`
                                                : 'N/A'}
                                        </span>
                                    </div>
                                    <div>
                                        <span style={{ color: 'var(--text-secondary)' }}>Phases: </span>
                                        <span>{build.summary?.phases || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="card" style={{ marginTop: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Quick Actions</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" onClick={() => executePhase('analyze')}>
                        🔍 Analyze Repositories
                    </button>
                    <button className="btn btn-secondary" onClick={() => executePhase('merge')}>
                        🔀 Intelligent Merge
                    </button>
                    <button className="btn btn-secondary" onClick={() => executePhase('test')}>
                        🧪 Run Tests
                    </button>
                    <button className="btn btn-secondary" onClick={() => executePhase('deploy')}>
                        🚀 Deploy
                    </button>
                </div>
            </div>
        </div>
    );
}
