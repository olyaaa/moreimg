import { create } from 'zustand';
import { CanvasSettings, EditorState, Block } from './types';

interface CanvasStore extends EditorState {
  addBlocks: (blocks: Block[]) => void;
  updateCanvasSettings: (settings: CanvasSettings) => void;
  setState: (state: Partial<EditorState> | ((prev: EditorState) => Partial<EditorState>)) => void;
  updateBlockContent: (id: string, updates: Partial<Block>) => void;
  resetBlocks: () => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  canvas: {
    width: 800,
    height: 600,
    backgroundColor: '#ffffff'
  },
  blocks: [],
  mainCanvasBlocks: [],
  previewCanvasBlocks: [],
  selectedIds: [],
  hasHeaders: false,

  updateBlockContent: (id, updates) =>
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      ),
    })),
    
  resetBlocks: () =>
    set((state) => ({
      blocks: state.mainCanvasBlocks.map(block => ({ ...block })),
    })),

  addBlocks: (newBlocks: Block[]) => 
    set((state) => ({ 
      blocks: [...state.blocks, ...newBlocks],
      mainCanvasBlocks: [...state.mainCanvasBlocks, ...newBlocks]
    })),

  updateCanvasSettings: (settings: CanvasSettings) =>
    set(() => ({ canvas: settings })),
  setState: (newState) => set(newState)
}));

