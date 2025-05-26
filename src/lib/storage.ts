import type { CanvasState } from '../types/types';

const STORAGE_KEY = 'canvas_state';
const HISTORY_KEY = 'canvas_history';
const BACKUP_KEY = 'canvas_backup';
const DEFAULT_AUTO_SAVE_INTERVAL = 5000; // 기본 5초

interface StorageConfig {
  autoSaveInterval: number;
  maxHistoryCount: number;
  backupEnabled: boolean;
}

const defaultConfig: StorageConfig = {
  autoSaveInterval: DEFAULT_AUTO_SAVE_INTERVAL,
  maxHistoryCount: 10,
  backupEnabled: true
};

// 설정 로드
export const loadConfig = (): StorageConfig => {
  try {
    const savedConfig = localStorage.getItem('canvas_config');
    return savedConfig ? { ...defaultConfig, ...JSON.parse(savedConfig) } : defaultConfig;
  } catch {
    return defaultConfig;
  }
};

// 설정 저장
export const saveConfig = (config: Partial<StorageConfig>): void => {
  try {
    const currentConfig = loadConfig();
    const newConfig = { ...currentConfig, ...config };
    localStorage.setItem('canvas_config', JSON.stringify(newConfig));
  } catch (error) {
    console.error('설정 저장 실패:', error);
  }
};

// 히스토리 로드
export const loadHistory = (): CanvasState[] => {
  try {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

// 히스토리 저장
export const saveToHistory = (state: CanvasState): void => {
  try {
    const config = loadConfig();
    const history = loadHistory();
    
    // 현재 상태를 히스토리에 추가
    history.unshift({
      ...state,
      lastModified: new Date().toISOString()
    });

    // 최대 개수 제한
    if (history.length > config.maxHistoryCount) {
      history.pop();
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('히스토리 저장 실패:', error);
  }
};

// 백업 생성
export const createBackup = (state: CanvasState): void => {
  try {
    const config = loadConfig();
    if (!config.backupEnabled) return;

    const backup = {
      state,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
  } catch (error) {
    console.error('백업 생성 실패:', error);
  }
};

// 백업 복원
export const restoreFromBackup = (): CanvasState | null => {
  try {
    const backup = localStorage.getItem(BACKUP_KEY);
    if (!backup) return null;

    const { state } = JSON.parse(backup);
    return state;
  } catch (error) {
    console.error('백업 복원 실패:', error);
    return null;
  }
};

// 로컬 스토리지에서 상태 불러오기
export const loadState = (): CanvasState | null => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (!savedState) return null;
    return JSON.parse(savedState);
  } catch (error) {
    console.error('상태 불러오기 실패:', error);
    return null;
  }
};

// 로컬 스토리지에 상태 저장
export const saveState = (state: CanvasState): void => {
  try {
    const config = loadConfig();
    const currentState = {
      ...state,
      lastModified: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
    saveToHistory(currentState);
    
    if (config.backupEnabled) {
      createBackup(currentState);
    }
  } catch (error) {
    console.error('상태 저장 실패:', error);
  }
};

// 자동 저장 설정
export const setupAutoSave = (
  state: CanvasState,
  onSave: (state: CanvasState) => void
): (() => void) => {
  const config = loadConfig();
  const intervalId = setInterval(() => {
    const currentState = {
      ...state,
      lastModified: new Date().toISOString()
    };
    saveState(currentState);
    onSave(currentState);
  }, config.autoSaveInterval);

  return () => clearInterval(intervalId);
};

// 파일로 내보내기
export const exportToFile = (state: CanvasState): void => {
  try {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `canvas_${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('파일 내보내기 실패:', error);
  }
};

// 파일에서 불러오기
export const importFromFile = (file: File): Promise<CanvasState> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const state = JSON.parse(event.target?.result as string);
        resolve(state);
      } catch (error) {
        reject(new Error('파일 형식이 올바르지 않습니다.'));
      }
    };
    reader.onerror = () => reject(new Error('파일 읽기 실패'));
    reader.readAsText(file);
  });
};

// Electron 파일 시스템 관련 함수들
interface FileSystemAPI {
  saveFile: (filePath: string, data: string) => Promise<{ success: boolean; error?: string }>;
  loadFile: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
  watchFile: (filePath: string) => Promise<{ success: boolean; lastModified?: number; error?: string }>;
}

const getFileSystemAPI = (): FileSystemAPI | null => {
  if (typeof window.require !== 'function') {
    return null;
  }

  const { ipcRenderer } = window.require('electron');
  return {
    saveFile: (filePath: string, data: string) => 
      ipcRenderer.invoke('save-file', filePath, data),
    loadFile: (filePath: string) => 
      ipcRenderer.invoke('load-file', filePath),
    watchFile: (filePath: string) => 
      ipcRenderer.invoke('watch-file', filePath)
  };
};

// 파일 저장
export const saveToFile = async (state: CanvasState, filePath: string): Promise<boolean> => {
  try {
    if (!window.electron) {
      throw new Error('Electron 환경이 아닙니다.');
    }

    const result = await window.electron.writeFile({
      filePath,
      content: JSON.stringify(state, null, 2)
    });

    return result.success;
  } catch (error) {
    console.error('파일 저장 실패:', error);
    return false;
  }
};

// 파일 로드
export const loadFromFile = async (filePath: string): Promise<CanvasState | null> => {
  try {
    if (!window.electron) {
      throw new Error('Electron 환경이 아닙니다.');
    }

    const result = await window.electron.readFile(filePath);
    if (!result.success || !result.content) {
      return null;
    }

    return JSON.parse(result.content);
  } catch (error) {
    console.error('파일 로드 실패:', error);
    return null;
  }
};

// 파일 변경 감지
export const watchFile = async (
  filePath: string,
  onChange: (state: CanvasState) => void
): Promise<() => void> => {
  if (!window.electron) {
    throw new Error('Electron 환경이 아닙니다.');
  }

  let lastModified = 0;

  const checkFile = async () => {
    try {
      const stats = await window.electron.getFileStats(filePath);
      if (!stats.success) return;

      if (stats.mtime > lastModified) {
        lastModified = stats.mtime;
        const state = await loadFromFile(filePath);
        if (state) {
          onChange(state);
        }
      }
    } catch (error) {
      console.error('파일 감시 중 오류:', error);
    }
  };

  // 5초마다 파일 변경 확인
  const intervalId = setInterval(checkFile, 5000);

  // 초기 로드
  await checkFile();

  // 클린업 함수 반환
  return () => clearInterval(intervalId);
}; 