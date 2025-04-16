import { create } from 'zustand';
import { CanvasSettings, EditorState, Block, Gradient } from './types';

interface CanvasStore extends EditorState {
  addBlocks: (blocks: Block[]) => void;
  updateCanvasSettings: (settings: CanvasSettings) => void;
  setState: (state: Partial<EditorState> | ((prev: EditorState) => Partial<EditorState>)) => void;
  updateBlockContent: (id: string, updates: Partial<Block>) => void;
  resetBlocks: () => void;
  clearImportData: () => void;
  exportData: DataRow[];
  updateBlockGradient: (id: string, gradient: Gradient) => void;
  updateCanvasOpacity: (opacity: number) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  canvas: {
    width: 800,
    height: 600,
    backgroundColor: '#ffffff',
    opacity: 1,
    fillType: 'solid',
    gradient: {
      type: 'linear',
      colors: ['#ffffff', '#000000'],
      direction: 90,
    },
  },
  blocks: [],
  mainCanvasBlocks: [],
  previewCanvasBlocks: [],
  selectedIds: [],
  hasHeaders: false,
  exportData: [], // Initialize with an empty array


  updateBlockGradient: (id, gradient) => set(state => ({
    blocks: state.blocks.map(b => 
      b.id === id ? { ...b, fillType: 'gradient', gradient } : b
    )
  })),

  updateCanvasOpacity: (opacity) => set(state => ({
    canvas: { ...state.canvas, opacity }
  })),

  clearImportData: () =>
    set({
      exportData: [], // Reset exportData
      previewCanvasBlocks: [], // Reset preview data
    }),

  updateBlockContent: (id, updates) =>
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      ),
    })),

  resetBlocks: () =>
    set((state) => ({
      blocks: state.mainCanvasBlocks.map((block) => ({ ...block })),
    })),

  addBlocks: (newBlocks: Block[]) =>
    set((state) => ({
      blocks: [...state.blocks, ...newBlocks],
      mainCanvasBlocks: [...state.mainCanvasBlocks, ...newBlocks],
    })),

  updateCanvasSettings: (settings: CanvasSettings) =>
    set(() => ({ canvas: settings })),
  setState: (newState) => set(newState),
}));

export interface DataRow {
  [key: string]: string | number;
}