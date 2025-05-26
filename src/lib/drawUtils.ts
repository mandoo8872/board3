import type { Point, Stroke, CanvasObject, TextObject, ImageObject, ShapeObject, ToolButtonObject } from '../types/types';

export const drawStroke = (
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  scale: number
) => {
  if (stroke.points.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x * scale, stroke.points[0].y * scale);

  for (let i = 1; i < stroke.points.length; i++) {
    ctx.lineTo(stroke.points[i].x * scale, stroke.points[i].y * scale);
  }

  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.width * scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
};

export const drawText = (
  ctx: CanvasRenderingContext2D,
  textObj: TextObject,
  scale: number
) => {
  ctx.save();
  ctx.translate(
    textObj.position.x * scale,
    textObj.position.y * scale
  );
  ctx.rotate(textObj.rotation);
  
  ctx.font = `${textObj.fontSize * scale}px ${textObj.fontFamily}`;
  ctx.fillStyle = textObj.color;
  ctx.fillText(textObj.content, 0, 0);
  
  ctx.restore();
};

export const drawShape = (
  ctx: CanvasRenderingContext2D,
  shapeObj: ShapeObject,
  scale: number
) => {
  ctx.save();
  ctx.translate(
    shapeObj.position.x * scale,
    shapeObj.position.y * scale
  );
  ctx.rotate(shapeObj.rotation);

  ctx.fillStyle = shapeObj.fill;
  ctx.strokeStyle = shapeObj.stroke;
  ctx.lineWidth = shapeObj.strokeWidth * scale;

  const width = shapeObj.size.width * scale;
  const height = shapeObj.size.height * scale;

  switch (shapeObj.shapeType) {
    case 'rectangle':
      ctx.beginPath();
      ctx.rect(-width / 2, -height / 2, width, height);
      break;
    case 'circle':
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(width, height) / 2, 0, Math.PI * 2);
      break;
    case 'triangle':
      ctx.beginPath();
      ctx.moveTo(0, -height / 2);
      ctx.lineTo(width / 2, height / 2);
      ctx.lineTo(-width / 2, height / 2);
      ctx.closePath();
      break;
  }

  ctx.fill();
  ctx.stroke();
  ctx.restore();
};

export const drawToolButton = (
  ctx: CanvasRenderingContext2D,
  buttonObj: ToolButtonObject,
  scale: number
) => {
  ctx.save();
  ctx.translate(
    buttonObj.position.x * scale,
    buttonObj.position.y * scale
  );
  ctx.rotate(buttonObj.rotation);

  const size = Math.min(
    buttonObj.size.width,
    buttonObj.size.height
  ) * scale;

  // Draw button background
  ctx.beginPath();
  ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2 * scale;
  ctx.stroke();

  // Draw icon (simplified)
  ctx.fillStyle = '#000000';
  if (buttonObj.toolType === 'pen') {
    ctx.beginPath();
    ctx.moveTo(-size / 4, size / 4);
    ctx.lineTo(size / 4, -size / 4);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, size / 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

export const drawObject = (
  ctx: CanvasRenderingContext2D,
  obj: CanvasObject,
  scale: number
) => {
  ctx.save();
  ctx.translate(
    (obj.position.x + obj.size.width / 2) * scale,
    (obj.position.y + obj.size.height / 2) * scale
  );
  ctx.rotate(obj.rotation);

  switch (obj.type) {
    case 'text':
      if (obj.content) {
        ctx.font = `${obj.fontSize || 16}px ${obj.fontFamily || 'Arial'}`;
        ctx.fillStyle = obj.color || '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(obj.content, 0, 0);
      }
      break;

    case 'shape':
      ctx.fillStyle = obj.fill || '#ffffff';
      ctx.strokeStyle = obj.stroke || '#000000';
      ctx.lineWidth = (obj.strokeWidth || 1) * scale;

      const width = obj.size.width * scale;
      const height = obj.size.height * scale;

      switch (obj.shapeType) {
        case 'rectangle':
          ctx.fillRect(-width / 2, -height / 2, width, height);
          ctx.strokeRect(-width / 2, -height / 2, width, height);
          break;
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, Math.min(width, height) / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          break;
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(0, -height / 2);
          ctx.lineTo(width / 2, height / 2);
          ctx.lineTo(-width / 2, height / 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
      }
      break;

    case 'image':
      if (obj.imageUrl) {
        const img = new Image();
        img.src = obj.imageUrl;
        img.onload = () => {
          ctx.drawImage(
            img,
            -obj.size.width * scale / 2,
            -obj.size.height * scale / 2,
            obj.size.width * scale,
            obj.size.height * scale
          );
        };
      }
      break;

    case 'tool-button':
      drawToolButton(ctx, obj as ToolButtonObject, scale);
      break;
  }

  ctx.restore();
};

export const drawImage = (
  ctx: CanvasRenderingContext2D,
  imageObj: ImageObject,
  scale: number
) => {
  const img = new Image();
  img.src = imageObj.src;
  
  img.onload = () => {
    ctx.save();
    ctx.translate(
      imageObj.position.x * scale,
      imageObj.position.y * scale
    );
    ctx.rotate(imageObj.rotation);

    const width = imageObj.size.width * scale;
    const height = imageObj.size.height * scale;

    ctx.drawImage(
      img,
      -width / 2,
      -height / 2,
      width,
      height
    );
    
    ctx.restore();
  };
};

export const calculateScale = (
  canvasWidth: number,
  canvasHeight: number,
  containerWidth: number,
  containerHeight: number
): number => {
  const scaleX = containerWidth / canvasWidth;
  const scaleY = containerHeight / canvasHeight;
  return Math.min(scaleX, scaleY);
};

export const snapToGrid = (
  point: Point,
  gridSize: number
): Point => {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize
  };
}; 