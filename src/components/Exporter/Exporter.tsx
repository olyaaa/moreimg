import React from 'react';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { useCanvasStore } from '../../store'; // Убедитесь, что путь корректный
import { Block } from '../../types'; // Подключаем `Block` из types.tsx
import { saveAs } from 'file-saver';

interface ExporterProps {
  data: Array<Record<string, string>>; // Данные из Excel (CSV/JSON)
  canvasRef: React.RefObject<HTMLDivElement>;
}

export const Exporter: React.FC<ExporterProps> = ({ data, canvasRef }) => {
  const { blocks, updateBlockContent, resetBlocks } = useCanvasStore();

  const exportAllAsZip = async () => {
    const zip = new JSZip();

    for (const [index, row] of data.entries()) {
      // 1. Обновляем блоки с данными из строки
      blocks.forEach((block: Block) => {
        if (!block.isConstant && block.type === 'text') {
          const newText = replaceVariables(block.content || '', row);
          updateBlockContent(block.id, { content: newText });
        }
        if (!block.isConstant && block.type === 'image' && block.url) {
          const urlKey = block.url.replace(/\{\{|\}\}/g, '');
          updateBlockContent(block.id, { url: row[urlKey] || block.url });
        }
      });

      // 2. Ждём обновления DOM
      await new Promise((resolve) => setTimeout(resolve, 50));

      // 3. Делаем скриншот холста
      if (canvasRef.current) {
        const dataUrl = await toPng(canvasRef.current);
        const base64Data = dataUrl.split(',')[1];
        zip.file(`product_${index + 1}.png`, base64Data, { base64: true });
      }
    }

    // 4. Возвращаем блоки в исходное состояние
    resetBlocks();

    // 5. Скачиваем ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'products.zip');
  };

  return (
    <button onClick={exportAllAsZip} className="export-button">
      Экспортировать в ZIP
    </button>
  );
};

// Замена переменных в тексте
const replaceVariables = (text: string, vars: Record<string, string>) => {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || `{{${key}}}`);
};