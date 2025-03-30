// src/components/Toolbar/Toolbar.tsx
import React from 'react';

type ToolbarProps = {
  tool: 'brush' | 'eraser';
  setTool: (tool: 'brush' | 'eraser') => void;
};

/*export const Toolbar = ({ tool, setTool }: ToolbarProps) => {
  return (
    <div className="toolbar">
      <button onClick={() => setTool('brush')} className={tool === 'brush' ? 'active' : ''}>
        Кисть
      </button>
      <button onClick={() => setTool('eraser')} className={tool === 'eraser' ? 'active' : ''}>
        Ластик
      </button>
    </div>
  );
};*/

// src/components/Toolbar/Toolbar.tsx
export const Toolbar = ({ onAddBlock }) => {
  const blockTypes = ['text', 'image', 'chart', 'shape'] as const;

  return (
    <div className="toolbar">
      {blockTypes.map(type => (
        <button 
          key={type} 
          onClick={() => onAddBlock(type)}
        >
          {type} {/* Текст на кнопке: "Text", "Image" и т.д. */}
        </button>
      ))}
    </div>
  );
};

const Editor = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  const handleAddBlock = (type: Block['type']) => {
    const newBlock: Block = {
      id: uuid(),
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
    <div>
      <Toolbar onAddBlock={handleAddBlock} />
      <Canvas>
        {blocks.map(block => (
          <BlockComponent key={block.id} block={block} />
        ))}
      </Canvas>
    </div>
  );
};