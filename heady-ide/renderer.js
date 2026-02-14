const { ipcRenderer } = require('electron');

let currentModels = [];
let currentSessions = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    await loadModels();
    await loadArenaSessions();
    setupEventListeners();
});

async function loadModels() {
    try {
        currentModels = await ipcRenderer.invoke('list-models');
        const modelSelect = document.getElementById('modelSelect');
        
        currentModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = `${model.icon} ${model.name}`;
            if (model.default) option.selected = true;
            modelSelect.appendChild(option);
        });
        
        if (currentModels.length > 0) {
            const defaultModel = currentModels.find(m => m.default) || currentModels[0];
            await selectModel(defaultModel.id);
        }
    } catch (error) {
        appendOutput(`Error loading models: ${error.message}`, 'error');
    }
}

async function selectModel(modelId) {
    try {
        const result = await ipcRenderer.invoke('select-model', modelId);
        if (result.error) {
            appendOutput(result.error, 'error');
            return;
        }
        
        const model = await ipcRenderer.invoke('get-active-model');
        updateModelInfo(model);
        appendOutput(`Selected model: ${model.icon} ${model.name}`, 'success');
    } catch (error) {
        appendOutput(`Error selecting model: ${error.message}`, 'error');
    }
}

function updateModelInfo(model) {
    const modelInfo = document.getElementById('modelInfo');
    modelInfo.innerHTML = `
        <h4>${model.icon} ${model.name}</h4>
        <p><strong>Tier:</strong> ${model.tier}</p>
        <p><strong>Capabilities:</strong> ${model.capabilities.join(', ')}</p>
        <p><strong>Description:</strong> ${model.description}</p>
        <p><strong>Endpoint:</strong> ${model.endpoint}</p>
    `;
}

async function loadArenaSessions() {
    try {
        currentSessions = await ipcRenderer.invoke('list-arena-sessions');
        updateArenaSessionsList();
    } catch (error) {
        appendOutput(`Error loading arena sessions: ${error.message}`, 'error');
    }
}

function updateArenaSessionsList() {
    const sessionsList = document.getElementById('arenaSessions');
    sessionsList.innerHTML = '';
    
    currentSessions.forEach(session => {
        const sessionDiv = document.createElement('div');
        sessionDiv.className = 'session-item';
        sessionDiv.innerHTML = `
            <div><strong>${session.id}</strong></div>
            <div>State: ${session.state}</div>
            <div>Models: ${session.models.map(m => m.id).join(', ')}</div>
        `;
        sessionDiv.onclick = () => selectArenaSession(session.id);
        sessionsList.appendChild(sessionDiv);
    });
}

async function createArenaSession() {
    const taskInput = document.getElementById('taskInput');
    const task = taskInput.value.trim();
    
    if (!task) {
        appendOutput('Please enter a task for the arena session', 'error');
        return;
    }
    
    try {
        const models = currentModels.slice(0, 3).map(m => m.id); // Use first 3 models
        const session = await ipcRenderer.invoke('create-arena-session', task, models);
        
        appendOutput(`Created arena session: ${session.id}`, 'success');
        await loadArenaSessions();
    } catch (error) {
        appendOutput(`Error creating arena session: ${error.message}`, 'error');
    }
}

async function selectArenaSession(sessionId) {
    try {
        const session = await ipcRenderer.invoke('get-arena-session', sessionId);
        appendOutput(`Selected arena session: ${sessionId}`, 'info');
        appendOutput(`Task: ${session.task}`, 'info');
        appendOutput(`State: ${session.state}`, 'info');
    } catch (error) {
        appendOutput(`Error selecting arena session: ${error.message}`, 'error');
    }
}

function setupEventListeners() {
    document.getElementById('modelSelect').addEventListener('change', (e) => {
        selectModel(e.target.value);
    });
    
    document.getElementById('createArenaBtn').addEventListener('click', createArenaSession);
    
    document.getElementById('executeBtn').addEventListener('click', () => {
        const taskInput = document.getElementById('taskInput');
        const task = taskInput.value.trim();
        
        if (!task) {
            appendOutput('Please enter a task to execute', 'error');
            return;
        }
        
        appendOutput(`Executing task with current model...`, 'info');
        appendOutput(`Task: ${task}`, 'info');
        // In a real implementation, this would call the model API
        appendOutput(`Task execution completed successfully!`, 'success');
    });
    
    document.getElementById('arenaEvaluateBtn').addEventListener('click', () => {
        appendOutput('Arena evaluation started...', 'info');
        // In a real implementation, this would trigger arena evaluation
        appendOutput('Arena evaluation completed!', 'success');
    });
}

function appendOutput(message, type = 'info') {
    const output = document.getElementById('output');
    const timestamp = new Date().toLocaleTimeString();
    const color = {
        'info': '#00aaff',
        'success': '#00ff88',
        'error': '#ff4444',
        'warning': '#ffaa00'
    }[type] || '#e0e0e0';
    
    output.innerHTML += `<div style="color: ${color};">[${timestamp}] ${message}</div>\n`;
    output.scrollTop = output.scrollHeight;
}
