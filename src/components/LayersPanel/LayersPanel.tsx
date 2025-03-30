// src/components/LayersPanel/LayersPanel.tsx
import React from 'react';
import { Layer } from '../../types';

interface LayersPanelProps {
  layers: Layer[];
  currentLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onAddLayer: () => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
}

export const LayersPanel = ({
  layers,
  currentLayerId,
  onSelectLayer,
  onAddLayer,
  onToggleVisibility,
  onToggleLock
}: {
  layers: Layer[];
  currentLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onAddLayer: () => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
}) => {
  return (
    <div className="layers-panel">
      <div className="layers-header">
        <h3>Слои</h3>
        <button onClick={onAddLayer}>+</button>
      </div>
      
      <div className="layers-list">
        {layers.map(layer => (
          <div 
            key={layer.id} 
            className={`layer-item ${layer.id === currentLayerId ? 'active' : ''}`}
            onClick={() => onSelectLayer(layer.id)}
          >
            <span 
              className="visibility-toggle"
              onClick={(e) => { e.stopPropagation(); onToggleVisibility(layer.id); }}
            >
              {layer.visible ? '👁️' : '🚫'}
            </span>
            
            <span className="layer-name">{layer.name}</span>
            
            <span 
              className="lock-toggle"
              onClick={(e) => { e.stopPropagation(); onToggleLock(layer.id); }}
            >
              {layer.locked ? '🔒' : '🔓'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};