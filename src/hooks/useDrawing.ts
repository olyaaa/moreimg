// src/hooks/useDrawing.ts
import { useState, useRef } from 'react';

export const useDrawing = () => {
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [color, setColor] = useState('#000000');
  const isDrawing = useRef(false);

  const handleMouseDown = () => {
    isDrawing.current = true;
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  return { tool, color, setTool, setColor, handleMouseDown, handleMouseUp };
};