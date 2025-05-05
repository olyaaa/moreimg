import React, { useState, useRef, useEffect } from 'react';
import { Block, Layer } from '../../types';
import { DEFAULT_VARIABLES } from '../../constants';

interface BlockComponentProps {
  block: Block;
  isSelected?: boolean;
  onClick: (e: React.MouseEvent) => void;
  onPositionChange?: (id: string, x: number, y: number) => void;
  isPreview?: boolean;
  rowData?: Record<string, string>;
  layers?: Layer[];
  isExporting?: boolean;
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
  onClick, 
  onPositionChange = () => {},
  isPreview = false,
  rowData = {},
  layers = [] // Добавляем значение по умолчанию
}) => {
  const [position, setPosition] = useState({ x: block.x, y: block.y });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  
  // Проверки видимости и блокировки теперь внутри компонента
  const isVisible = block.layerId 
    ? layers.find(l => l.id === block.layerId)?.visible ?? true
    : true;

  const isLocked = block.layerId 
    ? layers.find(l => l.id === block.layerId)?.locked ?? false
    : false;

  const isImageUrl = (url: string) => {
    return /^https?:\/\/.+(\.(jpg|jpeg|png|webp|gif|svg))(\?.+)?$/i.test(url?.trim() || '');
  };

  // Обновляем позицию при изменении пропсов, если не в процессе перетаскивания
  useEffect(() => {
    if (!isDragging) {
      setPosition({ x: block.x, y: block.y });
    }
  }, [block.x, block.y, isDragging]);

  // Подписка на события мыши для перемещения
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - dragStartPos.current.x;
      const newY = e.clientY - dragStartPos.current.y;
      setPosition({ x: newX, y: newY });
      e.preventDefault(); // Предотвращаем выделение текста при перетаскивании
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        onPositionChange(block.id, position.x, position.y);
      }
    };
    
    if (isDragging) {
      // Добавляем обработчики только когда перетаскиваем
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    // Очистка обработчиков при размонтировании или окончании перетаскивания
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, block.id, position, onPositionChange]);

  // Обработчик для начала перетаскивания
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPreview || block.isConstant || e.button !== 0 || isLocked) return;    
    setIsDragging(true);
    onClick(e);
    
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    
    e.stopPropagation();
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      e.stopPropagation(); // Предотвращаем всплытие события только если не перетаскиваем
      onClick(e);
    }
  };

  // Рендер содержимого блока
  const renderContent = () => {
    if (!isVisible) return null; // Не рендерим если слой скрыт
    
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
            borderRadius: block.shapeType === 'circle' ? '50%' : '0',
            clipPath: block.shapeType === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
            transform: `rotate(${block.rotation || 0}deg)`
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
      // В функции renderContent() для линий:
      case 'line': {
        const lineStyle = {
          solid: 'solid',
          dashed: '3px dashed', // Исправленный стиль для dashed
          dotted: 'dotted'
        }[block.lineType || 'solid'];

        const renderEndMarker = (position: 'start' | 'end') => {
          if (!block.lineEnds || block.lineEnds === 'none') return null;
          if ((block.lineEnds === 'start' && position === 'end') || 
              (block.lineEnds === 'end' && position === 'start')) return null;

          const baseStyle: React.CSSProperties = {
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: block.color || '#000000'
          };

          const positionStyle = position === 'start' 
            ? { left: `-${(block.lineWidth || 2) * 2}px` } 
            : { right: `-${(block.lineWidth || 2) * 2}px` };

          switch (block.lineEndType) {
            case 'circle':
              return (
                <div style={{
                  ...baseStyle,
                  ...positionStyle,
                  width: `${(block.lineWidth || 2) * 4}px`,
                  height: `${(block.lineWidth || 2) * 4}px`,
                  borderRadius: '50%'
                }} />
              );
            case 'square':
              return (
                <div style={{
                  ...baseStyle,
                  ...positionStyle,
                  width: `${(block.lineWidth || 2) * 4}px`,
                  height: `${(block.lineWidth || 2) * 4}px`
                }} />
              );
            case 'arrow':
            default:
              return (
                <div style={{
                  ...baseStyle,
                  ...positionStyle,
                  width: '0',
                  height: '0',
                  borderTop: `${(block.lineWidth || 2) * 2.5}px solid transparent`,
                  borderBottom: `${(block.lineWidth || 2) * 2.5}px solid transparent`,
                  backgroundColor: 'transparent',
                  ...(position === 'start' 
                    ? { 
                        borderRight: `${(block.lineWidth || 2) * 4}px solid ${block.color || '#000000'}`,
                        left: `-${(block.lineWidth || 2) * 4}px`
                      }
                    : { 
                        borderLeft: `${(block.lineWidth || 2) * 4}px solid ${block.color || '#000000'}`,
                        right: `-${(block.lineWidth || 2) * 4}px`
                      })
                }} />
              );
          }
        };

        return (
          <div style={{
            width: `${block.length || 100}px`,
            height: `${block.lineWidth || 2}px`,
            position: 'relative',
            transform: `rotate(${block.rotation || 0}deg)`,
            transformOrigin: '0 50%'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderBottom: `${block.lineWidth || 2}px ${lineStyle} ${block.color || '#000000'}`,
              boxSizing: 'border-box'
            }} />
            {renderEndMarker('start')}
            {renderEndMarker('end')}
          </div>
        );
      }
      default:
        return <div>Unknown block type: {block.type}</div>;
    }
  };

  // Стили блока
  const blockStyles: React.CSSProperties = {
    position: 'absolute',
    left: position.x,
    top: position.y,
    zIndex: isDragging ? 1000 : block.zIndex || 1,
    transform: `rotate(${block.rotation || 0}deg)`,
    transformOrigin: block.type === 'line' ? '0 50%' : 'center',
    pointerEvents: isPreview || isLocked ? 'none' : 'auto',
    display: isVisible ? 'block' : 'none',
    // Специфичные стили для разных типов блоков
    ...(block.type === 'line' && {
      width: `${block.length || 100}px`,
      height: `${block.lineWidth || 2}px`,
      margin: 0,
      padding: 0
    }),
    ...(block.type !== 'line' && {
      padding: 0,
      margin: 0,
      cursor: isPreview || block.isConstant || isLocked ? 'default' : isDragging ? 'grabbing' : 'grab'
    })
  };

  // Добавляем обводку для выбранного блока
  if (isSelected && !isPreview) {
    if (block.type === 'line') {
      const selectionStyle: React.CSSProperties = {
        outline: '1px solid #3a7bd5',
        outlineOffset: '1px',
        boxShadow: 'none',
        border: 'none',
        padding: 0,
        width: `${block.length || 100}px`,
        height: `${block.lineWidth || 2}px`,
        marginRight: (block.lineEnds === 'end' || block.lineEnds === 'both') ? '8px' : '0',
        marginLeft: (block.lineEnds === 'start' || block.lineEnds === 'both') ? '8px' : '0'
      };
      Object.assign(blockStyles, selectionStyle);
    } else {
      blockStyles.boxShadow = '0 0 0 1px #3a7bd5';
    }
  }

  return (
    <div
      className={`block-component ${isSelected ? 'selected' : ''} ${isPreview ? 'preview' : ''}`}
      ref={ref}
      style={blockStyles}
      onMouseDown={handleMouseDown}
      data-block-id={block.id}
      data-block-type={block.type}
      onClick={handleClick}
    >
      {renderContent()}
    </div>
  );
};