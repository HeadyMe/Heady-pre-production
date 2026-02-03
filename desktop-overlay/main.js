const { app, BrowserWindow } = require('electron');
const { exec } = require('child_process');

// Start services
exec('node heady-auto-ide/server.js', { cwd: __dirname });
exec('node heady-e/server.js', { cwd: __dirname });
exec('node heady-mcp/server.js', { cwd: __dirname });

// Create overlay window
function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 600,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('overlay.html');
}

app.whenReady().then(createWindow);
