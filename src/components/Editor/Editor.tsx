import React, { useState, useRef, useEffect } from 'react';
import { Toolbar } from '../Toolbar/Toolbar';
import { BlockComponent } from '../BlockComponent/BlockComponent';
import { DataImporter } from '../DataImporter/DataImporter';
import { CanvasSettingsPanel } from '../CanvasSettings/CanvasSettingsPanel';
import { EditorState, Block, CanvasSettings, DataRow } from '../../types';
import { useCanvasStore } from '../../store';
import { BlockInspector } from '../BlockInspector/BlockInspector';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/index.css'
import { saveAs } from 'file-saver';


interface ExportData {
  data: DataRow[];
}

const PREVIEW_SCALE = 0.25;
const PREVIEW_COUNT = 10;
const DEFAULT_FONT_SIZE = 16;
const DEFAULT_COLOR = '#000000';

export const Editor = () => {
  const {
    canvas,
    blocks,
    mainCanvasBlocks,
    previewCanvasBlocks,
    selectedIds,
    hasHeaders,
    addBlocks,
    updateCanvasSettings: updateStoreCanvasSettings,
    setState,
    updateBlockContent, // Добавляем новые методы из хранилища
    resetBlocks
  } = useCanvasStore();

  const mainCanvasRef = useRef<HTMLDivElement>(null);
  const [exportData, setExportData] = useState<DataRow[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const previewsContainerRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  const scrollPreviews = (direction: 'left' | 'right') => {
    if (!previewsContainerRef.current) return;
    
    const container = previewsContainerRef.current;
    const scrollAmount = direction === 'left' ? -300 : 300;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleDataLoaded = (data: DataRow[], headersExist: boolean) => {
    if (data.length === 0) return;
    setExportData(data.slice(headersExist ? 1 : 0));

    const startIndex = headersExist ? 1 : 0;
    const firstRow = data[startIndex];
    const previewRows = data.slice(startIndex + 1, startIndex + 1 + PREVIEW_COUNT);

    const mainBlocks = Object.entries(firstRow).map(([key, value], index) => ({
      id: `block-${index}`,
      type: 'text' as const,
      x: 50 + index * 200,
      y: 50,
      zIndex: index,
      content: String(value),
      fontSize: DEFAULT_FONT_SIZE,
      color: DEFAULT_COLOR,
      templateKey: key,
      isConstant: false
    }));

    const previews = previewRows.map((row, rowIndex) => 
      Object.entries(row).map(([key, value], colIndex) => ({
        ...mainBlocks[colIndex],
        id: `preview-${rowIndex}-${colIndex}`,
        content: String(value),
        x: mainBlocks[colIndex].x * PREVIEW_SCALE,
        y: mainBlocks[colIndex].y * PREVIEW_SCALE,
        fontSize: (mainBlocks[colIndex].fontSize || DEFAULT_FONT_SIZE) * PREVIEW_SCALE,
        isConstant: true
      }))
    );

    addBlocks(mainBlocks);
    setState({
      previewCanvasBlocks: previews,
      hasHeaders: headersExist
    });
  };

  const updateBlockPosition = (id: string, x: number, y: number) => {
    setState((prev: EditorState) => ({
      ...prev,
      blocks: prev.blocks.map((block: Block) =>
        block.id === id ? { ...block, x, y } : block
      ),
      mainCanvasBlocks: prev.mainCanvasBlocks.map((block: Block) =>
        block.id === id ? { ...block, x, y } : block
      )
    }));
  };

  const groupSelected = () => {
    if (selectedIds.length < 2) return;

    const newGroup: Block = {
      id: `group-${Date.now()}`,
      type: 'group',
      x: calculateCenter(selectedIds).x,
      y: calculateCenter(selectedIds).y,
      zIndex: Math.max(...blocks.map((b: Block) => b.zIndex)) + 1,
      children: selectedIds,
      isConstant: false
    };

    setState((prev: EditorState) => ({
      ...prev,
      blocks: [...prev.blocks, newGroup],
      selectedIds: [newGroup.id]
    }));
  };

  const calculateCenter = (ids: string[]) => {
    const selectedBlocks = blocks.filter((b: Block) => ids.includes(b.id));
    const avgX = selectedBlocks.reduce((sum: number, b: Block) => sum + b.x, 0) / selectedBlocks.length;
    const avgY = selectedBlocks.reduce((sum: number, b: Block) => sum + b.y, 0) / selectedBlocks.length;
    return { x: avgX, y: avgY };
  };

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setState((prev: EditorState) => ({
      ...prev,
      blocks: prev.blocks.map((block: Block) =>
        block.id === id ? { ...block, ...updates } : block
      )
    }));
  };

  const handleAddBlock = (type: Block['type']) => {
    const newId = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const baseBlock: Partial<Block> = {
      id: newId,
      type,
      x: 100,
      y: 100 + (blocks.length * 60),
      zIndex: blocks.length + 1,
      isConstant: false
    };

    let newBlock: Block;

    switch (type) {
      case 'text':
        newBlock = {
          ...baseBlock,
          content: 'Новый текст',
          fontSize: DEFAULT_FONT_SIZE,
          color: DEFAULT_COLOR
        } as Block;
        break;
      case 'image':
        newBlock = {
          ...baseBlock,
          url: '',
          width: 200,
          height: 200
        } as Block;
        break;
      case 'shape':
        newBlock = {
          ...baseBlock,
          shapeType: 'rectangle',
          width: 100,
          height: 100,
          color: '#cccccc'
        } as Block;
        break;
      default:
        newBlock = baseBlock as Block;
    }

    // Добавляем только один раз через хранилище
    addBlocks([newBlock]);
    setState({ selectedIds: [newBlock.id] });
  };

  const handleUpdateCanvasSettings = (settings: CanvasSettings) => {
    const scaleX = settings.width / canvas.width;
    const scaleY = settings.height / canvas.height;

    setState((prev: EditorState) => {
      const newMainBlocks = prev.mainCanvasBlocks.map((block: Block) => ({
        ...block,
        x: block.x * scaleX,
        y: block.y * scaleY,
        fontSize: (block.fontSize || DEFAULT_FONT_SIZE) * scaleX
      }));

      const newPreviewBlocks = prev.previewCanvasBlocks.map((preview: Block[]) => 
        preview.map((block: Block) => ({
          ...block,
          x: block.x * scaleX,
          y: block.y * scaleY,
          fontSize: (block.fontSize || DEFAULT_FONT_SIZE) * scaleX
        }))
      );

      return {
        ...prev,
        canvas: settings,
        mainCanvasBlocks: newMainBlocks,
        previewCanvasBlocks: newPreviewBlocks
      };
    });
  };

const exportAllAsZip = async () => {
  if (!mainCanvasRef.current || previewCanvasBlocks.length === 0) {
    alert("Холст не загружен или нет данных");
    return;
  }

  setIsGenerating(true);
  try {
    const JSZip = (await import('jszip')).default;
    const { default: saveAs } = await import('file-saver');
    const { toPng } = await import('html-to-image');
    
    const zip = new JSZip();

    // Сохраняем исходные блоки для восстановления после экспорта
    const originalBlocks = [...blocks];

    // Обрабатываем каждую строку данных
    for (let i = 0; i < previewCanvasBlocks.length; i++) {
      // Обновляем блоки данными из текущей строки превью
      previewCanvasBlocks[i].forEach(previewBlock => {
        const mainBlockId = previewBlock.id.replace(/preview-\d+-/, 'block-');
        const mainBlock = blocks.find(b => b.id === mainBlockId);
        
        if (mainBlock && !mainBlock.isConstant) {
          // Обновляем только изменяемые свойства
          const updates: Partial<Block> = {
            content: previewBlock.content,
            url: previewBlock.url
          };
          updateBlock(mainBlockId, updates);
        }
      });

      // Ждем обновления DOM
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Генерируем PNG
      const dataUrl = await toPng(mainCanvasRef.current);
      const base64Data = dataUrl.split(',')[1];
      zip.file(`product_${i + 1}.png`, base64Data, { base64: true });
    }

    // Восстанавливаем исходные блоки
    setState({ blocks: originalBlocks });

    // Генерируем и сохраняем ZIP
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `products_${Date.now()}.zip`);
    
  } catch (error) {
    console.error('Export error:', error);
    alert(`Ошибка экспорта: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    setIsGenerating(false);
  }
};

const isImageUrl = (url: string) => {
  return /^https?:\/\/.+(\.(jpg|jpeg|png|webp|gif|svg))(\?.+)?$/i.test(url?.trim() || '');
};


  // Вспомогательная функция для замены переменных
  const replaceVariables = (text: string, vars: Record<string, string | number>) => {
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] || `{{${key}}}`));
  };

  return (
    <div className="editor-container" data-theme={theme}>
      {/* Кнопка переключения темы */}
      <button 
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Переключить на ${theme === 'light' ? 'тёмную' : 'светлую'} тему`}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      {/* Основное содержимое редактора */}
      <div className="editor-main-content">
        {/* Центральная часть с холстом */}
        <div className="editor-center">
          <Toolbar onAddBlock={handleAddBlock} onGroup={groupSelected} />
          
          <div className="main-canvas"
            ref={mainCanvasRef}
            style={{
              width: canvas.width,
              height: canvas.height,
              backgroundColor: canvas.backgroundColor,
            }}
          >
            {blocks.map((block: Block) => (
              <BlockComponent 
                key={block.id} 
                block={block} 
                isPreview={false}
                isSelected={selectedIds.includes(block.id)}
                onClick={() => setState({ selectedIds: [block.id] })}
                onPositionChange={updateBlockPosition}
              />
            ))}
          </div>

          {/* Импорт данных под холстом */}
          <div className="data-import-section">
            <DataImporter
              onDataLoaded={(data, hasHeaders) => {
                setExportData(data);
                handleDataLoaded(data, hasHeaders);
              }}
              addBlocks={addBlocks}
              resetBlocks={resetBlocks}
              previewCount={PREVIEW_COUNT}
              previewScale={PREVIEW_SCALE}
              disabled={exportData.length > 0}
            />
          </div>

          {/* Превью под импортом данных */}
          <div className="previews-section">
            <h3>Превью данных</h3>
            <div className="previews-nav">
              <button 
                className="previews-arrow left"
                onClick={() => scrollPreviews('left')}
              >
                &lt;
              </button>
              
              <div 
                ref={previewsContainerRef}
                className="previews-container"
              >
                <div className="previews-scroller">
                  {previewCanvasBlocks.map((blocks: Block[], index: number) => (
                    <div 
                      key={`preview-${index}`}
                      className="preview-canvas-wrapper"
                    >
                      <div 
                        className="preview-canvas"
                        style={{
                          width: canvas.width * PREVIEW_SCALE,
                          height: canvas.height * PREVIEW_SCALE,
                          backgroundColor: canvas.backgroundColor,
                          position: 'relative'
                        }}
                      >
                        {blocks.map((block: Block) => (
                          <BlockComponent 
                            key={block.id} 
                            block={block}
                            isPreview={true}
                          />
                        ))}
                      </div>
                      <div className="preview-label">Строка {index + 1}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                className="previews-arrow right"
                onClick={() => scrollPreviews('right')}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>

        {/* Правая панель настроек */}
        <div className="editor-right-panel">
          <div className="settings-panel">
            <div className="settings-section">
              <h3 className="settings-title">Canvas Settings</h3>
              <CanvasSettingsPanel
                settings={canvas}
                onUpdate={handleUpdateCanvasSettings}
              />
            </div>

            {selectedIds.length > 0 && (
              <div className="settings-section">
                <h3 className="settings-title">
                  {selectedIds.length === 1 ? 'Block Properties' : `${selectedIds.length} Blocks Selected`}
                </h3>
                <BlockInspector 
                  blocks={blocks.filter((b: Block) => selectedIds.includes(b.id))}
                  onUpdate={(updates: Partial<Block>) => {
                    selectedIds.forEach((id: string) => updateBlock(id, updates));
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
        <div className="export-section">
          <button 
            onClick={exportAllAsZip} 
            disabled={isGenerating || exportData.length === 0}
          >
            {isGenerating ? 'Генерация...' : `Экспорт (${exportData.length} изображений)`}
          </button>
        </div>
      </div>
      //</div>
  );
};