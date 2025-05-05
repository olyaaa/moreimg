import { useCanvasStore } from '../store';
import { Block, EditorState } from '../types';
import { useCallback } from 'react'; 

export const useBlocksManagement = () => {
  const { blocks, selectedIds, addBlocks, setState } = useCanvasStore();

  const deleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;

    setState(prev => ({
      blocks: prev.blocks.filter(b => !selectedIds.includes(b.id)),
      selectedIds: []
    }));
  }, [selectedIds, setState]);

  const updateBlockPosition = (id: string, x: number, y: number) => {
    setState((prev: EditorState) => ({
      ...prev,
      blocks: prev.blocks.map((block: Block) =>
        block.id === id ? { ...block, x, y } : block
      ),
      mainCanvasBlocks: prev.mainCanvasBlocks.map((block: Block) =>
        block.id === id ? { ...block, x, y } : block
      )
    }));
  };

  const groupSelected = () => {
    if (selectedIds.length < 2) return;

    const newGroup: Block = {
      id: `group-${Date.now()}`,
      type: 'group',
      x: calculateCenter(selectedIds).x,
      y: calculateCenter(selectedIds).y,
      zIndex: Math.max(...blocks.map((b: Block) => b.zIndex)) + 1,
      children: selectedIds,
      isConstant: false
    };

    setState((prev: EditorState) => ({
      ...prev,
      blocks: [...prev.blocks, newGroup],
      selectedIds: [newGroup.id]
    }));
  };

  const calculateCenter = (ids: string[]) => {
    const selectedBlocks = blocks.filter((b: Block) => ids.includes(b.id));
    const avgX = selectedBlocks.reduce((sum: number, b: Block) => sum + b.x, 0) / selectedBlocks.length;
    const avgY = selectedBlocks.reduce((sum: number, b: Block) => sum + b.y, 0) / selectedBlocks.length;
    return { x: avgX, y: avgY };
  };

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setState((prev: EditorState) => ({
      ...prev,
      blocks: prev.blocks.map((block: Block) =>
        block.id === id ? { ...block, ...updates } : block
      )
    }));
  };

  const handleAddBlock = (type: Block['type']) => {
    const newId = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const baseBlock: Partial<Block> = {
      id: newId,
      type,
      x: 100,
      y: 100 + (blocks.length * 60),
      zIndex: blocks.length + 1,
      isConstant: false,
      rotation: 0 // Добавляем вращение по умолчанию
    };

    let newBlock: Block;

    switch (type) {
      case 'text':
        newBlock = {
          ...baseBlock,
          content: 'Новый текст',
          fontSize: DEFAULT_FONT_SIZE,
          color: DEFAULT_COLOR
        } as Block;
        break;
      case 'image':
        newBlock = {
          ...baseBlock,
          url: '',
          width: 200,
          height: 200
        } as Block;
        break;
      case 'shape':
        newBlock = {
          ...baseBlock,
          shapeType: 'rectangle',
          width: 100,
          height: 100,
          color: '#cccccc'
        } as Block;
        break;
      case 'line':
        newBlock = {
          ...baseBlock,
          lineWidth: 2,
          lineType: 'solid',
          color: '#000000',
          length: 100,
          lineEnds: 'none',
          lineEndType: 'arrow'
        } as Block;
        break;
      default:
        newBlock = baseBlock as Block;
    }

    addBlocks([newBlock]);
    setState({ selectedIds: [newBlock.id] });
  };

  return {
    updateBlockPosition,
    groupSelected,
    updateBlock,
    setSelectedIds: (ids: string[]) => setState({ selectedIds: ids }),
    handleAddBlock,
    deleteSelected
  };
};

const DEFAULT_FONT_SIZE = 16;
const DEFAULT_COLOR = '#000000';