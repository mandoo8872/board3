import React, { useState, useEffect } from 'react';
import { Box, Snackbar, Alert } from '@mui/material';
import { Canvas } from '../components/Canvas';
import { Toolbar } from '../components/Toolbar';
import type { CanvasState, ToolType } from '../types/types';
import { loadFromLocalStorage } from '../lib/storage';

const DEFAULT_CANVAS_STATE: CanvasState = {
  canvas: {
    width: 1920,
    height: 1080,
    gridSize: 20
  },
  objects: [],
  strokes: [],
  toolButtons: [],
  lastModified: new Date().toISOString()
};

export const ViewPage: React.FC = () => {
  const [state, setState] = useState<CanvasState>(DEFAULT_CANVAS_STATE);
  const [selectedTool, setSelectedTool] = useState<ToolType>('pen');
  const [notification, setNotification] = useState<string | null>(null);

  // 초기 상태 로드
  useEffect(() => {
    const savedState = loadFromLocalStorage();
    if (savedState) {
      setState(savedState);
    }
  }, []);

  const handleStateChange = (newState: CanvasState) => {
    setState(newState);
  };

  const handleToolSelect = (tool: ToolType) => {
    setSelectedTool(tool);
  };

  const handleObjectAdd = () => {
    // 뷰 모드에서는 객체 추가 기능을 사용하지 않음
  };

  return (
    <Box sx={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas
        state={state}
        onStateChange={handleStateChange}
        isViewMode={true}
        viewConfig={{
          x: 0,
          y: 0,
          width: state.canvas.width,
          height: state.canvas.height
        }}
      />
      <Toolbar
        selectedTool={selectedTool}
        onToolSelect={handleToolSelect}
        onObjectAdd={handleObjectAdd}
        isViewMode={true}
      />
      <Snackbar
        open={!!notification}
        autoHideDuration={3000}
        onClose={() => setNotification(null)}
      >
        <Alert severity="info" onClose={() => setNotification(null)}>
          {notification}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 