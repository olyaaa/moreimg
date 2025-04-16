import React, { useState } from 'react';
import { CanvasSettings } from '../../types';

interface CanvasSettingsPanelProps {
  settings: CanvasSettings;
  onUpdate: (settings: CanvasSettings) => void;
  language?: 'ru' | 'en';
}

const translations = {
  title: { en: 'Canvas Settings', ru: 'Настройки холста' },
  width: { en: 'Width', ru: 'Ширина' },
  height: { en: 'Height', ru: 'Высота' },
  background: { en: 'Background', ru: 'Цвет фона' },
  opacity: { en: 'Opacity', ru: 'Прозрачность' },
  fillType: { en: 'Fill Type', ru: 'Тип фона' },
  gradient: { en: 'Gradient', ru: 'Градиент' },
  gradientColors: { en: 'Gradient colors', ru: 'Цвета градиента (через запятую)' },
  gradientType: { en: 'Gradient type', ru: 'Тип градиента' },
  direction: { en: 'Direction (deg)', ru: 'Угол (градусов)' },
  solid: { en: 'Solid', ru: 'Сплошной' },
  linear: { en: 'Linear', ru: 'Линейный' },
  radial: { en: 'Radial', ru: 'Радиальный' },
  apply: { en: 'Apply', ru: 'Применить' }
};

export const CanvasSettingsPanel: React.FC<CanvasSettingsPanelProps> = ({
  settings,
  onUpdate,
  language = 'en',
}) => {
  const [form, setForm] = useState<CanvasSettings>(settings);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  // Прозрачность — отдельный обработчик, так как range всегда string
  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({
      ...prev,
      opacity: parseFloat(e.target.value),
    }));
  };

  // Для изменения типа фона
  const handleFillTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm(prev => ({
      ...prev,
      fillType: e.target.value as 'solid' | 'gradient'
    }));
  };

  // Для изменения типа градиента
  const handleGradientTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm(prev => ({
      ...prev,
      gradient: {
        ...prev.gradient,
        type: e.target.value as 'linear' | 'radial'
      }
    }))
  };

  // Для изменения цветов градиента
  const handleGradientColorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({
      ...prev,
      gradient: {
        ...prev.gradient,
        colors: e.target.value.split(',').map(s => s.trim())
      }
    }))
  };

  // Для изменения направления градиента
  const handleGradientDirectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({
      ...prev,
      gradient: {
        ...prev.gradient,
        direction: Number(e.target.value)
      }
    }))
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(form);
  };

  return (
    <form className="canvas-settings" onSubmit={handleSubmit}>
      <h3>{translations.title[language]}</h3>
      <div>
        <label>{translations.width[language]}:</label>
        <input
          name="width"
          type="number"
          min={100}
          max={5000}
          value={form.width}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>{translations.height[language]}:</label>
        <input
          name="height"
          type="number"
          min={100}
          max={5000}
          value={form.height}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>{translations.background[language]}:</label>
        <input
          name="backgroundColor"
          type="color"
          value={form.backgroundColor}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>{translations.opacity[language]}:</label>
        <input
          name="opacity"
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={form.opacity}
          onChange={handleOpacityChange}
        />
        <span>{Math.round((form.opacity ?? 1) * 100)}%</span>
      </div>
      <div>
        <label>{translations.fillType[language]}:</label>
        <select
          name="fillType"
          value={form.fillType}
          onChange={handleFillTypeChange}
        >
          <option value="solid">{translations.solid[language]}</option>
          <option value="gradient">{translations.gradient[language]}</option>
        </select>
      </div>
      {form.fillType === 'gradient' && (
        <div>
          <label>{translations.gradientType[language]}:</label>
          <select
            value={form.gradient.type}
            onChange={handleGradientTypeChange}
          >
            <option value="linear">{translations.linear[language]}</option>
            <option value="radial">{translations.radial[language]}</option>
          </select>
          {form.gradient.type === 'linear' && (
            <>
              <label>{translations.direction[language]}:</label>
              <input
                type="number"
                value={form.gradient.direction ?? 90}
                onChange={handleGradientDirectionChange}
              />
            </>
          )}
                    <label>{translations.gradientColors[language]}:</label>
          <input
            type="text"
            value={form.gradient.colors.join(', ')}
            onChange={handleGradientColorsChange}
            placeholder="#ff0000, #00ff00"
          />
        </div>
      )}

      <button type="submit">{translations.apply[language]}</button>
    </form>
  );
};