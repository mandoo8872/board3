import React from 'react';
import { Box, IconButton } from '@mui/material';
import {
  Edit as PenIcon,
  Delete as EraserIcon
} from '@mui/icons-material';
import type { ToolType } from '../types/types';

interface ToolButtonObjectProps {
  toolType: ToolType;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  onClick: () => void;
  isSelected: boolean;
}

export const ToolButtonObject: React.FC<ToolButtonObjectProps> = ({
  toolType,
  position,
  size,
  rotation,
  onClick,
  isSelected
}) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <IconButton
        onClick={onClick}
        sx={{
          width: '100%',
          height: '100%',
          bgcolor: 'background.paper',
          border: isSelected ? '2px solid #1976d2' : '2px solid #e0e0e0',
          borderRadius: '50%',
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
      >
        {toolType === 'pen' ? <PenIcon /> : <EraserIcon />}
      </IconButton>
    </Box>
  );
}; 