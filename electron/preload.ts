import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  selectFile: () => ipcRenderer.invoke('select-file'),
  saveFile: () => ipcRenderer.invoke('save-file'),
  saveToFile: (state: any, filePath: string) => ipcRenderer.invoke('save-to-file', { state, filePath }),
  loadFromFile: (filePath: string) => ipcRenderer.invoke('load-from-file', filePath),
  watchFile: (filePath: string) => ipcRenderer.invoke('watch-file', filePath),
  onFileChanged: (callback: (state: any) => void) => {
    ipcRenderer.on('file-changed', (_, state) => callback(state));
  }
}); 