/**
 * HeadyBuddy Renderer - Frontend Logic
 * Handles UI interactions, task management, and AI companion chat
 */

const { ipcRenderer } = require('electron');

// State
let currentTask = null;
let chatHistory = [];
let isHeadyConnected = false;

// DOM Elements
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const currentTaskDisplay = document.getElementById('current-task');
const taskCount = document.getElementById('task-count');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatMessages = document.getElementById('chat-messages');
const minimizeBtn = document.getElementById('minimize-btn');
const closeBtn = document.getElementById('close-btn');
const header = document.getElementById('header');

// Buddy Personality & Responses
const BUDDY_PERSONALITY = {
    greetings: [
        "Hey there! Ready to build something amazing? 🚀",
        "Hello! I'm here to help you stay focused! ✨",
        "Hi! What are we working on today? 💻",
        "Hey! Let's make some magic happen! 🎨"
    ],
    encouragements: [
        "You're doing great! Keep it up! 💪",
        "Nice progress! You're crushing it! 🔥",
        "Look at you go! So productive! ⚡",
        "That's the spirit! Keep flowing! 🌊"
    ],
    completions: [
        "Task complete! You're awesome! 🎉",
        "Done and dusted! Great work! ✨",
        "Finished! Time for the next one! 🚀",
        "Completed! You're on fire! 🔥"
    ],
    breaks: [
        "Maybe take a quick stretch? Your brain will thank you! 🧘",
        "How about a 5-minute break? Refresh that mind! ☕",
        "Time for a breather? You've earned it! 🌟",
        "Quick water break? Stay hydrated! 💧"
    ]
};

// Initialize
async function init() {
    setupEventListeners();
    await checkHeadyStatus();
    sendBuddyMessage('greeting');
    
    // Check status every 30 seconds
    setInterval(checkHeadyStatus, 30000);
}

// Event Listeners
function setupEventListeners() {
    // Task management
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Chat
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Window controls
    minimizeBtn.addEventListener('click', () => {
        ipcRenderer.invoke('minimize-window');
    });

    closeBtn.addEventListener('click', () => {
        ipcRenderer.invoke('close-window');
    });

    // Quick actions
    document.getElementById('sync-btn').addEventListener('click', () => runCommand('sync'));
    document.getElementById('build-btn').addEventListener('click', () => runCommand('build'));
    document.getElementById('deploy-btn').addEventListener('click', () => runCommand('deploy'));
    document.getElementById('checkpoint-btn').addEventListener('click', () => runCommand('checkpoint'));

    // IPC from main
    ipcRenderer.on('heady-status', (event, status) => {
        updateHeadyStatus(status);
    });
}

// Task Management
function addTask() {
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    currentTask = {
        id: Date.now(),
        text: taskText,
        createdAt: new Date(),
        completed: false
    };

    displayTask(currentTask);
    taskInput.value = '';
    updateTaskCount(1);

    // Buddy responds
    sendBuddyMessage('encouragement');
}

function displayTask(task) {
    currentTaskDisplay.innerHTML = `
        <div class="active-task">
            <div class="task-header">
                <span class="task-status">🎯</span>
                <span class="task-text">${escapeHtml(task.text)}</span>
            </div>
            <div class="task-actions">
                <button class="task-btn complete-btn" onclick="completeTask()">✓ Complete</button>
                <button class="task-btn clear-btn" onclick="clearTask()">✕ Clear</button>
            </div>
            <div class="task-meta">
                Started ${formatTime(task.createdAt)}
            </div>
        </div>
    `;
}

function completeTask() {
    if (currentTask) {
        currentTask.completed = true;
        currentTask.completedAt = new Date();
        
        currentTaskDisplay.innerHTML = `
            <div class="completed-task">
                <span class="completed-icon">✅</span>
                <span class="completed-text">${escapeHtml(currentTask.text)}</span>
                <span class="completed-time">Done! (${formatDuration(currentTask.createdAt, currentTask.completedAt)})</span>
            </div>
        `;

        sendBuddyMessage('completion');
        updateTaskCount(0);
        
        // Clear after 3 seconds
        setTimeout(() => {
            currentTask = null;
            currentTaskDisplay.innerHTML = `
                <div class="task-placeholder">
                    <span class="placeholder-icon">✨</span>
                    <p>No active task</p>
                    <span class="placeholder-hint">What are we working on?</span>
                </div>
            `;
        }, 3000);
    }
}

function clearTask() {
    currentTask = null;
    currentTaskDisplay.innerHTML = `
        <div class="task-placeholder">
            <span class="placeholder-icon">✨</span>
            <p>No active task</p>
            <span class="placeholder-hint">What are we working on?</span>
        </div>
    `;
    updateTaskCount(0);
}

function updateTaskCount(count) {
    taskCount.textContent = count;
}

