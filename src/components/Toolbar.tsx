import React from 'react';
import { Box, IconButton, Tooltip, Divider } from '@mui/material';
import {
  Edit as PenIcon,
  Delete as EraserIcon,
  TextFields as TextIcon,
  Crop as ImageIcon,
  ShapeLine as ShapeIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useToolbarStore } from '../store/toolbarStore';
import type { ToolType } from '../types/types';

interface ToolbarProps {
  state: {
    tool: ToolType;
    penColor: string;
    penWidth: number;
    eraserWidth: number;
    fontSize: number;
    fontFamily: string;
    shapeType: 'rectangle' | 'circle' | 'triangle';
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
  };
  onToolChange: (tool: ToolType) => void;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange: (family: string) => void;
  onShapeTypeChange: (type: 'rectangle' | 'circle' | 'triangle') => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  state,
  onToolChange,
  onColorChange,
  onWidthChange,
  onFontSizeChange,
  onFontFamilyChange,
  onShapeTypeChange
}) => {
  const tools: { type: ToolType; icon: React.ReactNode; label: string }[] = [
    { type: 'pen', icon: <PenIcon />, label: '연필' },
    { type: 'eraser', icon: <EraserIcon />, label: '지우개' },
    { type: 'text', icon: <TextIcon />, label: '텍스트' },
    { type: 'image', icon: <ImageIcon />, label: '이미지' },
    { type: 'shape', icon: <ShapeIcon />, label: '도형' }
  ];

  return (
    <Box
      sx={{
        position: 'absolute',
        left: 16,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        backgroundColor: 'white',
        padding: 1,
        borderRadius: 1,
        boxShadow: 1
      }}
    >
      {tools.map((tool) => (
        <Tooltip key={tool.type} title={tool.label} placement="right">
          <IconButton
            onClick={() => onToolChange(tool.type)}
            sx={{
              backgroundColor: state.tool === tool.type ? 'primary.main' : 'transparent',
              color: state.tool === tool.type ? 'white' : 'inherit',
              '&:hover': {
                backgroundColor: state.tool === tool.type ? 'primary.dark' : 'action.hover'
              }
            }}
          >
            {tool.icon}
          </IconButton>
        </Tooltip>
      ))}
      <Divider sx={{ my: 1 }} />
      <Tooltip title="설정" placement="right">
        <IconButton
          onClick={() => onToolChange('settings')}
          sx={{
            backgroundColor: state.tool === 'settings' ? 'primary.main' : 'transparent',
            color: state.tool === 'settings' ? 'white' : 'inherit',
            '&:hover': {
              backgroundColor: state.tool === 'settings' ? 'primary.dark' : 'action.hover'
            }
          }}
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default Toolbar; 