// src/components/Block/BlockComponent.tsx
export const BlockComponent = ({ block }: { block: Block }) => {
  // Пока используем заглушки для данных
  const variables = { price: "100", logo_url: "logo1.png" };

  switch (block.type) {
    case 'text':
      const text = block.isConstant 
        ? block.content 
        : replaceVariables(block.content || '', variables);
      return <div style={{ position: 'absolute', left: block.x, top: block.y }}>{text}</div>;

    case 'image':
      const src = block.isConstant ? block.url : variables[block.url?.replace(/\{\{|\}\}/g, '') || ''];
      return <img src={src} style={{ position: 'absolute', left: block.x, top: block.y }} />;

    // ...остальные типы блоков
  }
};
// При клике на блок (выделении)
const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);

// В компоненте PropertiesPanel:
<button 
  onClick={() => {
    if (!selectedBlock) return;
    selectedBlock.isConstant = !selectedBlock.isConstant;
    setBlocks([...blocks]);
  }}
>
  {selectedBlock?.isConstant ? 'Константа' : 'Переменная'}
</button>