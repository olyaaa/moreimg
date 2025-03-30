import React from 'react';
import { Stage, Layer } from 'react-konva';
import { useDrawing } from '../../hooks/useDrawing';

export const Canvas = () => {
  const { tool, color, handleMouseDown, handleMouseUp } = useDrawing();

  return (
    <Stage 
      width={window.innerWidth} 
      height={window.innerHeight}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <Layer>
        {/* Пока оставляем пустым */}
      </Layer>
    </Stage>
  );
};