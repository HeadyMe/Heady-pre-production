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
// ║  FILE: headybuddy/main.js                                         ║
// ║  LAYER: root                                                      ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

const { app, BrowserWindow, ipcMain, screen, Tray, Menu } = require('electron');
const path = require('path');
const axios = require('axios');
const HeadyBuddyAutomation = require('./automation-engine');

let mainWindow;
let tray;
let isAlwaysOnTop = true;
let automation;

// HeadyBuddy Configuration
const CONFIG = {
  width: 350,
  height: 500,
  x: 20, // Right side padding
  y: 100, // Top padding
  opacity: 0.95,
  headyManagerUrl: 'https://heady-manager-headysystems.onrender.com'
};

function createWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: CONFIG.width,
    height: CONFIG.height,
    x: screenWidth - CONFIG.width - CONFIG.x,
    y: CONFIG.y,
    alwaysOnTop: isAlwaysOnTop,
    skipTaskbar: true,
    frame: false,
    transparent: true,
    opacity: CONFIG.opacity,
    resizable: true,
    minimizable: false,
    maximizable: false,
    closable: true,
    focusable: true,
    hasShadow: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  mainWindow.loadFile('index.html');

  // Handle window move - save position
  mainWindow.on('moved', () => {
    const bounds = mainWindow.getBounds();
    console.log('HeadyBuddy moved to:', bounds);
  });

  // Prevent closing, just hide to tray
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'assets', 'tray-icon.png'));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show HeadyBuddy',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Always on Top',
      type: 'checkbox',
      checked: isAlwaysOnTop,
      click: (menuItem) => {
        isAlwaysOnTop = menuItem.checked;
        mainWindow.setAlwaysOnTop(isAlwaysOnTop);
      }
    },
    { type: 'separator' },
    {
      label: 'Connect to HeadyManager',
      click: async () => {
        try {
          const response = await axios.get(`${CONFIG.headyManagerUrl}/api/health`);
          mainWindow.webContents.send('heady-status', { connected: true, data: response.data });
        } catch (error) {
          mainWindow.webContents.send('heady-status', { connected: false, error: error.message });
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('HeadyBuddy - Your AI Companion');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

// IPC Handlers
ipcMain.handle('toggle-always-on-top', () => {
  isAlwaysOnTop = !isAlwaysOnTop;
  mainWindow.setAlwaysOnTop(isAlwaysOnTop);
  return isAlwaysOnTop;
});

ipcMain.handle('get-heady-status', async () => {
  try {
    const response = await axios.get(`${CONFIG.headyManagerUrl}/api/health`);
    return { connected: true, data: response.data };
  } catch (error) {
    return { connected: false, error: error.message };
  }
});

ipcMain.handle('minimize-window', () => {
  mainWindow.minimize();
});

ipcMain.handle('close-window', () => {
  mainWindow.hide();
});

// Automation IPC handlers
ipcMain.handle('automation-upload-colab', async () => {
  try {
    if (!automation) {
      throw new Error('Automation engine not initialized');
    }

    const notebooks = automation.getAvailableNotebooks();
    const results = await automation.uploadToColab(notebooks);

    return { success: true, results };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('automation-get-notebooks', async () => {
  try {
    if (!automation) {
      throw new Error('Automation engine not initialized');
    }

    const notebooks = automation.getAvailableNotebooks();
    return { success: true, notebooks };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('automation-screenshot', async (event, pageName = 'default') => {
  try {
    if (!automation) {
      throw new Error('Automation engine not initialized');
    }

    const screenshotPath = await automation.screenshot(pageName);
    return { success: true, path: screenshotPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('automation-close', async () => {
  try {
    if (automation) {
      await automation.close();
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

app.whenReady().then(() => {
  createWindow();
  createTray();

  // Initialize automation engine
  automation = new HeadyBuddyAutomation();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Global shortcut for showing/hiding
const { globalShortcut } = require('electron');

app.on('ready', () => {
  globalShortcut.register('CommandOrControl+Shift+H', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();

  // Cleanup automation engine
  if (automation) {
    automation.close();
  }
});
