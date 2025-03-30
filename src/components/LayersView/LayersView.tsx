import React from 'react';
import { Block } from '../../types';

// Добавляем inline-компонент вместо отдельного файла
const BlockCoords = ({ block }: { block: Block }) => (
  <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
    <span>{block.type}</span>
    <span>X:{block.x}</span>
    <span>Y:{block.y}</span>
    <span>Z:{block.zIndex}</span>
  </div>
);

interface LayersViewProps {
  blocks: Block[];
  onSelect: (id: string) => void;
}

export const LayersView: React.FC<LayersViewProps> = ({ blocks, onSelect }) => {
  return (
    <div style={{ 
      border: '1px solid #ddd', 
      padding: '8px',
      borderRadius: '4px',
      background: '#f9f9f9'
    }}>
      <h3 style={{ marginTop: 0 }}>Порядок блоков</h3>
      {blocks
        .sort((a, b) => b.zIndex - a.zIndex)
        .map(block => (
          <div
            key={block.id}
            style={{
              padding: '8px',
              margin: '4px 0',
              background: '#fff',
              cursor: 'pointer',
              border: '1px solid #eee',
              borderRadius: '3px'
            }}
            onClick={() => onSelect(block.id)}
          >
            <BlockCoords block={block} />
          </div>
        ))}
    </div>
  );
};