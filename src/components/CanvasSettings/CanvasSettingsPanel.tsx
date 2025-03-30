import React, { useState } from 'react';

interface CanvasSettings {
  width: number;
  height: number;
  backgroundColor: string;
}

interface CanvasSettingsPanelProps {
  settings: CanvasSettings;
  onUpdate: (settings: CanvasSettings) => void;
}

export const CanvasSettingsPanel: React.FC<CanvasSettingsPanelProps> = ({ 
  settings, 
  onUpdate 
}) => {
  const [form, setForm] = useState<CanvasSettings>(settings);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: CanvasSettings) => ({
      ...prev,
      [name]: name === 'width' || name === 'height' ? Number(value) : value
    }));
  };

  return (
    <div className="canvas-settings">
      <h3>Canvas Settings</h3>
      <div>
        <label>Width:</label>
        <input
          name="width"
          type="number"
          value={form.width}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Height:</label>
        <input
          name="height"
          type="number"
          value={form.height}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Background:</label>
        <input
          name="backgroundColor"
          type="color"
          value={form.backgroundColor}
          onChange={handleChange}
        />
      </div>
      <button onClick={() => onUpdate(form)}>Apply</button>
    </div>
  );
};
