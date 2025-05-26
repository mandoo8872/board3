import React, { useState, useEffect } from 'react';
import { Box, Button, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Canvas } from '../components/Canvas';
import { Toolbar } from '../components/Toolbar';
import { PropertyPanel } from '../components/PropertyPanel';
import { SyncManager } from '../components/SyncManager';
import type { CanvasState, CanvasObject, ToolType } from '../types/types';
import { saveToLocalStorage, loadFromLocalStorage, saveToFile, loadFromFile } from '../lib/storage';
import { useToolbarStore } from '../store/toolbarStore';

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

export const AdminPage: React.FC = () => {
  const [canvasState, setCanvasState] = useState<CanvasState>(DEFAULT_CANVAS_STATE);
  const [selectedObject, setSelectedObject] = useState<CanvasObject | null>(null);
  const [selectedTool, setSelectedTool] = useState<ToolType>('pen');
  const [notification, setNotification] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

  const toolbarState = useToolbarStore();

  // 초기 상태 로드
  useEffect(() => {
    const savedState = loadFromLocalStorage();
    if (savedState) {
      setCanvasState(savedState);
    }
  }, []);

  // 상태 변경 시 자동 저장
  useEffect(() => {
    const newState = {
      ...canvasState,
      lastModified: new Date().toISOString()
    };
    saveToLocalStorage(newState);
  }, [canvasState]);

  const handleToolChange = (tool: string) => {
    useToolbarStore.getState().setTool(tool as any);
  };

  const handleColorChange = (color: string) => {
    useToolbarStore.getState().setPenColor(color);
  };

  const handleWidthChange = (width: number) => {
    useToolbarStore.getState().setPenWidth(width);
  };

  const handleFontSizeChange = (size: number) => {
    useToolbarStore.getState().setFontSize(size);
  };

  const handleFontFamilyChange = (family: string) => {
    useToolbarStore.getState().setFontFamily(family);
  };

  const handleShapeTypeChange = (type: 'rectangle' | 'circle' | 'triangle') => {
    useToolbarStore.getState().setShapeType(type);
  };

  const handleObjectUpdate = (updatedObject: CanvasObject) => {
    setCanvasState(prev => ({
      ...prev,
      objects: prev.objects.map(obj => 
        obj.id === updatedObject.id ? updatedObject : obj
      ),
      lastModified: new Date().toISOString()
    }));
  };

  const handleObjectAdd = (type: string) => {
    const newObject: CanvasObject = {
      id: Date.now().toString(),
      type: type as any,
      position: { x: canvasState.canvas.width / 2, y: canvasState.canvas.height / 2 },
      size: { width: 100, height: 100 },
      rotation: 0,
      overlapRule: 'displace',
      zIndex: canvasState.objects.length,
      lastModified: Date.now()
    };

    // 객체 타입별 추가 속성 설정
    if (type === 'text') {
      Object.assign(newObject, {
        content: '새 텍스트',
        fontSize: 24,
        fontFamily: 'Arial',
        color: '#000000'
      });
    } else if (type === 'shape') {
      Object.assign(newObject, {
        shapeType: 'rectangle',
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 2
      });
    }

    const updatedObjects = [...canvasState.objects, newObject];
    setCanvasState({
      ...canvasState,
      objects: updatedObjects
    });
  };

  const handleFileSelect = async () => {
    try {
      const result = await window.electron.selectFile();
      if (result.success && result.filePath) {
        setFilePath(result.filePath);
        const loadedState = await loadFromFile(result.filePath);
        if (loadedState) {
          setCanvasState(loadedState);
          setNotification('파일을 불러왔습니다.');
        }
      }
    } catch (error) {
      setNotification('파일 선택 중 오류가 발생했습니다.');
    }
  };

  const handleSaveAs = async () => {
    try {
      const result = await window.electron.saveFile();
      if (result.success && result.filePath) {
        setFilePath(result.filePath);
        const saved = await saveToFile(canvasState, result.filePath);
        if (saved) {
          setNotification('파일로 저장되었습니다.');
        }
      }
    } catch (error) {
      setNotification('파일 저장 중 오류가 발생했습니다.');
    }
  };

  const handleSave = () => {
    saveToLocalStorage(canvasState);
    setNotification('저장되었습니다.');
  };

  return (
    <Box sx={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas
        state={canvasState}
        onStateChange={setCanvasState}
        onObjectSelect={setSelectedObject}
      />
      <Toolbar
        state={toolbarState}
        onToolChange={handleToolChange}
        onColorChange={handleColorChange}
        onWidthChange={handleWidthChange}
        onFontSizeChange={handleFontSizeChange}
        onFontFamilyChange={handleFontFamilyChange}
        onShapeTypeChange={handleShapeTypeChange}
      />
      <PropertyPanel
        selectedObject={selectedObject}
        onObjectUpdate={handleObjectUpdate}
      />
      <Box sx={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          onClick={handleFileSelect}
        >
          파일 열기
        </Button>
        <Button
          variant="contained"
          onClick={handleSaveAs}
        >
          다른 이름으로 저장
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
        >
          저장
        </Button>
      </Box>
      {filePath && (
        <SyncManager
          filePath={filePath}
          currentState={canvasState}
          onStateChange={setCanvasState}
        />
      )}
      <Snackbar
        open={!!notification}
        autoHideDuration={3000}
        onClose={() => setNotification(null)}
      >
        <Alert severity="success" onClose={() => setNotification(null)}>
          {notification}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 