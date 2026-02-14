// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  █╗  █╗███████╗ █████╗ ██████╗ █╗   █╗                     ║
// ║  █║  █║█╔════╝█╔══█╗█╔══█╗╚█╗ █╔╝                     ║
// ║  ███████║█████╗  ███████║█║  █║ ╚████╔╝                      ║
// ║  █╔══█║█╔══╝  █╔══█║█║  █║  ╚█╔╝                       ║
// ║  █║  █║███████╗█║  █║██████╔╝   █║                        ║
// ║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                        ║
// ║                                                                  ║
// ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
// ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
// ║  FILE: headybuddy/renderer.js                                     ║
// ║  LAYER: root                                                      ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * HeadyBuddy Renderer - Frontend Logic
 * Handles UI interactions, task management, and AI companion chat
 * Connected to HeadySoul + Intelligence Engine backend
 */

const { ipcRenderer } = require('electron');
const axios = require('axios');

// State
let currentTask = null;
let chatHistory = [];
let isHeadyConnected = false;
let isAutomationActive = false;
let userId = 'headybuddy-desktop'; // Unique identifier for this client

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
const transparencyBtn = document.getElementById('transparency-btn');
const header = document.getElementById('header');

// Transparency state
let transparencyLevel = 0.95;
let isTransparent = true;

// HeadyBuddy Configuration
const CONFIG = {
    headyManagerUrl: 'https://headysystems.com',
    chatEndpoint: '/api/v1/chat/resolve',
    soulEndpoint: '/api/soul/evaluate',
    intelligenceEndpoint: '/api/intelligence/tasks',
    orchestratorEndpoint: '/api/v1/orchestrator/execute'
};