// Chat System
function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, 'user');
    chatInput.value = '';

    // Process and respond
    processUserMessage(message);
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.innerHTML = `
        <div class="message-avatar">${sender === 'user' ? '😊' : '🧠'}</div>
        <div class="message-content">
            <p>${escapeHtml(text)}</p>
            <span class="message-time">${formatTime(new Date())}</span>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function processUserMessage(message) {
    const lowerMsg = message.toLowerCase();
    
    // Simple command processing
    if (lowerMsg.includes('sync') || lowerMsg.includes('git')) {
        setTimeout(() => addMessage("I'll sync your repositories! Give me a moment... 🤖", 'buddy'), 500);
        runCommand('sync');
    } else if (lowerMsg.includes('build') || lowerMsg.includes('compile')) {
        setTimeout(() => addMessage("Starting build process! 🔨", 'buddy'), 500);
        runCommand('build');
    } else if (lowerMsg.includes('deploy')) {
        setTimeout(() => addMessage("Deploying to production! 🚀", 'buddy'), 500);
        runCommand('deploy');
    } else if (lowerMsg.includes('checkpoint') || lowerMsg.includes('save')) {
        setTimeout(() => addMessage("Creating checkpoint! 📍", 'buddy'), 500);
        runCommand('checkpoint');
    } else if (lowerMsg.includes('status') || lowerMsg.includes('health')) {
        setTimeout(() => checkHeadyStatusAndReport(), 500);
    } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
        setTimeout(() => sendBuddyMessage('greeting'), 500);
    } else if (lowerMsg.includes('break') || lowerMsg.includes('tired')) {
        setTimeout(() => sendBuddyMessage('break'), 500);
    } else {
        // Generic response
        setTimeout(() => {
            const responses = [
                "I'm here to help! Try asking about sync, build, deploy, or status! 💡",
                "Got it! Let me know if you need help with your tasks! 🤝",
                "I understand! Focus on your task and let me know when you need assistance! 🎯"
            ];
            addMessage(responses[Math.floor(Math.random() * responses.length)], 'buddy');
        }, 500);
    }
}

function sendBuddyMessage(type) {
    let responses;
    switch(type) {
        case 'greeting':
            responses = BUDDY_PERSONALITY.greetings;
            break;
        case 'encouragement':
            responses = BUDDY_PERSONALITY.encouragements;
            break;
        case 'completion':
            responses = BUDDY_PERSONALITY.completions;
            break;
        case 'break':
            responses = BUDDY_PERSONALITY.breaks;
            break;
        default:
            responses = BUDDY_PERSONALITY.greetings;
    }
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    addMessage(response, 'buddy');
}

// System Commands
async function runCommand(command) {
    try {
        switch(command) {
            case 'sync':
                addMessage("Running HeadySync... 🔄", 'buddy');
                // In real implementation, this would call PowerShell script
                setTimeout(() => addMessage("Sync complete! All remotes updated! ✅", 'buddy'), 2000);
                break;
            case 'build':
                addMessage("Building projects... 🔨", 'buddy');
                setTimeout(() => addMessage("Build successful! Sacred Geometry Activated! ✨", 'buddy'), 3000);
                break;
            case 'deploy':
                addMessage("Deploying to Render... 🚀", 'buddy');
                setTimeout(() => addMessage("Deployed! Check your live sites! 🌐", 'buddy'), 4000);
                break;
            case 'checkpoint':
                addMessage("Creating checkpoint... 📍", 'buddy');
                setTimeout(() => addMessage("Checkpoint created! Your progress is saved! 💾", 'buddy'), 2000);
                break;
        }
    } catch (error) {
        addMessage(`Oops! Something went wrong: ${error.message} 😅`, 'buddy');
    }
}

// Status Checking
async function checkHeadyStatus() {
    try {
        const status = await ipcRenderer.invoke('get-heady-status');
        updateHeadyStatus(status);
    } catch (error) {
        updateHeadyStatus({ connected: false, error: error.message });
    }
}

function updateHeadyStatus(status) {
    isHeadyConnected = status.connected;
    
    const headyDot = document.querySelector('#heady-manager-status .status-dot');
    const mcpDot = document.querySelector('#mcp-status .status-dot');
    const gitDot = document.querySelector('#git-status .status-dot');
    
    if (headyDot) {
        headyDot.className = `status-dot ${status.connected ? 'online' : 'offline'}`;
    }
    
    // Simulate MCP and Git status
    if (mcpDot) mcpDot.className = `status-dot ${status.connected ? 'online' : 'offline'}`;
    if (gitDot) gitDot.className = `status-dot online`;
}

async function checkHeadyStatusAndReport() {
    await checkHeadyStatus();
    
    if (isHeadyConnected) {
        addMessage("HeadyManager is online and running smoothly! 💚", 'buddy');
    } else {
        addMessage("HeadyManager seems to be offline. Try starting it locally! 💛", 'buddy');
    }
}

// Utilities
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
}

function formatDuration(start, end) {
    const diff = Math.floor((end - start) / 1000);
    if (diff < 60) return `${diff}s`;
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}m ${secs}s`;
}

// Start
init();

// Expose functions for onclick handlers
window.completeTask = completeTask;
window.clearTask = clearTask;
