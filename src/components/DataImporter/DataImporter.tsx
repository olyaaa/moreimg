import * as XLSX from 'xlsx';

export const DataImporter = ({ onDataLoaded }) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      onDataLoaded(jsonData); // Передаём данные в редактор
    };
    reader.readAsArrayBuffer(file);
  };

  return <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />;
};