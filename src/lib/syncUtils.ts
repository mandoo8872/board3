import type { CanvasState, CanvasObject, Stroke } from '../types/types';
import type { SyncState, SyncConflict, SyncResult, ConflictResolutionStrategy } from '../types/sync';
import { saveToFile, loadFromFile } from './storage';

export interface SyncState {
  lastModified: string;
  state: CanvasState;
  version: number;
}

export interface SyncConflict {
  localState: CanvasState;
  remoteState: CanvasState;
  timestamp: number;
}

export interface SyncResult {
  success: boolean;
  state?: CanvasState;
  conflict?: SyncConflict;
  error?: string;
}

export type ConflictResolutionStrategy = 'local' | 'remote' | 'merge';

// 동기화 상태 생성
export const createSyncState = (state: CanvasState): SyncState => ({
  lastModified: new Date().toISOString(),
  state,
  version: 1
});

// 상태 비교
export const compareStates = (state1: CanvasState, state2: CanvasState): boolean => {
  return JSON.stringify(state1) === JSON.stringify(state2);
};

// 충돌 감지
export const detectConflict = (localState: CanvasState, remoteState: CanvasState): boolean => {
  return !compareStates(localState, remoteState);
};

// 충돌 해결
export const resolveConflict = async (
  localState: CanvasState,
  remoteState: CanvasState,
  strategy: ConflictResolutionStrategy
): Promise<CanvasState> => {
  switch (strategy) {
    case 'local':
      return localState;
    case 'remote':
      return remoteState;
    case 'merge':
      return mergeStates(localState, remoteState);
    default:
      throw new Error('지원하지 않는 충돌 해결 전략입니다.');
  }
};

// 상태 병합
const mergeStates = (localState: CanvasState, remoteState: CanvasState): CanvasState => {
  const mergedObjects = new Map<string, CanvasObject>();
  const mergedStrokes = new Map<string, Stroke>();

  // 로컬 객체 병합
  localState.objects.forEach(obj => {
    mergedObjects.set(obj.id, obj);
  });

  // 원격 객체 병합
  remoteState.objects.forEach(obj => {
    const localObj = mergedObjects.get(obj.id);
    if (!localObj || obj.lastModified > localObj.lastModified) {
      mergedObjects.set(obj.id, obj);
    }
  });

  // 스트로크 병합
  localState.strokes.forEach(stroke => {
    mergedStrokes.set(stroke.id, stroke);
  });
  remoteState.strokes.forEach(stroke => {
    const localStroke = mergedStrokes.get(stroke.id);
    if (!localStroke || stroke.lastModified > localStroke.lastModified) {
      mergedStrokes.set(stroke.id, stroke);
    }
  });

  return {
    ...localState,
    objects: Array.from(mergedObjects.values()),
    strokes: Array.from(mergedStrokes.values()),
    lastModified: new Date().toISOString()
  };
};

// 동기화 실행
export const syncState = async (
  filePath: string,
  currentState: CanvasState
): Promise<SyncResult> => {
  try {
    const remoteState = await loadFromFile(filePath);
    if (!remoteState) {
      return {
        success: false,
        state: null,
        conflict: null,
        error: '원격 파일을 로드할 수 없습니다.'
      };
    }

    const localSyncState = createSyncState(currentState);
    const remoteSyncState = createSyncState(remoteState);

    const conflict = detectConflict(localSyncState.state, remoteSyncState.state);
    if (conflict) {
      return {
        success: false,
        state: null,
        conflict: {
          localState: localSyncState.state,
          remoteState: remoteSyncState.state,
          timestamp: Date.now()
        }
      };
    }

    // 충돌이 없는 경우, 최신 상태 사용
    const latestState = localSyncState.lastModified > remoteSyncState.lastModified
      ? localSyncState.state
      : remoteSyncState.state;

    const success = await saveToFile(latestState, filePath);
    if (!success) {
      throw new Error('상태 저장에 실패했습니다.');
    }

    return {
      success: true,
      state: latestState,
      conflict: null
    };
  } catch (error) {
    return {
      success: false,
      state: null,
      conflict: null,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    };
  }
}; 