import React from 'react';
import { BlockComponent } from '../BlockComponent/BlockComponent';
import { Block, CanvasSettings } from '../../types';

interface MainCanvasProps {
  canvas: CanvasSettings;
  blocks: Block[];
  selectedIds: string[];
  updateBlockPosition: (id: string, x: number, y: number) => void;
  setSelectedIds: (ids: string[]) => void;
}

export const MainCanvas: React.FC<MainCanvasProps> = ({
  canvas,
  blocks,
  selectedIds,
  updateBlockPosition,
  setSelectedIds
}) => (
  <div 
    className="main-canvas"
    style={{
      width: canvas.width,
      height: canvas.height,
      backgroundColor: canvas.backgroundColor,
    }}
  >
    {blocks.map((block) => (
      <BlockComponent 
        key={block.id} 
        block={block} 
        isPreview={false}
        isSelected={selectedIds.includes(block.id)}
        onClick={() => setSelectedIds([block.id])}
        onPositionChange={updateBlockPosition}
      />
    ))}
  </div>
);