import React, { useEffect, useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert
} from '@mui/material';
import type { CanvasState } from '../types/types';
import { watchFileChanges } from '../lib/storage';
import { detectConflict, resolveConflict } from '../lib/syncUtils';

interface SyncManagerProps {
  filePath: string;
  currentState: CanvasState;
  onStateChange: (state: CanvasState) => void;
  syncInterval?: number;
}

export const SyncManager: React.FC<SyncManagerProps> = ({
  filePath,
  currentState,
  onStateChange,
  syncInterval = 5000
}) => {
  const [conflict, setConflict] = useState<{
    localState: CanvasState;
    remoteState: CanvasState;
    timestamp: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const cleanup = watchFileChanges(filePath, async (remoteState) => {
      try {
        setIsSyncing(true);
        const conflict = detectConflict(currentState, remoteState);
        
        if (conflict) {
          setConflict({
            localState: currentState,
            remoteState,
            timestamp: Date.now()
          });
        } else {
          onStateChange(remoteState);
        }
      } catch (error) {
        setError('동기화 중 오류가 발생했습니다.');
        console.error('동기화 오류:', error);
      } finally {
        setIsSyncing(false);
      }
    });

    return () => {
      cleanup();
    };
  }, [filePath, currentState, onStateChange]);

  const handleConflictResolution = async (strategy: 'local' | 'remote' | 'merge') => {
    if (!conflict) return;

    try {
      setIsSyncing(true);
      const resolvedState = await resolveConflict(conflict.localState, conflict.remoteState, strategy);
      onStateChange(resolvedState);
      setConflict(null);
    } catch (error) {
      setError('충돌 해결 중 오류가 발생했습니다.');
      console.error('충돌 해결 오류:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <Dialog
        open={!!conflict}
        onClose={() => setConflict(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>변경 사항 충돌</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            로컬과 원격 파일 간에 변경 사항 충돌이 발생했습니다.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              로컬 변경 사항:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              마지막 수정: {new Date(conflict?.localState.lastModified || '').toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              원격 변경 사항:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              마지막 수정: {new Date(conflict?.remoteState.lastModified || '').toLocaleString()}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handleConflictResolution('local')}
            disabled={isSyncing}
          >
            로컬 변경 사항 유지
          </Button>
          <Button
            onClick={() => handleConflictResolution('remote')}
            disabled={isSyncing}
          >
            원격 변경 사항 적용
          </Button>
          <Button
            onClick={() => handleConflictResolution('merge')}
            disabled={isSyncing}
          >
            변경 사항 병합
          </Button>
        </DialogActions>
      </Dialog>

      {error && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            right: 16,
            bgcolor: 'error.main',
            color: 'error.contrastText',
            p: 2,
            borderRadius: 1
          }}
        >
          <Typography>{error}</Typography>
          <Button
            size="small"
            color="inherit"
            onClick={() => setError(null)}
            sx={{ mt: 1 }}
          >
            닫기
          </Button>
        </Box>
      )}
    </>
  );
}; 