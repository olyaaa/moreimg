// src/components/PropertiesPanel/PropertiesPanel.tsx
import React from 'react';
import { Block } from '../../types';

interface Props {
  block: Block | null;
  onUpdate: (block: Block) => void;
}

export const PropertiesPanel = ({ block, onUpdate }: Props) => {
  if (!block) return <div>Select a block</div>;

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px' }}>
      <h3>{block.type} Properties</h3>
      
      {block.type === 'text' && (
        <textarea
          value={block.content}
          onChange={(e) => onUpdate({ ...block, content: e.target.value })}
        />
      )}

      {block.type === 'image' && (
        <input
          type="text"
          value={block.url}
          onChange={(e) => onUpdate({ ...block, url: e.target.value })}
          placeholder="Image URL or {{variable}}"
        />
      )}

      <label>
        <input
          type="checkbox"
          checked={block.isConstant}
          onChange={(e) => onUpdate({ ...block, isConstant: e.target.checked })}
        />
        Is Constant
      </label>
    </div>
  );
};