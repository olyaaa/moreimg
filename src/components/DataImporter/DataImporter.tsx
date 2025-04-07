import React from 'react';
import * as XLSX from 'xlsx';
import { Block, DataRow } from '../../types';

const isImageUrl = (url: string) => {
  return /^https?:\/\/.+(\.(jpg|jpeg|png|webp|gif|svg))(\?.+)?$/i.test(url?.trim() || '');
};

interface DataImporterProps {
  onDataLoaded: (data: DataRow[], hasHeaders: boolean) => void;
  disabled?: boolean;
  addBlocks: (blocks: Block[]) => void;
  resetBlocks: () => void;
  previewCount: number;
  previewScale: number;
}

const DEFAULT_FONT_SIZE = 16;
const DEFAULT_COLOR = '#000000';

export const DataImporter: React.FC<DataImporterProps> = ({ 
  onDataLoaded,
  disabled = false,
  addBlocks,
  resetBlocks,
  previewCount,
  previewScale
}) => {
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let data: DataRow[];
      
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        data = JSON.parse(text);
      } else {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(firstSheet);
      }

      if (data.length === 0) return;

      const hasHeaders = Object.values(data[0]).some(val => typeof val !== 'string');
      const startIndex = hasHeaders ? 1 : 0;
      const processedData = data.slice(startIndex);

      const templateBlocks = Object.entries(processedData[0]).map(([key, value], index) => {
        const valueStr = String(value);
        const isImage = isImageUrl(valueStr);

        return {
          id: `template-${index}`,
          type: isImage ? 'image' as const : 'text' as const,
          x: 50 + index * 200,
          y: 50,
          zIndex: index + 1,
          content: isImage ? '' : `{{${key}}}`,
          url: isImage ? `{{${key}}}` : undefined,
          fontSize: DEFAULT_FONT_SIZE,
          color: DEFAULT_COLOR,
          templateKey: key,
          isConstant: false,
          ...(isImage ? { width: 200, height: 200 } : {})
        };
      });

      const previews = processedData.slice(0, previewCount).map((row, rowIndex) => 
        templateBlocks.map((template, colIndex) => {
          const value = row[template.templateKey];
          const valueStr = String(value);
          const isImage = template.type === 'image' && isImageUrl(valueStr);

          return {
            ...template,
            id: `preview-${rowIndex}-${colIndex}`,
            content: isImage ? '' : valueStr,
            url: isImage ? valueStr : undefined,
            x: template.x * previewScale,
            y: template.y * previewScale,
            fontSize: (template.fontSize || DEFAULT_FONT_SIZE) * previewScale,
            isConstant: true
          };
        })
      );

      resetBlocks();
      addBlocks(templateBlocks);
      onDataLoaded(processedData, hasHeaders);
      
      return {
        previewCanvasBlocks: previews,
        hasHeaders
      };

    } catch (error) {
      console.error('Error parsing file:', error);
      alert(`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div style={{ 
      padding: '16px', 
      border: '1px dashed #ccc', 
      margin: '16px 0',
      opacity: disabled ? 0.6 : 1
    }}>
      <h3 style={{ marginTop: 0 }}>Импорт данных</h3>
      <input 
        type="file" 
        accept=".xlsx,.xls,.json" 
        onChange={handleFileUpload}
        disabled={disabled}
        style={{ display: 'block', marginBottom: '8px' }}
      />
      <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>
        Поддерживаемые форматы: Excel (.xlsx, .xls), JSON
      </p>
    </div>
  );
};