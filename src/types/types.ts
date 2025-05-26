export type ToolType = 'pen' | 'eraser';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface CanvasConfig {
  width: number;
  height: number;
  gridSize: number;
}

export interface Stroke {
  id: string;
  tool: 'pen' | 'eraser';
  points: Position[];
  color: string;
  width: number;
}

export interface CanvasObject {
  id: string;
  type: 'text' | 'image' | 'shape' | 'tool-button';
  position: Position;
  size: Size;
  rotation: number;
  overlapRule: 'allow' | 'displace';
  zIndex: number;
  lastModified: number;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  shapeType?: 'rectangle' | 'circle' | 'triangle';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  imageUrl?: string;
  toolType?: ToolType;
}

export interface CanvasState {
  canvas: CanvasConfig;
  objects: CanvasObject[];
  strokes: Stroke[];
  toolButtons: CanvasObject[];
  lastModified: string;
}

export interface ViewConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ToolbarState {
  selectedTool: ToolType;
  penColor: string;
  penWidth: number;
  eraserWidth: number;
  fontSize: number;
  fontFamily: string;
  shapeType: 'rectangle' | 'circle' | 'triangle';
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
}

export interface ToolButtonStyle {
  backgroundColor: string;
  iconColor: string;
  borderColor: string;
  borderWidth: number;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  shadowColor: string;
  shadowBlur: number;
  size: number;
  iconSize: number;
}

export const __vite_force_retain = 1;
export const TOOL_TYPE_TRICK = 1;

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface Theme {
  mode: 'light' | 'dark';
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    text: string;
    border: string;
    error: string;
    success: string;
  };
}

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: '#f0f0f0',
    surface: '#ffffff',
    primary: '#2196f3',
    secondary: '#757575',
    text: '#000000',
    border: '#e0e0e0',
    error: '#f44336',
    success: '#4caf50'
  }
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: '#121212',
    surface: '#1e1e1e',
    primary: '#90caf9',
    secondary: '#bdbdbd',
    text: '#ffffff',
    border: '#424242',
    error: '#ef5350',
    success: '#66bb6a'
  }
};
