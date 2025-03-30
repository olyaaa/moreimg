// src/components/Toolbar/Toolbar.tsx
import React from 'react';

/*interface ToolbarProps {
  onAddBlock: (type: 'text' | 'image' | 'chart' | 'shape') => void;
}*/

interface ToolbarProps {
  onAddBlock: (type: Block['type']) => void;
  onGroup?: () => void; // Делаем необязательным
}

export const Toolbar: React.FC<ToolbarProps> = ({ onAddBlock, onGroup }) => {
  return (
    <div className="toolbar">
      <button onClick={() => onAddBlock('text')}>Add Text</button>
      <button onClick={() => onAddBlock('image')}>Add Image</button>
      {onGroup && <button onClick={onGroup}>Group Selected</button>}
    </div>
  );
};

/*export const Toolbar: React.FC<ToolbarProps> = ({ onAddBlock }) => {
  const blockTypes = ['text', 'image', 'chart', 'shape'] as const;

  return (
    <div className="toolbar">
      {blockTypes.map(type => (
        <button 
          key={type} 
          onClick={() => onAddBlock(type)}
        >
          {type}
        </button>
      ))}
    </div>
  );
};*/