export function saveTemplate(canvas) {
  const template = canvas.toJSON();
  const templateStr = JSON.stringify(template);
  const blob = new Blob([templateStr], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'template.json';
  link.click();
}

export function loadTemplate(canvas) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const template = JSON.parse(reader.result);
      canvas.loadFromJSON(template, () => {
        canvas.renderAll();
      });
    };
    reader.readAsText(file);
  };
  input.click();
}

export function loadExcel() {
  const input = document.getElementById('excelFile');
  input.click();
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const data = new Uint8Array(reader.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);
      console.log(json);
    };
    reader.readAsArrayBuffer(file);
  };
}