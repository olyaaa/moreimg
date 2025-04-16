import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Block } from '../../types';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

console.log('Root element:', document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

const DEFAULT_FONT_SIZE = 16;

interface BlockInspectorProps {
  blocks: Block[];
  onUpdate: (updates: Partial<Block>) => void;
}

export const BlockInspector: React.FC<BlockInspectorProps> = ({ blocks, onUpdate }) => {
  const firstBlock = blocks[0];
  const isMultiple = blocks.length > 1;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const target = e.target;
    let value: string | number | boolean = target.value;
    
    if (target.type === 'number') {
      value = Number(target.value);
    } else if (target.type === 'checkbox') {
      value = (target as HTMLInputElement).checked;
    }

    onUpdate({
      [target.name]: value
    });
  };

  // Для цветового поля можно оставить отдельный обработчик
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ color: e.target.value });
  };

  return (
    <div className="block-inspector">
      {isMultiple ? (
        <div className="multiple-selection">
          <p>Выбрано блоков: {blocks.length}</p>
          <div className="common-properties">
            <label>
              X:
              <input
                type="number"
                name="x"
                value={firstBlock.x}
                onChange={handleChange}
              />
            </label>
            <label>
              Y:
              <input
                type="number"
                name="y"
                value={firstBlock.y}
                onChange={handleChange}
              />
            </label>
          </div>
        </div>
      ) : (
        <form className="block-properties">
          <label>
            Тип:
            <input type="text" value={firstBlock.type} disabled />
          </label>
          
          <label>
            X:
            <input
              type="number"
              name="x"
              value={firstBlock.x}
              onChange={handleChange}
            />
          </label>
          
          <label>
            Y:
            <input
              type="number"
              name="y"
              value={firstBlock.y}
              onChange={handleChange}
            />
          </label>
          
          {firstBlock.type === 'text' && (
            <>
              <label>
                Текст:
                <input
                  type="text"
                  name="content"
                  value={firstBlock.content || ''}
                  onChange={handleChange}
                />
              </label>
              <label>
                Размер шрифта:
                <input
                  type="number"
                  name="fontSize"
                  value={firstBlock.fontSize || DEFAULT_FONT_SIZE}
                  onChange={handleChange}
                />
              </label>
            </>
          )}
          
    {firstBlock.type === 'image' && (
      <>
        <label>
          URL изображения:
          <input
            type="text"
            name="url"
            value={firstBlock.url || ''}
            onChange={handleChange}
          />
        </label>
        <label>
          Ширина:
          <input
            type="number"
            name="width"
            value={firstBlock.width || 200}
            onChange={handleChange}
            min="1"
          />
        </label>
        <label>
          Высота:
          <input
            type="number"
            name="height"
            value={firstBlock.height || 200}
            onChange={handleChange}
            min="1"
          />
        </label>
      </>
    )}

    {firstBlock.type === 'shape' && (
      <>
        <label>
          Тип фигуры:
          <select
            name="shapeType"
            value={firstBlock.shapeType || 'rectangle'}
            onChange={handleChange}
          >
            <option value="rectangle">Прямоугольник</option>
            <option value="circle">Круг</option>
            <option value="triangle">Треугольник</option>
          </select>
        </label>
        <label>
          Цвет:
          <input
            type="color"
            name="color"
            value={firstBlock.color || '#cccccc'}
            onChange={handleChange}
          />
        </label>
        <label>
          Ширина:
          <input
            type="number"
            name="width"
            value={firstBlock.width || 100}
            onChange={handleChange}
            min="1"
          />
        </label>
        <label>
          Высота:
          <input
            type="number"
            name="height"
            value={firstBlock.height || 100}
            onChange={handleChange}
            min="1"
          />
        </label>
      </>
    )}

        </form>
      )}
    </div>
  );
};