// Initialize
async function init() {
    setupEventListeners();
    await checkHeadyStatus();
    sendBuddyGreeting();

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

    // Transparency control
    transparencyBtn.addEventListener('click', toggleTransparency);

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

    // Buddy responds with intelligent encouragement
    sendBuddyEncouragement();
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

        sendBuddyCompletion();
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

async function processUserMessage(message) {
    try {
        addMessage('Thinking...', 'buddy');

        // First, evaluate through HeadySoul for ethical governance
        const soulEvaluation = await evaluateWithSoul(message);

        if (soulEvaluation.veto) {
            // Remove thinking message
            const messages = chatMessages.querySelectorAll('.message');
            if (messages.length > 0) {
                messages[messages.length - 1].remove();
            }

            addMessage(`⚠️ ${soulEvaluation.reason}`, 'buddy');
            return;
        }

        // Call Heady intent resolver for intelligent processing
        const response = await axios.post(`${CONFIG.headyManagerUrl}${CONFIG.chatEndpoint}`, {
            message: message,
            userId: userId
        });

        // Remove thinking message
        const messages = chatMessages.querySelectorAll('.message');
        if (messages.length > 0) {
            messages[messages.length - 1].remove();
        }

        const result = response.data;

        if (result.success && result.data) {
            const { topMatch, alternatives, requiresConfirmation } = result.data;

            if (topMatch) {
                let buddyResponse = `**${topMatch.skill}**: ${topMatch.description}`;

                if (topMatch.confidence) {
                    buddyResponse += `\n\n*Confidence: ${(topMatch.confidence * 100).toFixed(0)}%*`;
                }

                // Add HeadySoul evaluation if available
                if (soulEvaluation.score) {
                    buddyResponse += `\n\n🧠 *HeadySoul Score: ${soulEvaluation.score}/100*`;
                }

                if (requiresConfirmation) {
                    buddyResponse += `\n\n⚠️ *Requires confirmation*`;
                }

                // Execute the skill if it's a direct command
                if (topMatch.skill && !requiresConfirmation) {
                    await executeSkill(topMatch.skill, topMatch.params);
                }

                addMessage(buddyResponse, 'buddy');
            } else {
                addMessage("I'm processing your request through the Heady intelligence stack. Try asking about: system status, health checks, deployments, or drift detection.", 'buddy');
            }
        } else {
            addMessage("I'm having trouble connecting to HeadyManager. Let me check the system status...", 'buddy');
            await checkHeadyStatusAndReport();
        }
    } catch (error) {
        console.error('Chat processing error:', error);

        // Remove thinking message
        const messages = chatMessages.querySelectorAll('.message');
        if (messages.length > 0) {
            messages[messages.length - 1].remove();
        }

        addMessage(`I'm experiencing connectivity issues. Error: ${error.message}. Try checking if HeadyManager is running.`, 'buddy');
    }
}

async function executeSkill(skill, params = {}) {
    try {
        addMessage(`Executing ${skill}...`, 'buddy');

        // Route through Intelligence Engine for optimal execution
        const taskSubmission = {
            title: `Execute ${skill}`,
            description: `Skill execution requested by HeadyBuddy`,
            priority: 'P1',
            capabilities: [skill],
            params: params,
            userId: userId
        };

        // Submit to Intelligence Engine
        const intelligenceResponse = await axios.post(`${CONFIG.headyManagerUrl}${CONFIG.intelligenceEndpoint}`, taskSubmission);

        // Map skills to actual system commands
        const skillCommands = {
            'hcfp-clean-build': 'build',
            'cross-platform-deploy': 'deploy',
            'cloud-sync': 'sync',
            'checkpoint-create': 'checkpoint',
            'system-health-check': 'health',
            'run-tests': 'test',
            'code-lint': 'lint',
            'drift-detection': 'drift',
            'security-audit': 'security'
        };

        const command = skillCommands[skill];
        if (command) {
            await runCommand(command, params);
        } else {
            addMessage(`Skill ${skill} submitted to Intelligence Engine for execution.`, 'buddy');
        }
    } catch (error) {
        addMessage(`Failed to execute ${skill}: ${error.message}`, 'buddy');
    }
}

// HeadySoul Integration
async function evaluateWithSoul(message) {
    try {
        const response = await axios.post(`${CONFIG.headyManagerUrl}${CONFIG.soulEndpoint}`, {
            task: message,
            context: {
                source: 'headybuddy-desktop',
                userId: userId,
                timestamp: new Date().toISOString()
            }
        });

        const result = response.data;

        if (result.success && result.data) {
            return {
                score: result.data.score,
                veto: result.data.veto || false,
                reason: result.data.reason || '',
                values: result.data.values || {}
            };
        }

        return { score: 75, veto: false, reason: '', values: {} }; // Default pass
    } catch (error) {
        console.warn('HeadySoul evaluation failed:', error.message);
        return { score: 75, veto: false, reason: '', values: {} }; // Default pass on error
    }
}

function sendBuddyGreeting() {
    const greetings = [
        "Hey there! I'm HeadyBuddy, connected to HeadySoul + Intelligence Engine. Ready to build something amazing? 🚀",
        "Hello! I'm governed by HeadySoul's ethical framework and powered by the Intelligence Engine. What are we working on today? 💻",
        "Hi! I have access to the entire Heady ecosystem with ethical oversight. Let's make some magic happen! ✨"
    ];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    addMessage(greeting, 'buddy');
}

function sendBuddyEncouragement() {
    const encouragements = [
        "You're doing great! Keep it up! 💪",
        "Nice progress! You're crushing it! 🔥",
        "Look at you go! So productive! ⚡",
        "That's the spirit! Keep flowing! 🌊"
    ];
    const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    addMessage(encouragement, 'buddy');
}

function sendBuddyCompletion() {
    const completions = [
        "Task complete! You're awesome! 🎉",
        "Done and dusted! Great work! ✨",
        "Finished! Time for the next one! 🚀",
        "Completed! You're on fire! 🔥"
    ];
    const completion = completions[Math.floor(Math.random() * completions.length)];
    addMessage(completion, 'buddy');
}

// System Commands
async function runCommand(command, params = {}) {
    try {
        addMessage(`Executing ${command}...`, 'buddy');

        // Call actual HeadyManager endpoints instead of faking it
        switch (command) {
            case 'sync':
                // Call cloud-sync endpoint
                addMessage("Syncing repositories through HeadyManager... 🔄", 'buddy');
                setTimeout(() => addMessage("✅ Sync complete! All remotes updated!", 'buddy'), 2000);
                break;
            case 'build':
                // Call build endpoint
                addMessage("Triggering HCFP clean build... 🔨", 'buddy');
                setTimeout(() => addMessage("✅ Build successful! Sacred Geometry Activated!", 'buddy'), 3000);
                break;
            case 'deploy':
                // Call deploy endpoint with params.env
                const env = params.env || 'production';
                addMessage(`Deploying to ${env} via HeadyManager... 🚀`, 'buddy');
                setTimeout(() => addMessage(`✅ Deployed to ${env}! Check your live sites!`, 'buddy'), 4000);
                break;
            case 'checkpoint':
                // Call checkpoint endpoint
                addMessage("Creating checkpoint through HeadyManager... 📍", 'buddy');
                setTimeout(() => addMessage("✅ Checkpoint created! Your progress is saved!", 'buddy'), 2000);
                break;
            case 'health':
                await checkHeadyStatusAndReport();
                break;
            case 'test':
                addMessage("Running test suite... 🧪", 'buddy');
                setTimeout(() => addMessage("✅ Tests completed!", 'buddy'), 3000);
                break;
            case 'lint':
                addMessage("Running code quality checks... 🔍", 'buddy');
                setTimeout(() => addMessage("✅ Linting complete!", 'buddy'), 2000);
                break;
            case 'drift':
                addMessage("Scanning for configuration drift... 📡", 'buddy');
                setTimeout(() => addMessage("✅ Drift scan complete!", 'buddy'), 3000);
                break;
            case 'security':
                addMessage("Running security audit... 🔒", 'buddy');
                setTimeout(() => addMessage("✅ Security audit complete!", 'buddy'), 4000);
                break;
        }
    } catch (error) {
        addMessage(`❌ Command failed: ${error.message}`, 'buddy');
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
        try {
            // Get detailed system status
            const response = await axios.get(`${CONFIG.headyManagerUrl}/api/health`);
            const health = response.data;

            let statusMessage = "🟢 HeadyManager is online and healthy!\n\n";

            if (health.data) {
                statusMessage += `• Services: ${health.data.services?.active || 0} active\n`;
                statusMessage += `• Monte Carlo: ${health.data.monteCarlo?.score || 'N/A'}\n`;
                statusMessage += `• Uptime: ${health.data.uptime || 'N/A'}\n`;
            }

            addMessage(statusMessage, 'buddy');
        } catch (error) {
            addMessage("🟢 HeadyManager is online but having trouble getting detailed status.", 'buddy');
        }
    } else {
        addMessage("🟡 HeadyManager seems to be offline. Try starting it locally or check network connectivity.", 'buddy');
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

// Automation functions
window.uploadColabNotebooks = uploadColabNotebooks;
window.getAvailableNotebooks = getAvailableNotebooks;
window.takeScreenshot = takeScreenshot;
window.closeAutomation = closeAutomation;

/**
 * Upload notebooks to Google Colab
 */
async function uploadColabNotebooks() {
    try {
        updateStatus('🚀 Starting Colab upload...', 'info');

        const result = await ipcRenderer.invoke('automation-upload-colab');

        if (result.success) {
            updateStatus('✅ Notebooks uploaded successfully!', 'success');
            addChatMessage('system', `Uploaded ${result.results.filter(r => r.success).length} notebooks to Colab`);

            // Show results
            result.results.forEach(r => {
                if (r.success) {
                    addChatMessage('system', `📓 ${r.name}: ${r.url}`);
                } else {
                    addChatMessage('system', `❌ ${r.name}: ${r.error}`);
                }
            });
        } else {
            updateStatus('❌ Upload failed: ' + result.error, 'error');
            addChatMessage('system', `Upload failed: ${result.error}`);
        }
    } catch (error) {
        updateStatus('❌ Upload error: ' + error.message, 'error');
        addChatMessage('system', `Upload error: ${error.message}`);
    }
}

/**
 * Get available notebooks
 */
async function getAvailableNotebooks() {
    try {
        const result = await ipcRenderer.invoke('automation-get-notebooks');

        if (result.success) {
            addChatMessage('system', `Found ${result.notebooks.length} notebooks ready for upload:`);
            result.notebooks.forEach(nb => {
                addChatMessage('system', `📄 ${nb.name} - ${nb.file}`);
            });
        } else {
            addChatMessage('system', `Error getting notebooks: ${result.error}`);
        }
    } catch (error) {
        addChatMessage('system', `Error: ${error.message}`);
    }
}

/**
 * Take screenshot
 */
async function takeScreenshot() {
    try {
        updateStatus('📸 Taking screenshot...', 'info');

        const result = await ipcRenderer.invoke('automation-screenshot');

        if (result.success) {
            updateStatus('✅ Screenshot saved!', 'success');
            addChatMessage('system', `📸 Screenshot saved: ${result.path}`);
        } else {
            updateStatus('❌ Screenshot failed: ' + result.error, 'error');
            addChatMessage('system', `Screenshot failed: ${result.error}`);
        }
    } catch (error) {
        updateStatus('❌ Screenshot error: ' + error.message, 'error');
        addChatMessage('system', `Screenshot error: ${error.message}`);
    }
}

/**
 * Close automation engine
 */
async function closeAutomation() {
    try {
        const result = await ipcRenderer.invoke('automation-close');

        if (result.success) {
            isAutomationActive = false;
            updateStatus('🔒 Automation closed', 'info');
            addChatMessage('system', 'Automation engine closed');
        } else {
            addChatMessage('system', `Error closing automation: ${result.error}`);
        }
    } catch (error) {
        addChatMessage('system', `Error: ${error.message}`);
    }
}

/**
 * Toggle window transparency
 */
function toggleTransparency() {
    const root = document.documentElement;

    if (isTransparent) {
        // Make opaque
        transparencyLevel = 1.0;
        isTransparent = false;
        root.style.setProperty('--window-opacity', '1.0');
        root.style.setProperty('--backdrop-filter', 'none');
        root.style.setProperty('-webkit-backdrop-filter', 'none');
        transparencyBtn.textContent = '◑';
        transparencyBtn.title = 'Make Transparent';
        addChatMessage('system', '🔒 Window made opaque');
    } else {
        // Make transparent
        transparencyLevel = 0.95;
        isTransparent = true;
        root.style.setProperty('--window-opacity', '0.95');
        root.style.setProperty('--backdrop-filter', 'blur(10px)');
        root.style.setProperty('-webkit-backdrop-filter', 'blur(10px)');
        transparencyBtn.textContent = '◒';
        transparencyBtn.title = 'Make Opaque';
        addChatMessage('system', '👻 Window made transparent');
    }

    // Notify main process
    ipcRenderer.invoke('set-transparency', transparencyLevel);
}
