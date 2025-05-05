import React, { useEffect, useRef, useState } from 'react';
import { Toolbar } from '../Toolbar/Toolbar';
import { BlockComponent } from '../BlockComponent/BlockComponent';
import { DataImporter } from '../DataImporter/DataImporter';
import { CanvasSettingsPanel } from '../CanvasSettings/CanvasSettingsPanel';
import { BlockInspector } from '../BlockInspector/BlockInspector';
import { PreviewSection } from '../PreviewSection/PreviewSection';
import { Exporter } from '../Exporter/Exporter'; // Экспорт компонента Exporter
import { useCanvasStore } from '../../store';
import { useThemeToggle } from '../../hooks/useThemeToggle';
import { useBlocksManagement } from '../../hooks/useBlocksManagement';
import { Block, CanvasSettings, DataRow, DataImportResult, Layer } from '../../types';
import { LayersView } from '../LayersView/LayersView';
import '../../styles/index.css';

const PREVIEW_SCALE = 0.25; // Масштаб для превью
const PREVIEW_COUNT = 10;
const DEFAULT_FONT_SIZE = 16;
const DEFAULT_COLOR = '#000000';

export const Editor: React.FC = () => {
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
    resetBlocks,
    layers = [],
    currentLayerId = null,
  } = useCanvasStore();

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Проверяем, что клик был именно по холсту, а не по дочернему элементу
    if (e.target === e.currentTarget) {
      // Сбрасываем выделение, если клик был по пустой области
      setSelectedIds([]);
    }
  };

  const {
    updateBlockPosition,
    groupSelected,
    updateBlock,
    setSelectedIds,
    handleAddBlock,
    deleteSelected, // Импорт deleteSelected из useBlocksManagement
  } = useBlocksManagement();

  const mainCanvasRef = useRef<HTMLDivElement>(null);
  const previewsContainerRef = useRef<HTMLDivElement>(null);
  const [exportData, setExportData] = useState<DataRow[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const previewCanvasRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useThemeToggle();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Проверяем, если сейчас фокус в input, textarea или редактируемом элементе
      const tag = (e.target as HTMLElement).tagName;
      const isEditable = 
        tag === 'INPUT' || 
        tag === 'TEXTAREA' || 
        (e.target as HTMLElement).isContentEditable;
      if (isEditable) return; // Не обрабатываем клавишу

      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        deleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected]); // Передаём deleteSelected как зависимость

  const isImageUrl = (url: string) => {
    return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)(\?.+)?$/i.test(url?.trim() || '');
  };

  const handleUpdateCanvasSettings = (settings: CanvasSettings) => {
    const scaleX = settings.width / canvas.width;
    const scaleY = settings.height / canvas.height;

    setState((prev) => {
      const newMainBlocks = prev.mainCanvasBlocks.map((block) => ({
        ...block,
        x: block.x * scaleX,
        y: block.y * scaleY,
        fontSize: (block.fontSize || DEFAULT_FONT_SIZE) * scaleX,
      }));

      const newPreviewBlocks = prev.previewCanvasBlocks.map((preview) =>
        preview.map((block) => ({
          ...block,
          x: block.x * scaleX,
          y: block.y * scaleY,
          fontSize: (block.fontSize || DEFAULT_FONT_SIZE) * scaleX,
        })),
      );

      return {
        ...prev,
        canvas: settings,
        mainCanvasBlocks: newMainBlocks,
        previewCanvasBlocks: newPreviewBlocks,
      };
    });
  };

  const handleAddLayer = () => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      locked: false,
      opacity: 1,
      blocks: [], // или можно привязывать блоки к слоям через layerId в Block
    };
    setState(prev => ({ ...prev, layers: [...prev.layers, newLayer] }));
  };

  const handleSelectLayer = (id: string) => {
    setState(prev => ({ ...prev, currentLayerId: id }));
  };

  const handleToggleVisibility = (id: string) => {
    setState(prev => ({
      ...prev,
      layers: prev.layers.map(layer => 
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      )
    }));
  };

  const handleToggleLock = (id: string) => {
    setState(prev => ({
      ...prev,
      layers: prev.layers.map(layer => 
        layer.id === id ? { ...layer, locked: !layer.locked } : layer
      )
    }));
  };

  const handleReorderBlocks = (fromIndex: number, toIndex: number) => {
    setState(prev => {
      const newBlocks = [...prev.blocks];
      const [movedBlock] = newBlocks.splice(fromIndex, 1);
      newBlocks.splice(toIndex, 0, movedBlock);
      
      // Обновляем zIndex в соответствии с новым порядком
      const updatedBlocks = newBlocks.map((block, index) => ({
        ...block,
        zIndex: newBlocks.length - index
      }));
      
      return { ...prev, blocks: updatedBlocks };
    });
  };

  const handleReorderLayers = (fromIndex: number, toIndex: number) => {
    setState(prev => {
      const newLayers = [...prev.layers];
      const [movedLayer] = newLayers.splice(fromIndex, 1);
      newLayers.splice(toIndex, 0, movedLayer);
      
      // Обновляем zIndex блоков при изменении порядка слоев
      const updatedBlocks = prev.blocks.map(block => {
        if (block.layerId === movedLayer.id) {
          return { ...block, zIndex: prev.layers.length - toIndex };
        }
        return block;
      });
      
      return { 
        ...prev, 
        layers: newLayers,
        blocks: updatedBlocks
      };
    });
  };

  const handleDataLoaded = (result: DataImportResult) => {
    const { templateData, previewData, hasHeaders } = result;

    if (!templateData || previewData.length === 0) {
      alert('Нет данных для отображения');
      return;
    }

    setExportData(previewData);

    const mainBlocks: Block[] = Object.entries(templateData).map(([key, value], index) => {
      const isImg = isImageUrl(String(value));
      return {
        id: `block-${index}`,
        type: isImg ? 'image' : 'text',
        x: 50 + index * 200,
        y: 50,
        zIndex: index,
        content: isImg ? '' : `${key}`,
        fontSize: DEFAULT_FONT_SIZE,
        color: DEFAULT_COLOR,
        templateKey: key,
        isConstant: false,
        ...(isImg && { url: `${key}` }),
      };
    });
    const previews: Block[][] = previewData.map((row, rowIndex) =>
      Object.entries(row).map(([key, value], colIndex) => {
        const isImg = isImageUrl(String(value));
        const mainBlock = mainBlocks[colIndex]; // important for consistent positioning/font
        return {
          ...mainBlock,
          id: `preview-${rowIndex}-${colIndex}`,
          content: isImg ? '' : String(value),
          url: isImg ? String(value) : undefined,
          x: mainBlock.x * PREVIEW_SCALE,
          y: mainBlock.y * PREVIEW_SCALE,
          fontSize: (mainBlock.fontSize || DEFAULT_FONT_SIZE) * PREVIEW_SCALE,
          isConstant: true,
        };
      })
    );

    addBlocks(mainBlocks);
    setState((prev: any) => ({
      ...prev,
      previewCanvasBlocks: previews,
      hasHeaders,
    }));
  };

    const exportAllAsZip = async () => {
      if (!mainCanvasRef.current || exportData.length === 0) {
        alert('Холст не загружен или нет данных');
        return;
      }

      setIsGenerating(true);

      try {
        const JSZip = (await import('jszip')).default;
        const { default: saveAs } = await import('file-saver');
        const { toPng } = await import('html-to-image');

        const zip = new JSZip();
        const originalBlocks = [...blocks];

        for (let i = 0; i < exportData.length; i++) {
          const row = exportData[i];

          blocks.forEach((block) => {
            if (!block.isConstant && block.templateKey) {
              const value = row[block.templateKey];
              const isImg = isImageUrl(String(value));
              const updates = {
                content: isImg ? '' : String(value),
                ...(isImg && { url: String(value) }),
              };
              updateBlock(block.id, updates);
            }
          });

          await new Promise((resolve) => setTimeout(resolve, 100));
          const dataUrl = await toPng(mainCanvasRef.current as HTMLElement);
          const base64Data = dataUrl.split(',')[1];
          zip.file(`product_${i + 1}.png`, base64Data, { base64: true });
        }

        setState((prev: any) => ({
          ...prev,
          blocks: originalBlocks,
        }));

        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `products_${Date.now()}.zip`);
      } catch (error) {
        console.error('Export error:', error);
        alert(`Ошибка экспорта: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsGenerating(false);
      }
    };

  const scrollPreviews = (direction: 'left' | 'right') => {
    if (!previewsContainerRef.current) return;
    const container = previewsContainerRef.current;
    const scrollAmount = direction === 'left' ? -300 : 300;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
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

      <div className="editor-main-content">
        <div className="editor-center">
          <Toolbar onAddBlock={handleAddBlock} onGroup={groupSelected} />
          <div
            className="main-canvas"
            ref={mainCanvasRef}
            onClick={handleCanvasClick} // Добавляем обработчик клика здесь
            style={{
              position: 'relative',
              margin: 0,
              width: canvas.width,
              height: canvas.height,
              backgroundColor: canvas.backgroundColor,
              opacity: canvas.opacity ?? 1,
              background:
                canvas.fillType === 'gradient'
                  ? `linear-gradient(${canvas.gradient?.direction || 0}deg, ${canvas.gradient?.colors.join(', ')})`
                  : canvas.backgroundColor,
            }}
          >
                    {blocks.map((block: Block) => (
            <BlockComponent
                key={block.id}
                block={block}
                isPreview={false}
                isSelected={selectedIds.includes(block.id)}
                layers={layers}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIds([block.id]);
                }}
                onPositionChange={updateBlockPosition}
              />
            ))}
          
          </div>

          <div className="data-import-section">
            <DataImporter
              onDataLoaded={handleDataLoaded}
              addBlocks={addBlocks}
              resetBlocks={resetBlocks}
              previewCount={PREVIEW_COUNT}
              previewScale={PREVIEW_SCALE}
              disabled={exportData.length > 0}
            />
          </div>
          {/* Кнопка экспорта */}
          <Exporter
            data={exportData}
            canvasRef={mainCanvasRef as React.RefObject<HTMLDivElement>}
            disabled={exportData.length === 0}
            isGenerating={isGenerating}
            onExport={exportAllAsZip}
          />

          <PreviewSection
            previewCanvasBlocks={previewCanvasBlocks}
            canvas={canvas}
            PREVIEW_SCALE={PREVIEW_SCALE}
            scrollPreviews={scrollPreviews}
            //previewsContainerRef={previewsContainerRef}
          />
        </div>

        {/* Правая панель */}
        <div className="editor-right-panel">
          <div className="settings-panel">              
              <LayersView 
                blocks={blocks}
                onSelect={(id) => setSelectedIds([id])}
                onReorder={handleReorderBlocks}
              />
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
    </div>
  );
};