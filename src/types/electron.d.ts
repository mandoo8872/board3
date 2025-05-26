interface ElectronAPI {
  selectFile: () => Promise<{ success: boolean; filePath?: string }>;
  saveFile: () => Promise<{ success: boolean; filePath?: string }>;
  writeFile: (options: { filePath: string; content: string }) => Promise<{ success: boolean }>;
  readFile: (filePath: string) => Promise<{ success: boolean; content?: string }>;
  getFileStats: (filePath: string) => Promise<{ success: boolean; mtime?: number }>;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
  }
} 