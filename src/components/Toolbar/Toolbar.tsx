import React from 'react';
import { Block } from '../../types';

interface ToolbarProps {
  onAddBlock: (type: Block['type']) => void;
  onGroup?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onAddBlock, onGroup }) => {
  return (
    <div className="toolbar">
      <button onClick={() => onAddBlock('text')}>Add Text</button>
      <button onClick={() => onAddBlock('image')}>Add Image</button>
      <button onClick={() => onAddBlock('shape')}>Add Shape</button>
      {onGroup && <button onClick={onGroup}>Group Selected</button>}
    </div>
  );
};