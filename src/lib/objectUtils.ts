import type { CanvasObject, Position, Size } from '../types/types';

// 그리드 스냅
export const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

// 객체 위치 스냅
export const snapPositionToGrid = (position: Position, gridSize: number): Position => {
  return {
    x: snapToGrid(position.x, gridSize),
    y: snapToGrid(position.y, gridSize)
  };
};

// 객체 크기 스냅
export const snapSizeToGrid = (size: Size, gridSize: number): Size => {
  return {
    width: snapToGrid(size.width, gridSize),
    height: snapToGrid(size.height, gridSize)
  };
};

// 객체 충돌 감지
export const checkCollision = (obj1: CanvasObject, obj2: CanvasObject): boolean => {
  const obj1Right = obj1.position.x + obj1.size.width;
  const obj1Bottom = obj1.position.y + obj1.size.height;
  const obj2Right = obj2.position.x + obj2.size.width;
  const obj2Bottom = obj2.position.y + obj2.size.height;

  return !(
    obj1Right < obj2.position.x ||
    obj1.position.x > obj2Right ||
    obj1Bottom < obj2.position.y ||
    obj1.position.y > obj2Bottom
  );
};

// 객체 중첩 처리
export const handleObjectOverlap = (
  newObject: CanvasObject,
  existingObjects: CanvasObject[],
  gridSize: number
): CanvasObject[] => {
  const updatedObjects = [...existingObjects];
  const overlappingObjects = updatedObjects.filter(obj => 
    obj.id !== newObject.id && checkCollision(newObject, obj)
  );

  overlappingObjects.forEach(obj => {
    if (obj.overlapRule === 'displace' && newObject.overlapRule === 'displace') {
      // 두 객체가 모두 displace인 경우, 기존 객체를 위로 이동
      obj.position.y -= gridSize;
    }
  });

  return updatedObjects;
};

// 객체 생성
export const createObject = (
  type: CanvasObject['type'],
  position: Position,
  size: Size,
  gridSize: number,
  options: Partial<CanvasObject> = {}
): CanvasObject => {
  const snappedPosition = snapPositionToGrid(position, gridSize);
  const snappedSize = snapSizeToGrid(size, gridSize);

  const baseObject: CanvasObject = {
    id: Date.now().toString(),
    type,
    position: snappedPosition,
    size: snappedSize,
    rotation: 0,
    overlapRule: 'displace',
    zIndex: 0,
    lastModified: Date.now()
  };

  // 타입별 기본 속성 설정
  switch (type) {
    case 'text':
      return {
        ...baseObject,
        content: '새 텍스트',
        fontSize: 24,
        fontFamily: 'Arial',
        color: '#000000',
        ...options
      };
    case 'shape':
      return {
        ...baseObject,
        shapeType: 'rectangle',
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 2,
        ...options
      };
    case 'tool-button':
      return {
        ...baseObject,
        toolType: 'pen',
        ...options
      };
    default:
      return { ...baseObject, ...options };
  }
};

// 객체 이동
export const moveObject = (
  object: CanvasObject,
  newPosition: Position,
  gridSize: number,
  canvasSize: Size
): CanvasObject => {
  const snappedPosition = snapPositionToGrid(newPosition, gridSize);
  
  // 캔버스 경계 체크
  const boundedPosition = {
    x: Math.max(0, Math.min(snappedPosition.x, canvasSize.width - object.size.width)),
    y: Math.max(0, Math.min(snappedPosition.y, canvasSize.height - object.size.height))
  };

  return {
    ...object,
    position: boundedPosition,
    lastModified: Date.now()
  };
};

// 객체 크기 조정
export const resizeObject = (
  object: CanvasObject,
  newSize: Size,
  gridSize: number,
  canvasSize: Size
): CanvasObject => {
  const snappedSize = snapSizeToGrid(newSize, gridSize);
  
  // 최소 크기 제한
  const minSize = { width: gridSize, height: gridSize };
  const boundedSize = {
    width: Math.max(minSize.width, Math.min(snappedSize.width, canvasSize.width - object.position.x)),
    height: Math.max(minSize.height, Math.min(snappedSize.height, canvasSize.height - object.position.y))
  };

  return {
    ...object,
    size: boundedSize,
    lastModified: Date.now()
  };
};

// 객체 회전
export const rotateObject = (
  object: CanvasObject,
  angle: number
): CanvasObject => {
  return {
    ...object,
    rotation: angle % 360,
    lastModified: Date.now()
  };
}; 