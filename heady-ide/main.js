const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { HeadyModelProvider, ArenaMergeEngine } = require('./src/heady-ide');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    title: 'HeadyAI-IDE'
  });

  mainWindow.loadFile('index.html');
  
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for HeadyAI functionality
const modelProvider = new HeadyModelProvider();
const arenaEngine = new ArenaMergeEngine();

ipcMain.handle('list-models', (event, filter) => {
  return modelProvider.listModels(filter);
});

ipcMain.handle('select-model', (event, modelId) => {
  return modelProvider.selectModel(modelId);
});

ipcMain.handle('get-active-model', () => {
  return modelProvider.getModel(modelProvider.activeModel);
});

ipcMain.handle('create-arena-session', (event, task, models) => {
  return arenaEngine.createSession(task, models);
});

ipcMain.handle('get-arena-session', (event, sessionId) => {
  return arenaEngine.getSession(sessionId);
});

ipcMain.handle('list-arena-sessions', (event, filter) => {
  return arenaEngine.listSessions(filter);
});
