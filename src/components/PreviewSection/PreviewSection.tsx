import React from 'react';
import { BlockComponent } from '../BlockComponent/BlockComponent';
import { Block, CanvasSettings } from '../../types';

interface PreviewSectionProps {
  previewCanvasBlocks: Block[][];
  canvas: CanvasSettings;
  PREVIEW_SCALE: number;
  scrollPreviews: (direction: 'left' | 'right') => void;
}

export const PreviewSection: React.FC<PreviewSectionProps> = ({
  previewCanvasBlocks,
  canvas,
  PREVIEW_SCALE,
  scrollPreviews
}) => (
  <div className="previews-section">
    <h3>Превью данных</h3>
    <div className="previews-nav">
      <button className="previews-arrow left" onClick={(e) => scrollPreviews('left')}>
        &lt;
      </button>
      
      <div className="previews-container">
        <div className="previews-scroller">
          {previewCanvasBlocks.map((blocks, index) => (
            <PreviewCanvas 
              key={`preview-${index}`} 
              blocks={blocks} 
              canvas={canvas} 
              PREVIEW_SCALE={PREVIEW_SCALE} 
              index={index}
            />
          ))}
        </div>
      </div>

      <button className="previews-arrow right" onClick={(e) => scrollPreviews('right')}>
        &gt;
      </button>
    </div>
  </div>
);

const PreviewCanvas: React.FC<{blocks: Block[], canvas: CanvasSettings, PREVIEW_SCALE: number, index: number}> = ({
  blocks, canvas, PREVIEW_SCALE, index
}) => (
  <div className="preview-canvas-wrapper">
    <div 
      className="preview-canvas"
      style={{
        width: canvas.width * PREVIEW_SCALE,
        height: canvas.height * PREVIEW_SCALE,
        backgroundColor: canvas.backgroundColor,
        position: 'relative'
      }}
    >
      {blocks.map((block) => (
        <BlockComponent 
          key={block.id} 
          block={block}
          isPreview={true}
          onClick={() => {}}
        />
      ))}
    </div>
    <div className="preview-label">Строка {index + 1}</div>
  </div>
);