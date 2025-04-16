import React, { useState, useRef, useEffect } from 'react';
import { Block } from '../../types';
import { DEFAULT_VARIABLES } from '../../constants';

interface BlockComponentProps {
  block: Block;
  isSelected?: boolean;
  onClick?: () => void;
  onPositionChange?: (id: string, x: number, y: number) => void;
  isPreview?: boolean;
  rowData?: Record<string, string>;
}

// Вспомогательная функция для замены переменных
const replaceVariables = (text: string = '', vars: Record<string, string> = {}) => {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || `${key}`);
};

const getBackground = (block: Block) => {
  if (block.fillType === 'gradient' && block.gradient) {
    if (block.gradient.type === 'linear') {
      return `linear-gradient(${block.gradient.direction || 0}deg, ${block.gradient.colors.join(', ')})`;
    }
    return `radial-gradient(${block.gradient.colors.join(', ')})`;
  }
  return block.color || 'transparent';
};

export const BlockComponent: React.FC<BlockComponentProps> = ({ 
  block, 
  isSelected = false, 
  onClick = () => {}, 
  onPositionChange = () => {},
  isPreview = false,
  rowData = {}
}) => {
  const [position, setPosition] = useState({ x: block.x, y: block.y });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const isImageUrl = (url: string) => {
    return /^https?:\/\/.+(\.(jpg|jpeg|png|webp|gif|svg))(\?.+)?$/i.test(url?.trim() || '');
  };

  // Обновляем позицию при изменении пропсов
  useEffect(() => {
    setPosition({ x: block.x, y: block.y });
  }, [block.x, block.y]);

  // Обработчики для перемещения
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPreview || block.isConstant || e.button !== 0) return;
    
    setIsDragging(true);
    onClick();
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    e.stopPropagation();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStartPos.current.x;
    const newY = e.clientY - dragStartPos.current.y;
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onPositionChange(block.id, position.x, position.y);
    }
  };

  // Подписка на события мыши
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Рендер содержимого блока
  const renderContent = () => {
    switch (block.type) {
      case 'text': {
        const text = block.isConstant 
          ? block.content 
          : replaceVariables(block.content || '', DEFAULT_VARIABLES);
        
        return (
          <div style={{ 
            color: block.color || '#000000',
            fontSize: block.fontSize || 16,
            whiteSpace: 'pre-wrap'
          }}>
            {text}
          </div>
        );
      }
      case 'image': {
        let src = block.url || '';
        if (block.isConstant) {
          src = block.url || '';
        } else {
          // Извлекаем ключ из {{key}}
          const keyMatch = block.url?.match(/\{\{(\w+)\}\}/);
          const key = keyMatch?.[1] || '';
          src = rowData[key] || block.url || '';
        }

        if (!isImageUrl(src)) {
          src = 'https://via.placeholder.com/200?text=No+Image';
        }

        return (
          <img 
            src={src} 
            alt="" 
            style={{ 
              width: block.width ? `${block.width}px` : '100%',
              height: block.height ? `${block.height}px` : 'auto',
              objectFit: 'contain'
            }} 
          />
        );
      }
      case 'shape':
        return (
          <div style={{
            width: `${block.width || 100}px`,
            height: `${block.height || 100}px`,
            backgroundColor: block.color || '#cccccc',
            border: '1px solid #999999',
            borderRadius: block.shapeType === 'circle' ? '50%' : '0'
          }} />
        );
      case 'group':
        return (
          <div style={{
            border: '2px dashed #666',
            padding: '8px',
            backgroundColor: 'rgba(200, 200, 255, 0.2)'
          }}>
            Group ({block.children?.length || 0} items)
          </div>
        );
      default:
        return <div>Unknown block type: {block.type}</div>;
    }
  };

  // Стили блока
  const blockStyles: React.CSSProperties = {
    position: 'absolute',
    left: position.x,
    top: position.y,
    padding: block.type === 'text' ? '4px 8px' : '0',
    cursor: isPreview || block.isConstant ? 'default' : isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    zIndex: isDragging ? 1000 : block.zIndex || 1,
    transform: isDragging ? 'scale(1.02)' : 'none',
    transition: isDragging ? 'none' : 'transform 0.1s ease',
    pointerEvents: isPreview ? 'none' : 'auto'
  };

  // Добавляем обводку для выбранного блока
  if (isSelected && !isPreview) {
    blockStyles.boxShadow = '0 0 0 2px #3a7bd5';
  }

  return (
    <div
      ref={ref}
      style={blockStyles}
      onMouseDown={handleMouseDown}
      data-block-id={block.id}
      data-block-type={block.type}
    >
      {renderContent()}
    </div>
  );
};