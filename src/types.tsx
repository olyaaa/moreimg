export interface Layer {
  id: string;
  name: string;
  blocks: Block[];
  visible: boolean;
  locked: boolean;
  opacity: number;
}

export interface Block {
  id: string;
  type: 'text' | 'image' | 'shape' | 'group';
  x: number;
  y: number;
  zIndex: number;
  content?: string;
  url?: string;
  isConstant?: boolean; // Сделаем необязательным
  children?: string[]; // Для групп
}

export interface CanvasSettings {
  width: number;
  height: number;
  backgroundColor: string; // Добавляем backgroundColor
}

export interface EditorState {
  canvas: CanvasSettings;
  blocks: Block[];
  selectedIds: string[];
}

export interface ToolbarProps {
  onAddBlock: (type: Block['type']) => void;
  onGroup?: () => void; // Делаем необязательным
}