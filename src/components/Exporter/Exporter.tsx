import React, { useState } from 'react';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { useCanvasStore } from '../../store'; 
import { Block, DataRow } from '../../types';
import { saveAs } from 'file-saver';

interface ExporterProps {
  data: DataRow[];
  canvasRef: React.RefObject<HTMLDivElement | null>; // Добавляем | null
  disabled?: boolean;
  isGenerating: boolean; // Added this prop
  onExport: () => void;
}

export const Exporter: React.FC<ExporterProps> = ({ 
  data, 
  canvasRef,
  disabled = false 
}) => {
  const { blocks, updateBlockContent, resetBlocks, setState } = useCanvasStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const exportAllAsZip = async () => {
    if (!data.length || !canvasRef.current) return;
    
    setIsGenerating(true);
    setProgress(0);
    
    try {
      const zip = new JSZip();
      const originalBlocks = JSON.parse(JSON.stringify(blocks)); // Сохраняем исходные блоки

      for (const [index, row] of data.entries()) {
        // Обновляем прогресс
        setProgress(Math.round((index / data.length) * 100));

        // Обновляем блоки с данными из строки
        blocks.forEach((block: Block) => {
          if (!block.isConstant && block.templateKey) {
            const value = row[block.templateKey];
            const isImg = isImageUrl(String(value));
            
            const updates: Partial<Block> = {
              content: isImg ? '' : String(value),
              ...(isImg && { url: String(value) })
            };
            
            updateBlockContent(block.id, updates);
          }
        });

        // Ждём обновления DOM
        await new Promise(resolve => setTimeout(resolve, 50));

        // Генерируем изображение
        const dataUrl = await toPng(canvasRef.current);
        const base64Data = dataUrl.split(',')[1];
        zip.file(`product_${index + 1}.png`, base64Data, { base64: true });
      }

      // Восстанавливаем исходные блоки
      resetBlocks();
      setState({ blocks: originalBlocks });

      // Генерируем и скачиваем ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `products_${new Date().toISOString().slice(0, 10)}.zip`);
      
    } catch (error) {
      console.error('Export error:', error);
      alert(`Ошибка экспорта: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <div className="export-section">
      <button 
        onClick={exportAllAsZip} 
        disabled={disabled || isGenerating || !data.length}
        className="export-button"
      >
        {isGenerating ? (
          `Генерация... ${progress}%`
        ) : (
          `Экспорт (${data.length} изображений)`
        )}
      </button>
      
      {isGenerating && (
        <div className="export-progress">
          <progress value={progress} max="100" />
        </div>
      )}
    </div>
  );
};

// Вспомогательные функции
const isImageUrl = (url: string) => {
  return /^https?:\/\/.+(\.(jpg|jpeg|png|webp|gif|svg))(\?.+)?$/i.test(url?.trim() || '');
};