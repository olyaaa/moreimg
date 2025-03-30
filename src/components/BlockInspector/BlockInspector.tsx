import React from 'react';
import { Block } from '../../types';

interface BlockInspectorProps {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
}

export const BlockInspector: React.FC<BlockInspectorProps> = ({ block, onUpdate }) => {
  return (
    <div className="block-inspector">
      <h3>Properties</h3>
      <div>
        <label>X: <input type="number" value={block.x} onChange={e => onUpdate({ x: +e.target.value })} /></label>
        <label>Y: <input type="number" value={block.y} onChange={e => onUpdate({ y: +e.target.value })} /></label>
        {block.type === 'text' && (
          <label>Text: <input value={block.content} onChange={e => onUpdate({ content: e.target.value })} /></label>
        )}
      </div>
    </div>
  );
};