// src/components/CanvasSettings/CanvasSettings.tsx
import React, { useState } from 'react';
import { CanvasSettings } from '../../types';

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