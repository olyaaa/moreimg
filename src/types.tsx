export interface Block {
  id: string;
  type: 'text' | 'image' | 'shape' | 'group' | 'line';
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
  opacity?: number;
  layerId?: string;
  fillType?: 'solid' | 'gradient';
  gradient?: {
    type: 'linear' | 'radial';
    colors: string[];
    direction?: number; 
  };
  rotation?: number;
  lineWidth?: number;
  lineType?: 'solid' | 'dashed' | 'dotted';
  hasArrow?: boolean;
  hasCircle?: boolean;
  length?: number;
  lineEnds?: 'none' | 'start' | 'end' | 'both';
  lineEndType?: 'circle' | 'square' | 'arrow';
}

export interface DataRow {
  [key: string]: any;
}

export interface Gradient {
  type: 'linear' | 'radial';
  colors: string[];
  direction?: number;
}

export interface CanvasSettings {
  width: number;
  height: number;
  backgroundColor: string;
  opacity: number; // Добавляем
  fillType?: 'solid' | 'gradient'; // Добавляем (опционально)
  gradient: {
    type: 'linear' | 'radial';
    colors: string[];
    direction: number;
  };
}

export interface EditorState {
  canvas: CanvasSettings;
  blocks: Block[];
  mainCanvasBlocks: Block[];
  previewCanvasBlocks: Block[][];
  selectedIds: string[];
  hasHeaders: boolean;
  layers: Layer[];
  currentLayerId: string | null;
}

export interface Layer {
  id: string;
  name: string;
  blocks: string[];
  visible: boolean;
  locked: boolean;
  opacity: number;
}

export interface DataImportResult {
  templateData: DataRow;
  previewData: DataRow[];
  hasHeaders: boolean;
}

interface DataImporterProps {
  onDataLoaded: (result: DataImportResult) => void;
  
}