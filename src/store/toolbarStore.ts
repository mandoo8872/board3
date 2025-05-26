import { create } from 'zustand';
import type { ToolType } from '../types/types';

interface ToolbarState {
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
  setTool: (tool: ToolType) => void;
  setPenColor: (color: string) => void;
  setPenWidth: (width: number) => void;
  setEraserWidth: (width: number) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (family: string) => void;
  setShapeType: (type: 'rectangle' | 'circle' | 'triangle') => void;
  setFillColor: (color: string) => void;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
}

export const useToolbarStore = create<ToolbarState>((set) => ({
  tool: 'pen',
  penColor: '#000000',
  penWidth: 2,
  eraserWidth: 20,
  fontSize: 16,
  fontFamily: 'Arial',
  shapeType: 'rectangle',
  fillColor: '#ffffff',
  strokeColor: '#000000',
  strokeWidth: 1,
  setTool: (tool) => set({ tool }),
  setPenColor: (color) => set({ penColor: color }),
  setPenWidth: (width) => set({ penWidth: width }),
  setEraserWidth: (width) => set({ eraserWidth: width }),
  setFontSize: (size) => set({ fontSize: size }),
  setFontFamily: (family) => set({ fontFamily: family }),
  setShapeType: (type) => set({ shapeType: type }),
  setFillColor: (color) => set({ fillColor: color }),
  setStrokeColor: (color) => set({ strokeColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width })
})); 