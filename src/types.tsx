export interface Block {
  id: string;
  type: 'text' | 'image' | 'shape' | 'group';
  x: number;
  y: number;
  zIndex: number;
  content?: string;
  url?: string;
  fontSize?: number;
  color?: string;
  width?: number;
  height?: number;
  shapeType?: 'rectangle' | 'circle' | 'triangle';
  templateKey?: string;
  isConstant?: boolean;
  children?: string[];
}

export interface DataRow {
  [key: string]: any;
}

export interface CanvasSettings {
  width: number;
  height: number;
  backgroundColor: string;
}

export interface EditorState {
  canvas: CanvasSettings;
  blocks: Block[];
  mainCanvasBlocks: Block[];
  previewCanvasBlocks: Block[][];
  selectedIds: string[];
  hasHeaders: boolean;
}

export interface Layer {
  id: string;
  name: string;
  blocks: Block[];
  visible: boolean;
  locked: boolean;
  opacity: number;
}