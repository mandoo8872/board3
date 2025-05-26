import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Popover,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Grid
} from '@mui/material';
import {
  Edit as PenIcon,
  Delete as EraserIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import type { ToolType, ToolButtonStyle, Theme } from '../types/types';

interface ToolButtonProps {
  toolType: ToolType;
  isSelected: boolean;
  onClick: () => void;
  position: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  onStyleChange: (style: ToolButtonStyle) => void;
  style: ToolButtonStyle;
  theme: Theme;
}

const defaultStyle: ToolButtonStyle = {
  backgroundColor: '#ffffff',
  iconColor: '#000000',
  borderColor: '#000000',
  borderWidth: 1,
  borderStyle: 'solid',
  shadowColor: 'rgba(0, 0, 0, 0.2)',
  shadowBlur: 4,
  size: 40,
  iconSize: 24
};

const ToolButton: React.FC<ToolButtonProps> = ({
  toolType,
  isSelected,
  onClick,
  position,
  onPositionChange,
  onStyleChange,
  style = defaultStyle,
  theme
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const getIcon = () => {
    switch (toolType) {
      case 'pen':
        return <PenIcon style={{ fontSize: style.iconSize }} />;
      case 'eraser':
        return <EraserIcon style={{ fontSize: style.iconSize }} />;
      default:
        return null;
    }
  };

  const getTooltip = () => {
    switch (toolType) {
      case 'pen':
        return '필기';
      case 'eraser':
        return '지우기';
      default:
        return '';
    }
  };

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  const handleStyleChange = (field: keyof ToolButtonStyle, value: any) => {
    if (onStyleChange) {
      onStyleChange({
        ...style,
        [field]: value
      });
    }
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    if (event.button === 0) { // 좌클릭
      setIsDragging(true);
      setDragStart({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging && dragStart && onPositionChange) {
      const dx = event.clientX - dragStart.x;
      const dy = event.clientY - dragStart.y;
      onPositionChange({
        x: position.x + dx,
        y: position.y + dy
      });
      setDragStart({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', '');
  };

  const handleDrag = (e: React.DragEvent) => {
    if (e.clientX === 0 && e.clientY === 0) return;
    onPositionChange({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onClick={onClick}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: style.size,
        height: style.size,
        backgroundColor: style.backgroundColor,
        border: `${style.borderWidth}px ${style.borderStyle} ${style.borderColor}`,
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        boxShadow: `0 2px ${style.shadowBlur}px ${style.shadowColor}`,
        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 0.2s',
        zIndex: 1000
      }}
    >
      {toolType === 'pen' ? (
        <svg
          width={style.iconSize}
          height={style.iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke={style.iconColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          <path d="M2 2l7.586 7.586" />
          <circle cx="11" cy="11" r="2" />
        </svg>
      ) : (
        <svg
          width={style.iconSize}
          height={style.iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke={style.iconColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        </svg>
      )}

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleSettingsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
      >
        <Box sx={{ p: 2, width: 300 }}>
          <Typography variant="h6" gutterBottom>
            버튼 스타일
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="배경색"
                type="color"
                value={style.backgroundColor}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="아이콘 색상"
                type="color"
                value={style.iconColor}
                onChange={(e) => handleStyleChange('iconColor', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="테두리 색상"
                type="color"
                value={style.borderColor}
                onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>테두리 스타일</InputLabel>
                <Select
                  value={style.borderStyle}
                  onChange={(e) => handleStyleChange('borderStyle', e.target.value)}
                  label="테두리 스타일"
                >
                  <MenuItem value="solid">실선</MenuItem>
                  <MenuItem value="dashed">점선</MenuItem>
                  <MenuItem value="dotted">점</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>테두리 두께</Typography>
              <Slider
                value={style.borderWidth}
                onChange={(_, value) => handleStyleChange('borderWidth', value)}
                min={0}
                max={5}
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>그림자 크기</Typography>
              <Slider
                value={style.shadowBlur}
                onChange={(_, value) => handleStyleChange('shadowBlur', value)}
                min={0}
                max={10}
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid item xs={6}>
              <Typography gutterBottom>버튼 크기</Typography>
              <Slider
                value={style.size}
                onChange={(_, value) => handleStyleChange('size', value)}
                min={30}
                max={60}
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid item xs={6}>
              <Typography gutterBottom>아이콘 크기</Typography>
              <Slider
                value={style.iconSize}
                onChange={(_, value) => handleStyleChange('iconSize', value)}
                min={16}
                max={32}
                valueLabelDisplay="auto"
              />
            </Grid>
          </Grid>
        </Box>
      </Popover>
    </div>
  );
};

export default ToolButton; 