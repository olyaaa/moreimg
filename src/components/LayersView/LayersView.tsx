import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Block } from '../../types';

interface LayersViewProps {
  blocks: Block[];
  onSelect: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

interface BlockCoordsProps {
  block: Block;
}

const BlockCoords = ({ block }: BlockCoordsProps) => (
  <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
    <span>{block.type}</span>
    <span>X:{block.x}</span>
    <span>Y:{block.y}</span>
    <span>Z:{block.zIndex}</span>
  </div>
);

export const LayersView: React.FC<LayersViewProps> = ({ blocks, onSelect, onReorder }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const [, drop] = useDrop<{ id: string; index: number }, void, unknown>({
    accept: 'BLOCK',
    hover: (item, monitor) => {
      if (!monitor.isOver({ shallow: true })) return;

      const dragIndex = item.index;
      const hoverIndex = blocks.findIndex(b => b.id === item.id);

      if (dragIndex === hoverIndex) return;

      onReorder(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drop(ref); // Оборачиваем ref функцией drop

  return (
    <div
      ref={ref}
      style={{
        padding: '8px',
        borderRadius: '4px',
      }}
    >
      <h3 style={{ marginTop: 0 }}>Порядок блоков</h3>
      {blocks
        .sort((a, b) => b.zIndex - a.zIndex)
        .map((block, index) => (
          <DraggableBlock key={block.id} block={block} index={index} onSelect={onSelect} />
        ))}
    </div>
  );
};

interface DraggableBlockProps {
  block: Block;
  index: number;
  onSelect: (id: string) => void;
}

const DraggableBlock: React.FC<DraggableBlockProps> = ({ block, index, onSelect }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: 'BLOCK',
    item: { id: block.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'BLOCK',
    hover: (item: { id: string, index: number }, monitor) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;
      if (!monitor.isOver({ shallow: true })) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{
        padding: '8px',
        margin: '4px 0',
        //background: '#fff',
        cursor: 'move',
        border: '1px solid #eee',
        borderRadius: '3px',
        opacity: isDragging ? 0.5 : 1,
      }}
      onClick={() => onSelect(block.id)}
    >
      <BlockCoords block={block} />
    </div>
  );
};