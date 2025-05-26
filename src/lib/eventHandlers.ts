import type { Point, Stroke, CanvasObject, ToolType, ToolButtonObject } from '../types/types';
import { snapToGrid } from './drawUtils';

export const getCanvasPoint = (
  event: MouseEvent | TouchEvent,
  canvas: HTMLCanvasElement,
  scale: number
): Point => {
  const rect = canvas.getBoundingClientRect();
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

  return {
    x: (clientX - rect.left) / scale,
    y: (clientY - rect.top) / scale
  };
};

export const isPointInObject = (
  point: Point,
  obj: CanvasObject
): boolean => {
  const halfWidth = obj.size.width / 2;
  const halfHeight = obj.size.height / 2;

  // 회전을 고려한 점의 상대 위치 계산
  const dx = point.x - obj.position.x;
  const dy = point.y - obj.position.y;
  const rotatedX = dx * Math.cos(-obj.rotation) - dy * Math.sin(-obj.rotation);
  const rotatedY = dx * Math.sin(-obj.rotation) + dy * Math.cos(-obj.rotation);

  return (
    rotatedX >= -halfWidth &&
    rotatedX <= halfWidth &&
    rotatedY >= -halfHeight &&
    rotatedY <= halfHeight
  );
};

export const handleObjectOverlap = (
  objects: CanvasObject[],
  newObject: CanvasObject
): CanvasObject[] => {
  const overlappingObjects = objects.filter(obj => {
    if (obj.overlapRule === 'overlap') return false;
    
    const objRight = obj.position.x + obj.size.width;
    const objBottom = obj.position.y + obj.size.height;
    const newRight = newObject.position.x + newObject.size.width;
    const newBottom = newObject.position.y + newObject.size.height;

    return !(
      objRight < newObject.position.x ||
      obj.position.x > newRight ||
      objBottom < newObject.position.y ||
      obj.position.y > newBottom
    );
  });

  if (overlappingObjects.length === 0) {
    return [...objects, newObject];
  }

  const displacedObjects = overlappingObjects.map(obj => ({
    ...obj,
    position: {
      x: obj.position.x,
      y: obj.position.y - 20 // 위로 20px 이동
    }
  }));

  return [...displacedObjects, newObject];
};

export const createStroke = (
  points: Point[],
  tool: ToolType,
  color: string = '#000000',
  width: number = 2
): Stroke => {
  return {
    id: Date.now().toString(),
    tool,
    points,
    color,
    width
  };
};

export const createToolButton = (
  position: Point,
  toolType: ToolType
): ToolButtonObject => {
  return {
    id: Date.now().toString(),
    type: 'tool-button',
    position,
    size: { width: 50, height: 50 },
    rotation: 0,
    overlapRule: 'allow',
    zIndex: 1000,
    toolType,
    icon: toolType === 'pen' ? '✏️' : '🧹'
  };
};

export const handleDragStart = (
  event: MouseEvent | TouchEvent,
  canvas: HTMLCanvasElement,
  scale: number,
  gridSize: number
): Point => {
  const point = getCanvasPoint(event, canvas, scale);
  return snapToGrid(point, gridSize);
};

export const handleDrag = (
  event: MouseEvent | TouchEvent,
  canvas: HTMLCanvasElement,
  scale: number,
  gridSize: number,
  startPoint: Point
): Point => {
  const currentPoint = getCanvasPoint(event, canvas, scale);
  const snappedPoint = snapToGrid(currentPoint, gridSize);
  
  return {
    x: snappedPoint.x - startPoint.x,
    y: snappedPoint.y - startPoint.y
  };
}; 