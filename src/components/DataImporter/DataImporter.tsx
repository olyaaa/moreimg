import React from 'react';
import * as XLSX from 'xlsx';

interface DataImporterProps {
  onDataLoaded: (data: Record<string, any>[]) => void;
}

export const DataImporter: React.FC<DataImporterProps> = ({ onDataLoaded }) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        if (file.name.endsWith('.json')) {
          const jsonData = JSON.parse(e.target?.result as string) as Record<string, any>[];
          onDataLoaded(jsonData);
        } else {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet) as Record<string, any>[];
          onDataLoaded(jsonData);
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Ошибка при чтении файла');
      }
    };

    if (file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div style={{ padding: '16px', border: '1px dashed #ccc', margin: '16px 0' }}>
      <h3>Импорт данных</h3>
      <input 
        type="file" 
        accept=".xlsx,.xls,.json" 
        onChange={handleFileUpload}
      />
      <p>Поддерживаемые форматы: Excel (.xlsx, .xls), JSON</p>
    </div>
  );
};
