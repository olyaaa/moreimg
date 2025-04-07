// src/components/CanvasSettings/CanvasSettings.tsx
import React, { useState } from 'react';
import { CanvasSettings } from '../../types';

interface CanvasSettingsPanelProps {
  settings: CanvasSettings;
  onUpdate: (settings: CanvasSettings) => void;
}

/*export const Canvas = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { data } = useDataImporter(); // Предположим, что данные загружаются здесь

  return (
    <div className="canvas-container">
      <div className="canvas" ref={canvasRef}>
        // Ваши блоки рендерятся здесь
      </div>
      <Exporter data={data} canvasRef={canvasRef} />
    </div>
  );
};*/

export const CanvasSettingsPanel = ({
  settings,
  onUpdate
}: {
  settings: CanvasSettings;
  onUpdate: (settings: CanvasSettings) => void;
}) => {
  const [form, setForm] = useState(settings);

  return (
    <div className="canvas-settings">
      <h3>Настройки холста</h3>
      <div>
        <label>Ширина:</label>
        <input 
          type="number" 
          value={form.width}
          onChange={(e) => setForm({...form, width: Number(e.target.value)})}
        />
      </div>
      <div>
        <label>Высота:</label>
        <input 
          type="number" 
          value={form.height}
          onChange={(e) => setForm({...form, height: Number(e.target.value)})}
        />
      </div>
      <div>
        <label>Цвет фона:</label>
        <input 
          type="color" 
          value={form.backgroundColor}
          onChange={(e) => setForm({...form, backgroundColor: e.target.value})}
        />
      </div>
      <button onClick={() => onUpdate(form)}>Применить</button>
    </div>
  );
};