import React, { useState } from 'react';
import { Toolbar } from '../Toolbar/Toolbar';
import { BlockComponent } from '../BlockComponent/BlockComponent';
import { PropertiesPanel } from '../PropertiesPanel/PropertiesPanel';
import { DataImporter } from '../DataImporter/DataImporter';
import { CanvasSettingsPanel } from '../CanvasSettings/CanvasSettingsPanel';
import { LayersView } from '../LayersView/LayersView';
import { BlockInspector } from '../BlockInspector/BlockInspector';
import { EditorState, Block, CanvasSettings } from '../../types';

export const Editor = () => {
  const [state, setState] = useState<EditorState>({
    canvas: {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff'
    },
    blocks: [
      {
        id: 'block-1',
        type: 'text',
        x: 100,
        y: 100,
        zIndex: 1,
        content: 'Пример текста',
        isConstant: false // Добавляем обязательное поле
      },
      {
        id: 'block-2',
        type: 'image',
        x: 200,
        y: 150,
        zIndex: 2,
        url: '/placeholder.jpg',
        isConstant: false // Добавляем обязательное поле
      }
    ],
    selectedIds: []
  });

  // Обновление позиции блока
  const updateBlockPosition = (id: string, x: number, y: number) => {
    setState(prev => ({
      ...prev,
      blocks: prev.blocks.map(block =>
        block.id === id ? { ...block, x, y } : block
      )
    }));
  };

  // Группировка выделенных блоков
  const groupSelected = () => {
    if (state.selectedIds.length < 2) return;

    const newGroup: Block = {
      id: `group-${Date.now()}`,
      type: 'group',
      x: calculateCenter(state.selectedIds).x,
      y: calculateCenter(state.selectedIds).y,
      zIndex: Math.max(...state.blocks.map(b => b.zIndex)) + 1,
      children: state.selectedIds,
      isConstant: false // Добавляем обязательное поле
    };

    setState(prev => ({
      ...prev,
      blocks: [...prev.blocks, newGroup],
      selectedIds: [newGroup.id]
    }));
  };

  // Вспомогательная функция для расчета центра
  const calculateCenter = (ids: string[]) => {
    const selectedBlocks = state.blocks.filter(b => ids.includes(b.id));
    const avgX = selectedBlocks.reduce((sum, b) => sum + b.x, 0) / selectedBlocks.length;
    const avgY = selectedBlocks.reduce((sum, b) => sum + b.y, 0) / selectedBlocks.length;
    return { x: avgX, y: avgY };
  };

  // Обновление свойств блока
  const updateBlock = (id: string, updates: Partial<Block>) => {
    setState(prev => ({
      ...prev,
      blocks: prev.blocks.map(block =>
        block.id === id ? { ...block, ...updates } : block
      )
    }));
  };

  // Добавление нового блока
  const handleAddBlock = (type: Block['type']) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      x: 100,
      y: 100 + (state.blocks.length * 60),
      zIndex: state.blocks.length + 1,
      content: type === 'text' ? 'Новый текст' : '',
      url: type === 'image' ? '' : undefined,
      isConstant: false // Добавляем обязательное поле
    };

    setState(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
      selectedIds: [newBlock.id]
    }));
  };

  return (
    <div className="editor-container">
      <Toolbar 
        onAddBlock={handleAddBlock} 
        onGroup={groupSelected} 
      />
      
      <div className="editor-content">
        <div className="side-panel">
          <CanvasSettingsPanel
            settings={state.canvas}
            onUpdate={(settings: CanvasSettings) => setState({ ...state, canvas: settings })}
          />
          
          <LayersView 
            blocks={state.blocks} 
            onSelect={(id) => setState({...state, selectedIds: [id]})} 
          />
        </div>
        
        <div 
          className="canvas-area"
          style={{
            width: state.canvas.width,
            height: state.canvas.height,
            backgroundColor: state.canvas.backgroundColor,
            position: 'relative'
          }}
        >
          {state.blocks
            .sort((a, b) => a.zIndex - b.zIndex)
            .map(block => (
              <BlockComponent
                key={block.id}
                block={block}
                isSelected={state.selectedIds.includes(block.id)}
                onClick={() => setState({...state, selectedIds: [block.id]})}
                onPositionChange={updateBlockPosition}
              />
            ))}
        </div>
        
        {state.selectedIds.length === 1 && (
          <BlockInspector 
            block={state.blocks.find(b => b.id === state.selectedIds[0])!} 
            onUpdate={(updates) => updateBlock(state.selectedIds[0], updates)}
          />
        )}
      </div>
      
      <DataImporter onDataLoaded={(data) => console.log('Imported data:', data)} />
    </div>
  );
};