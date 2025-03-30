export interface Block {
  id: string;
  type: 'text' | 'image' | 'chart' | 'shape';
  x: number;
  y: number;
  content?: string;
  url?: string;
  dataKey?: string;
  isConstant?: boolean;
}