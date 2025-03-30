import React, { useState, useRef, useEffect } from 'react';
import { Block } from '../../types';
import { DEFAULT_VARIABLES } from '../../constants';

interface BlockComponentProps {
  block: Block;
  isSelected: boolean;
  onClick: () => void;
  onPositionChange: (id: string, x: number, y: number) => void;
}

export const BlockComponent = ({ 
  block, 
  isSelected, 
  onClick, 
  onPositionChange 
}: BlockComponentProps) => {
  const [position, setPosition] = useState({ x: block.x, y: block.y });
  const [isDragging, setIsDragging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Обработчики для перемещения
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Только левая кнопка мыши
    setIsDragging(true);
    onClick();
    e.stopPropagation();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - (ref.current?.offsetWidth || 0) / 2,
      y: e.clientY - (ref.current?.offsetHeight || 0) / 2
    });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onPositionChange(block.id, position.x, position.y);
    }
  };

  // Подписываемся на события мыши
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Рендер содержимого блока
  const renderContent = () => {
    switch (block.type) {
      case 'text':
        const text = block.isConstant 
          ? block.content 
          : replaceVariables(block.content || '', DEFAULT_VARIABLES);
        return <div>{text}</div>;

      case 'image':
        const urlKey = block.url?.replace(/\{\{|\}\}/g, '') || '';
        const src = block.isConstant 
          ? block.url 
          : DEFAULT_VARIABLES[urlKey as keyof typeof DEFAULT_VARIABLES] || '';
        return <img src={src} alt="" style={{ maxWidth: '100%' }} />;

      default:
        return <div>Unknown block type</div>;
    }
  };

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        border: isSelected ? '2px solid blue' : '1px dashed gray',
        padding: '8px',
        cursor: isDragging ? 'grabbing' : 'grab',
        backgroundColor: 'white',
        userSelect: 'none',
        zIndex: isDragging ? 1000 : 1
      }}
      onMouseDown={handleMouseDown}
    >
      {renderContent()}
    </div>
  );
};

// Вспомогательная функция
const replaceVariables = (text: string, vars: Record<string, string>) => {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || '');
};