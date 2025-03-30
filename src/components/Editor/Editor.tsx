// src/components/Editor/Editor.tsx
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Toolbar } from '../Toolbar/Toolbar';
import { BlockComponent } from '../BlockComponent/BlockComponent';
import { Block } from '../../types';

export const Editor = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  const handleAddBlock = (type: Block['type']) => {
    const newBlock: Block = {
      id: uuidv4(), // Исправлено: используем uuidv4
      type,
      x: 100,
      y: 100,
      content: type === 'text' ? '{{example}}' : '',
      url: type === 'image' ? '{{image_url}}' : '',
      isConstant: false
    };
    setBlocks([...blocks, newBlock]);
  };

  return (
    <div className="editor">
      <Toolbar onAddBlock={handleAddBlock} />
      <div className="canvas">
        {blocks.map(block => (
          <BlockComponent key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
};