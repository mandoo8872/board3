import React, { useRef, useEffect, useState } from 'react';
import type { CanvasState, Position, Stroke, CanvasObject, ToolType, ToolButtonStyle, SaveStatus, Theme } from '../types/types';
import { drawStroke, drawObject, calculateScale } from '../lib/drawUtils';
import { getCanvasPoint, createStroke } from '../lib/eventHandlers';
import {
  createObject,
  moveObject,
  resizeObject,
  rotateObject,
  handleObjectOverlap,
  snapPositionToGrid
} from '../lib/objectUtils';
import {
  loadState,
  saveState,
  setupAutoSave,
  exportToFile,
  importFromFile,
  loadHistory,
  restoreFromBackup,
  loadConfig,
  saveConfig
} from '../lib/storage';
import PropertyPanel from './PropertyPanel';
import ToolButton from './ToolButton';
import StatusBar from './StatusBar';
import { lightTheme, darkTheme } from '../types/types';

interface CanvasProps {
  state: CanvasState;
  onStateChange: (newState: CanvasState) => void;
  onObjectSelect: (object: CanvasObject | null) => void;
  isViewMode?: boolean;
  viewConfig?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export const Canvas: React.FC<CanvasProps> = ({
  state,
  onStateChange,
  onObjectSelect,
  isViewMode = false,
  viewConfig
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [selectedTool, setSelectedTool] = useState<ToolType>('pen');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position | null>(null);
  const [selectedObject, setSelectedObject] = useState<CanvasObject | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [toolButtonStyles, setToolButtonStyles] = useState<Record<ToolType, ToolButtonStyle>>({
    pen: {
      backgroundColor: '#ffffff',
      iconColor: '#000000',
      borderColor: '#000000',
      borderWidth: 1,
      borderStyle: 'solid',
      shadowColor: 'rgba(0, 0, 0, 0.2)',
      shadowBlur: 4,
      size: 40,
      iconSize: 24
    },
    eraser: {
      backgroundColor: '#ffffff',
      iconColor: '#000000',
      borderColor: '#000000',
      borderWidth: 1,
      borderStyle: 'solid',
      shadowColor: 'rgba(0, 0, 0, 0.2)',
      shadowBlur: 4,
      size: 40,
      iconSize: 24
    }
  });
  const [toolButtonPositions, setToolButtonPositions] = useState<Record<ToolType, { x: number; y: number }>>({
    pen: { x: 50, y: 50 },
    eraser: { x: 50, y: 100 }
  });
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState(loadConfig());
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>();
  const [theme, setTheme] = useState<Theme>(lightTheme);

  // 캔버스 크기 조정
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      canvas.width = containerWidth;
      canvas.height = containerHeight;

      const newScale = calculateScale(
        state.canvas.width,
        state.canvas.height,
        containerWidth,
        containerHeight
      );
      setScale(newScale);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [state.canvas.width, state.canvas.height]);

  // 렌더링
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isViewMode && viewConfig) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(
        viewConfig.x * scale,
        viewConfig.y * scale,
        viewConfig.width * scale,
        viewConfig.height * scale
      );
      ctx.clip();
    }

    // 그리드 그리기
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let x = 0; x < state.canvas.width; x += state.canvas.gridSize) {
      ctx.beginPath();
      ctx.moveTo(x * scale, 0);
      ctx.lineTo(x * scale, state.canvas.height * scale);
      ctx.stroke();
    }
    for (let y = 0; y < state.canvas.height; y += state.canvas.gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y * scale);
      ctx.lineTo(state.canvas.width * scale, y * scale);
      ctx.stroke();
    }

    // 객체 렌더링
    state.objects.forEach(obj => {
      drawObject(ctx, obj, scale);
    });

    // 스트로크 렌더링
    state.strokes.forEach(stroke => {
      drawStroke(ctx, stroke, scale);
    });

    if (currentStroke) {
      drawStroke(ctx, currentStroke, scale);
    }

    // 선택된 객체 하이라이트
    if (selectedObject) {
      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        selectedObject.position.x * scale,
        selectedObject.position.y * scale,
        selectedObject.size.width * scale,
        selectedObject.size.height * scale
      );

      // 리사이즈 핸들 그리기
      const handles = [
        { x: 0, y: 0, cursor: 'nw-resize' },
        { x: 0.5, y: 0, cursor: 'n-resize' },
        { x: 1, y: 0, cursor: 'ne-resize' },
        { x: 1, y: 0.5, cursor: 'e-resize' },
        { x: 1, y: 1, cursor: 'se-resize' },
        { x: 0.5, y: 1, cursor: 's-resize' },
        { x: 0, y: 1, cursor: 'sw-resize' },
        { x: 0, y: 0.5, cursor: 'w-resize' }
      ];

      handles.forEach(handle => {
        ctx.fillStyle = '#2196f3';
        ctx.beginPath();
        ctx.arc(
          (selectedObject.position.x + selectedObject.size.width * handle.x) * scale,
          (selectedObject.position.y + selectedObject.size.height * handle.y) * scale,
          4,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });
    }

    if (isViewMode && viewConfig) {
      ctx.restore();
    }
  }, [state, currentStroke, scale, isViewMode, viewConfig, selectedObject]);

  // 마우스/터치 이벤트 핸들러
  const handlePointerDown = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getCanvasPoint(event.nativeEvent, canvas, scale);
    const clickedObject = state.objects.find(obj => {
      const objRight = obj.position.x + obj.size.width;
      const objBottom = obj.position.y + obj.size.height;
      return (
        point.x >= obj.position.x &&
        point.x <= objRight &&
        point.y >= obj.position.y &&
        point.y <= objBottom
      );
    });

    if (clickedObject) {
      setSelectedObject(clickedObject);
      onObjectSelect(clickedObject);
      setIsDragging(true);
      setDragStart(point);
      return;
    }

    setSelectedObject(null);
    onObjectSelect(null);

    if (selectedTool === 'pen' || selectedTool === 'eraser') {
      setIsDrawing(true);
      setCurrentStroke(createStroke([point], selectedTool));
    }
  };

  const handlePointerMove = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getCanvasPoint(event.nativeEvent, canvas, scale);

    if (isDragging && selectedObject && dragStart) {
      const dx = point.x - dragStart.x;
      const dy = point.y - dragStart.y;
      const newPosition = {
        x: selectedObject.position.x + dx,
        y: selectedObject.position.y + dy
      };

      const updatedObject = moveObject(
        selectedObject,
        newPosition,
        state.canvas.gridSize,
        { width: state.canvas.width, height: state.canvas.height }
      );

      const updatedObjects = handleObjectOverlap(
        updatedObject,
        state.objects.filter(obj => obj.id !== selectedObject.id),
        state.canvas.gridSize
      );

      onStateChange({
        ...state,
        objects: [...updatedObjects, updatedObject]
      });

      setDragStart(point);
    } else if (isDrawing && currentStroke) {
      setCurrentStroke({
        ...currentStroke,
        points: [...currentStroke.points, point]
      });
    }
  };

  const handlePointerUp = () => {
    if (isDrawing && currentStroke) {
      setIsDrawing(false);
      onStateChange({
        ...state,
        strokes: [...state.strokes, currentStroke]
      });
      setCurrentStroke(null);
    }

    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
    }
  };

  const handleObjectDelete = (objectId: string) => {
    onStateChange({
      ...state,
      objects: state.objects.filter(obj => obj.id !== objectId)
    });
    setSelectedObject(null);
    onObjectSelect(null);
  };

  const handleObjectUpdate = (updatedObject: CanvasObject) => {
    onStateChange({
      ...state,
      objects: state.objects.map(obj =>
        obj.id === updatedObject.id ? updatedObject : obj
      )
    });
    setSelectedObject(updatedObject);
  };

  const handleToolSelect = (toolType: ToolType) => {
    setSelectedTool(toolType);
  };

  const handleToolButtonStyleChange = (toolType: ToolType, style: ToolButtonStyle) => {
    setToolButtonStyles(prev => ({
      ...prev,
      [toolType]: style
    }));
  };

  const handleToolButtonPositionChange = (toolType: ToolType, position: { x: number; y: number }) => {
    // 캔버스 경계 체크
    const boundedPosition = {
      x: Math.max(0, Math.min(position.x, state.canvas.width)),
      y: Math.max(0, Math.min(position.y, state.canvas.height))
    };

    setToolButtonPositions(prev => ({
      ...prev,
      [toolType]: boundedPosition
    }));
  };

  // 초기 상태 로드
  useEffect(() => {
    const savedState = loadState();
    if (savedState) {
      onStateChange(savedState);
    }
  }, []);

  // 자동 저장 설정
  useEffect(() => {
    const stopAutoSave = setupAutoSave(state, (savedState) => {
      handleStateSave(savedState);
    });
    return () => stopAutoSave();
  }, [state]);

  // 상태 변경 시 저장
  useEffect(() => {
    handleStateSave(state);
  }, [state]);

  const handleExport = () => {
    exportToFile(state);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedState = await importFromFile(file);
      onStateChange(importedState);
    } catch (error) {
      console.error('파일 불러오기 실패:', error);
      alert('파일 불러오기에 실패했습니다.');
    }
  };

  // 설정 변경
  const handleConfigChange = (newConfig: Partial<typeof config>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    saveConfig(updatedConfig);
  };

  // 테마 변경
  const handleThemeChange = (mode: 'light' | 'dark') => {
    setTheme(mode === 'light' ? lightTheme : darkTheme);
  };

  // 상태 저장
  const handleStateSave = async (state: CanvasState) => {
    try {
      setSaveStatus('saving');
      setErrorMessage(undefined);
      await saveState(state);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '저장 중 오류가 발생했습니다.');
    }
  };

  // 히스토리에서 복원
  const handleHistoryRestore = (state: CanvasState) => {
    onStateChange(state);
    setShowHistory(false);
  };

  // 백업에서 복원
  const handleBackupRestore = () => {
    const backupState = restoreFromBackup();
    if (backupState) {
      onStateChange(backupState);
    } else {
      alert('백업이 없습니다.');
    }
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      position: 'relative'
    }}>
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 1000 }}>
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: 'none' }}
          id="import-file"
        />
        <label htmlFor="import-file" style={{ marginRight: 8 }}>
          <button style={{
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            border: `1px solid ${theme.colors.border}`,
            padding: '8px 16px',
            borderRadius: 4,
            cursor: 'pointer'
          }}>
            불러오기
          </button>
        </label>
        <button
          onClick={handleExport}
          style={{
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            border: `1px solid ${theme.colors.border}`,
            padding: '8px 16px',
            borderRadius: 4,
            cursor: 'pointer',
            marginRight: 8
          }}
        >
          내보내기
        </button>
        <button
          onClick={() => setShowHistory(true)}
          style={{
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            border: `1px solid ${theme.colors.border}`,
            padding: '8px 16px',
            borderRadius: 4,
            cursor: 'pointer',
            marginRight: 8
          }}
        >
          히스토리
        </button>
        <button
          onClick={handleBackupRestore}
          style={{
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            border: `1px solid ${theme.colors.border}`,
            padding: '8px 16px',
            borderRadius: 4,
            cursor: 'pointer',
            marginRight: 8
          }}
        >
          백업 복원
        </button>
        <button
          onClick={() => setShowSettings(true)}
          style={{
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            border: `1px solid ${theme.colors.border}`,
            padding: '8px 16px',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          설정
        </button>
      </div>

      {/* 히스토리 패널 */}
      {showHistory && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: theme.colors.surface,
          padding: 20,
          borderRadius: 8,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 1001,
          color: theme.colors.text
        }}>
          <h3>저장 히스토리</h3>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {loadHistory().map((state, index) => (
              <div
                key={state.lastModified}
                style={{
                  padding: 10,
                  borderBottom: `1px solid ${theme.colors.border}`,
                  cursor: 'pointer',
                  ':hover': {
                    backgroundColor: theme.colors.background
                  }
                }}
                onClick={() => handleHistoryRestore(state)}
              >
                {new Date(state.lastModified).toLocaleString()}
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowHistory(false)}
            style={{
              marginTop: 10,
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              padding: '8px 16px',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            닫기
          </button>
        </div>
      )}

      {/* 설정 패널 */}
      {showSettings && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: theme.colors.surface,
          padding: 20,
          borderRadius: 8,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 1001,
          color: theme.colors.text
        }}>
          <h3>설정</h3>
          <div style={{ marginBottom: 10 }}>
            <label>
              자동 저장 간격 (초):
              <input
                type="number"
                min="1"
                max="60"
                value={config.autoSaveInterval / 1000}
                onChange={(e) => handleConfigChange({
                  autoSaveInterval: parseInt(e.target.value) * 1000
                })}
                style={{
                  marginLeft: 10,
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  border: `1px solid ${theme.colors.border}`,
                  padding: '4px 8px',
                  borderRadius: 4
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>
              최대 히스토리 개수:
              <input
                type="number"
                min="1"
                max="50"
                value={config.maxHistoryCount}
                onChange={(e) => handleConfigChange({
                  maxHistoryCount: parseInt(e.target.value)
                })}
                style={{
                  marginLeft: 10,
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  border: `1px solid ${theme.colors.border}`,
                  padding: '4px 8px',
                  borderRadius: 4
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>
              <input
                type="checkbox"
                checked={config.backupEnabled}
                onChange={(e) => handleConfigChange({
                  backupEnabled: e.target.checked
                })}
                style={{ marginRight: 10 }}
              />
              백업 활성화
            </label>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>
              테마:
              <select
                value={theme.mode}
                onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark')}
                style={{
                  marginLeft: 10,
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  border: `1px solid ${theme.colors.border}`,
                  padding: '4px 8px',
                  borderRadius: 4
                }}
              >
                <option value="light">라이트</option>
                <option value="dark">다크</option>
              </select>
            </label>
          </div>
          <button
            onClick={() => setShowSettings(false)}
            style={{
              marginTop: 10,
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              padding: '8px 16px',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            닫기
          </button>
        </div>
      )}

      <canvas
        ref={canvasRef}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          backgroundColor: theme.colors.surface
        }}
      />
      <PropertyPanel
        selectedObject={selectedObject}
        onObjectUpdate={handleObjectUpdate}
        onObjectDelete={handleObjectDelete}
        theme={theme}
      />
      <ToolButton
        toolType="pen"
        isSelected={selectedTool === 'pen'}
        onClick={() => handleToolSelect('pen')}
        position={toolButtonPositions.pen}
        onPositionChange={(position) => handleToolButtonPositionChange('pen', position)}
        onStyleChange={(style) => handleToolButtonStyleChange('pen', style)}
        style={toolButtonStyles.pen}
        theme={theme}
      />
      <ToolButton
        toolType="eraser"
        isSelected={selectedTool === 'eraser'}
        onClick={() => handleToolSelect('eraser')}
        position={toolButtonPositions.eraser}
        onPositionChange={(position) => handleToolButtonPositionChange('eraser', position)}
        onStyleChange={(style) => handleToolButtonStyleChange('eraser', style)}
        style={toolButtonStyles.eraser}
        theme={theme}
      />
      <StatusBar
        saveStatus={saveStatus}
        errorMessage={errorMessage}
        theme={theme}
      />
    </div>
  );
}; 