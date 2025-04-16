import React from 'react';
import * as XLSX from 'xlsx';
import { Block, DataRow, DataImportResult } from '../../types';

interface DataImporterProps {
  onDataLoaded: (result: DataImportResult) => void;
  addBlocks: (blocks: Block[]) => void;
  resetBlocks: () => void;
  previewCount: number;
  previewScale: number;
  disabled: boolean;
}

const DEFAULT_FONT_SIZE = 16;
const DEFAULT_COLOR = '#000000';

export const DataImporter: React.FC<DataImporterProps> = ({
  onDataLoaded,
  disabled = false,
  addBlocks,
  resetBlocks,
  previewCount,
  previewScale,
}) => {
  const isImageUrl = (url: string) =>
    /^https?:\/\/.+(\.(jpg|jpeg|png|webp|gif|svg))(\?.+)?$/i.test(url?.trim() || '');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // Access the first file
    if (!file) return;

    try {
      const data = await parseFile(file);

      if (data.length === 0) {
        alert('Файл не содержит данных');
        return;
      }

      const hasHeaders = window.confirm('Первая строка содержит заголовки столбцов?');
      const templateData = data; // First row for template
      const previewData = hasHeaders
        ? data.slice(0, 0 + previewCount) // Skip headers
        : data.slice(0, previewCount);

      const templateBlocks = createTemplateBlocks(templateData[0]); // Pass the first row

      resetBlocks();
      addBlocks(templateBlocks);
      onDataLoaded({
        templateData,
        previewData,
        hasHeaders,
      });
    } catch (error) {
      handleError(error);
    } finally {
      if (e.target) e.target.value = ''; // Reset input value
    }
  };

  const parseFile = async (file: File): Promise<DataRow[]> => {
    if (file.name.endsWith('.json')) {
      const text = await file.text();
      return JSON.parse(text) as DataRow[];
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    return XLSX.utils.sheet_to_json(worksheet) as DataRow[];
  };

  const createTemplateBlocks = (row: DataRow): Block[] =>
    Object.entries(row).map(([key, value], index) => {
      const valueStr = String(value);
      const isImage = isImageUrl(valueStr);

      return {
        id: `template-${index}`,
        type: isImage ? 'image' : 'text',
        x: 50 + index * 200,
        y: 50,
        zIndex: index + 1,
        content: isImage ? '' : valueStr,
        url: isImage ? valueStr : undefined,
        fontSize: DEFAULT_FONT_SIZE,
        color: DEFAULT_COLOR,
        templateKey: key,
        isConstant: false,
        ...(isImage && { width: 200, height: 200 }),
      };
    });

  const handleError = (error: unknown) => {
    console.error('Error:', error);
    alert(`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  };

  // Fix the containerStyle function
  const containerStyle = (disabled: boolean): React.CSSProperties => ({
    padding: '16px',
    border: '1px dashed #ccc',
    margin: '16px 0',
    opacity: disabled ? 0.6 : 1, // Valid opacity value
    pointerEvents: disabled ? 'none' : 'auto', // Valid pointerEvents value
    backgroundColor: disabled ? '#f9f9f9' : '#ffffff', // Optional: light background when disabled
    borderRadius: '8px', // Optional: rounded corners
  });

  const inputStyle = {
    display: 'block',
    marginBottom: '8px',
  };

  const hintStyle = {
    margin: 0,
    fontSize: '0.9em',
    color: '#666',
  };

  return (
    <div style={containerStyle(disabled)}>
      <h3 style={{ marginTop: 0 }}>Импорт данных</h3>
      <input
        type="file"
        accept=".xlsx,.xls,.json"
        onChange={handleFileUpload}
        disabled={disabled} // Properly set the disabled attribute
        style={inputStyle}
      />
      <p style={hintStyle}>Поддерживаемые форматы: Excel (.xlsx, .xls), JSON</p>
    </div>
  );
};