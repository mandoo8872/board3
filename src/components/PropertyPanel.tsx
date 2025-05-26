import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  IconButton,
  Divider,
  Grid
} from '@mui/material';
import {
  FormatColorFill as FillIcon,
  FormatColorText as TextColorIcon,
  BorderColor as StrokeColorIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import type { CanvasObject, Theme } from '../types/types';

interface PropertyPanelProps {
  selectedObject: CanvasObject | null;
  onObjectUpdate: (updatedObject: CanvasObject) => void;
  onObjectDelete: (objectId: string) => void;
  theme: Theme;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedObject,
  onObjectUpdate,
  onObjectDelete,
  theme
}) => {
  if (!selectedObject) {
    return null;
  }

  const handlePositionChange = (field: 'x' | 'y', value: number) => {
    onObjectUpdate({
      ...selectedObject,
      position: {
        ...selectedObject.position,
        [field]: value
      }
    });
  };

  const handleSizeChange = (field: 'width' | 'height', value: number) => {
    onObjectUpdate({
      ...selectedObject,
      size: {
        ...selectedObject.size,
        [field]: value
      }
    });
  };

  const handleRotationChange = (value: number) => {
    onObjectUpdate({
      ...selectedObject,
      rotation: value
    });
  };

  const handleTextChange = (field: string, value: string | number) => {
    if (selectedObject.type === 'text') {
      onObjectUpdate({
        ...selectedObject,
        [field]: value
      });
    }
  };

  const handleShapeChange = (field: string, value: string | number) => {
    if (selectedObject.type === 'shape') {
      onObjectUpdate({
        ...selectedObject,
        [field]: value
      });
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: 8,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        color: theme.colors.text,
        zIndex: 1000
      }}
    >
      <h3 style={{ margin: '0 0 16px 0' }}>속성</h3>
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>
          X:
          <input
            type="number"
            value={selectedObject.position.x}
            onChange={(e) => handlePositionChange('x', parseFloat(e.target.value))}
            style={{
              marginLeft: 8,
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              padding: '4px 8px',
              borderRadius: 4
            }}
          />
        </label>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>
          Y:
          <input
            type="number"
            value={selectedObject.position.y}
            onChange={(e) => handlePositionChange('y', parseFloat(e.target.value))}
            style={{
              marginLeft: 8,
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              padding: '4px 8px',
              borderRadius: 4
            }}
          />
        </label>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>
          너비:
          <input
            type="number"
            value={selectedObject.size.width}
            onChange={(e) => handleSizeChange('width', parseFloat(e.target.value))}
            style={{
              marginLeft: 8,
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              padding: '4px 8px',
              borderRadius: 4
            }}
          />
        </label>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>
          높이:
          <input
            type="number"
            value={selectedObject.size.height}
            onChange={(e) => handleSizeChange('height', parseFloat(e.target.value))}
            style={{
              marginLeft: 8,
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              padding: '4px 8px',
              borderRadius: 4
            }}
          />
        </label>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>
          회전:
          <input
            type="number"
            value={selectedObject.rotation}
            onChange={(e) => handleRotationChange(parseFloat(e.target.value))}
            style={{
              marginLeft: 8,
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              padding: '4px 8px',
              borderRadius: 4
            }}
          />
        </label>
      </div>
      <button
        onClick={() => onObjectDelete(selectedObject.id)}
        style={{
          backgroundColor: theme.colors.error,
          color: '#ffffff',
          border: 'none',
          padding: '8px 16px',
          borderRadius: 4,
          cursor: 'pointer',
          width: '100%'
        }}
      >
        삭제
      </button>
    </div>
  );
};

export default PropertyPanel; 