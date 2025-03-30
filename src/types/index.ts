export interface Block {
  id: string;
  type: 'text' | 'image' | 'shape' | 'group';
  x: number;
  y: number;
  zIndex: number;
  content?: string;
  url?: string;
  children?: string[]; // Для групп
}

export interface CanvasSettings {
  width: number;
  height: number;
  backgroundColor: string;
}

export interface EditorState {
  canvas: CanvasSettings;
  blocks: Block[];
  selectedIds: string[];
}

export interface Layer {
  id: string;
  name: string;
  blocks: Block[];
  visible: boolean;
  locked: boolean;
  opacity: number;
}