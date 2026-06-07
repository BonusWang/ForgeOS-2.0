const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const fs = require('fs');

const DATA_DIR_NAME = 'Forge';
const DATA_DIR = process.env.FORGE_DATA_DIR
  ? path.resolve(process.env.FORGE_DATA_DIR)
  : path.join(app.getPath('appData'), DATA_DIR_NAME);

app.setPath('userData', DATA_DIR);

const DATA_FILE = path.join(DATA_DIR, 'forge-data.json');
const BACKUP_FILE = DATA_FILE + '.bak';
const ROLLBACK_FILE = DATA_FILE + '.rollback';
const TEMP_FILE = DATA_FILE + '.tmp';
const RESET_DATA_FLAGS = new Set(['--reset-data', '--clear-data']);
const SHOULD_RESET_DATA =
  process.env.FORGE_RESET_DATA === '1' || process.argv.some((arg) => RESET_DATA_FLAGS.has(arg));

const PACKAGE_JSON = path.join(__dirname, '../package.json');

function ensureDataDir() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error(`Failed to create data directory ${DATA_DIR}:`, e);
  }
}

function readFileSafe(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error(`Failed to read/parse ${filePath}:`, e);
  }
  return null;
}

function resetDataIfRequested() {
  if (!SHOULD_RESET_DATA) return;

  for (const filePath of [DATA_FILE, BACKUP_FILE, ROLLBACK_FILE, TEMP_FILE]) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.error(`Failed to remove data file ${filePath}:`, e);
    }
  }
  writeData({});
}

function readData() {
  // Try primary file first
  let data = readFileSafe(DATA_FILE);
  if (data !== null) return data;

  // Primary corrupted or missing — try backup
  console.warn('Primary data file missing or corrupted, attempting backup recovery...');
  data = readFileSafe(BACKUP_FILE);
  if (data !== null) {
    console.log('Backup recovered successfully.');
    // Restore primary from backup
    try {
      fs.copyFileSync(BACKUP_FILE, DATA_FILE);
    } catch (e) {
      console.error('Failed to restore primary from backup:', e);
    }
    return data;
  }

  console.error('Both primary and backup data files are unavailable.');
  return null;
}

function writeData(data) {
  const json = JSON.stringify(data, null, 2);
  try {
    ensureDataDir();

    // Atomic write: write to temp, then rename over primary
    fs.writeFileSync(TEMP_FILE, json, 'utf-8');
    fs.renameSync(TEMP_FILE, DATA_FILE);

    // Create backup copy (best-effort, don't fail primary write if backup fails)
    try {
      fs.copyFileSync(DATA_FILE, BACKUP_FILE);
    } catch (backupErr) {
      console.error('Failed to create backup:', backupErr);
    }

    return true;
  } catch (e) {
    console.error('Failed to write data file:', e);
    // Clean up temp file if it exists
    try {
      if (fs.existsSync(TEMP_FILE)) fs.unlinkSync(TEMP_FILE);
    } catch {
      // ignore cleanup error
    }
    return false;
  }
}

// IPC handlers
ipcMain.handle('save-data', (_event, data) => {
  return writeData(data);
});

ipcMain.on('save-data-sync', (event, data) => {
  event.returnValue = writeData(data);
});

ipcMain.on('load-data-sync', (event) => {
  event.returnValue = readData();
});

ipcMain.on('get-app-version', (event) => {
  try {
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf-8'));
    event.returnValue = pkg.version || '0.0.0';
  } catch {
    event.returnValue = '0.0.0';
  }
});

ipcMain.on('get-data-file-path', (event) => {
  event.returnValue = DATA_FILE;
});

ipcMain.handle('save-rollback', (_event, data) => {
  try {
    fs.writeFileSync(ROLLBACK_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Failed to save rollback:', e);
    return false;
  }
});

// Window lifecycle
let mainWindow = null;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Forge-OS',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  resetDataIfRequested();

  // Register custom protocol for serving static resources from inside asar
  protocol.registerFileProtocol('app', (request, callback) => {
    const url = request.url.replace('app://', '');
    const filePath = path.normalize(`${__dirname}/../dist/${url}`);
    callback(filePath);
  });
  createWindow();
});

app.on('before-quit', async (event) => {
  if (!isQuitting && mainWindow && !mainWindow.isDestroyed()) {
    isQuitting = true;
    event.preventDefault();

    // Ask renderer to flush pending writes synchronously
    try {
      mainWindow.webContents.send('app-before-quit');
    } catch (e) {
      console.error('Failed to send before-quit to renderer:', e);
    }

    // Give renderer a short window to complete flush, then quit
    setTimeout(() => {
      app.quit();
    }, 500);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
