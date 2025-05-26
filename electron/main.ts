import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
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

// 파일 선택 다이얼로그
ipcMain.handle('select-file', async () => {
  if (!mainWindow) return { success: false };

  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ]
    });

    if (result.canceled) {
      return { success: false };
    }

    return {
      success: true,
      filePath: result.filePaths[0]
    };
  } catch (error) {
    console.error('파일 선택 중 오류 발생:', error);
    return { success: false };
  }
});

// 파일 저장 다이얼로그
ipcMain.handle('save-file', async () => {
  if (!mainWindow) return { success: false };

  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ]
    });

    if (result.canceled) {
      return { success: false };
    }

    return {
      success: true,
      filePath: result.filePath
    };
  } catch (error) {
    console.error('파일 저장 중 오류 발생:', error);
    return { success: false };
  }
});

// 파일 저장
ipcMain.handle('save-to-file', async (_, { state, filePath }) => {
  try {
    await fs.promises.writeFile(filePath, JSON.stringify(state, null, 2));
    return { success: true };
  } catch (error) {
    console.error('파일 저장 중 오류 발생:', error);
    return { success: false };
  }
});

// 파일 로드
ipcMain.handle('load-from-file', async (_, filePath) => {
  try {
    const data = await fs.promises.readFile(filePath, 'utf-8');
    return { success: true, state: JSON.parse(data) };
  } catch (error) {
    console.error('파일 로드 중 오류 발생:', error);
    return { success: false };
  }
});

// 파일 변경 감시
ipcMain.handle('watch-file', async (_, filePath) => {
  try {
    const watcher = fs.watch(filePath, async (eventType) => {
      if (eventType === 'change' && mainWindow) {
        try {
          const data = await fs.promises.readFile(filePath, 'utf-8');
          mainWindow.webContents.send('file-changed', JSON.parse(data));
        } catch (error) {
          console.error('파일 변경 감시 중 오류 발생:', error);
        }
      }
    });

    return { success: true, watcher };
  } catch (error) {
    console.error('파일 감시 설정 중 오류 발생:', error);
    return { success: false };
  }
}); 