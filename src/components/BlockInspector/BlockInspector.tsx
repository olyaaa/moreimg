import React from 'react';
import { Block } from '../../types';

const DEFAULT_FONT_SIZE = 16;

interface BlockInspectorProps {
  blocks: Block[];
  onUpdate: (updates: Partial<Block>) => void;
}

export const BlockInspector: React.FC<BlockInspectorProps> = ({ blocks, onUpdate }) => {
  const firstBlock = blocks[0];
  const isMultiple = blocks.length > 1;

  if (!firstBlock) return null;
  const block = firstBlock;

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
                value={block.x}
                onChange={handleChange}
              />
            </label>
            <label>
              Y:
              <input
                type="number"
                name="y"
                value={block.y}
                onChange={handleChange}
              />
            </label>
          </div>
        </div>
      ) : (
        <form className="block-properties">
          <label htmlFor="type">Тип:</label>
          <input type="text" id="type" value={block.type} disabled />

          <label htmlFor="x">X:</label>
          <input
            type="number"
            id="x"
            name="x"
            value={block.x}
            onChange={handleChange}
          />

          <label htmlFor="y">Y:</label>
          <input
            type="number"
            id="y"
            name="y"
            value={block.y}
            onChange={handleChange}
          />

          {block.type === 'text' && (
            <>
              <label htmlFor="content">Текст:</label>
              <input
                type="text"
                id="content"
                name="content"
                value={block.content || ''}
                onChange={handleChange}
              />
              <label htmlFor="color">Цвет:</label>
              <input
                type="color"
                id="color"
                name="color"
                value={block.color || '#cccccc'}
                onChange={handleChange}
              />

              {/* Прозрачность */}
              <div className="property-group">
                <label>Прозрачность:</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={block.opacity ?? 1}
                  onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) })}
                />
                <span>{Math.round((block.opacity ?? 1) * 100)}%</span>
              </div>

              {/* Тип заливки */}
              <div className="property-group">
                <label>Тип заливки:</label>
                <select
                  value={block.fillType || 'solid'}
                  onChange={(e) => onUpdate({ fillType: e.target.value as 'solid' | 'gradient' })}
                >
                  <option value="solid">Сплошная</option>
                  <option value="gradient">Градиент</option>
                </select>

                {/* Настройки градиента */}
                {block.fillType === 'gradient' && (
                  <div className="gradient-settings">
                    <label>Тип градиента:</label>
                    <select
                      value={block.gradient?.type || 'linear'}
                      onChange={(e) =>
                        onUpdate({
                          gradient: {
                            type: e.target.value as 'linear' | 'radial',
                            colors: block.gradient?.colors || ['#000000', '#ffffff'],
                            direction: block.gradient?.direction,
                          }
                        })
                      }
                    >
                      <option value="linear">Линейный</option>
                      <option value="radial">Радиальный</option>
                    </select>

                    {block.gradient?.type === 'linear' && (
                      <label>
                        Направление (градусы):
                        <input
                          type="number"
                          value={block.gradient?.direction ?? 0}
                          onChange={(e) =>
                            onUpdate({
                              gradient: {
                                ...block.gradient!,
                                direction: Number(e.target.value),
                              }
                            })
                          }
                        />
                      </label>
                    )}

                    <label>Цвета (через запятую):</label>
                    <input
                      type="text"
                      value={block.gradient?.colors?.join(', ') || ''}
                      onChange={(e) => {
                        const colors = e.target.value.split(',').map(s => s.trim());
                        onUpdate({
                          gradient: {
                            type: block.gradient?.type || 'linear',
                            colors,
                            direction: block.gradient?.direction,
                          }
                        });
                      }}
                      placeholder="Например: #ff0000, #00ff00"
                    />
                  </div>
                )}
              </div>

              <label htmlFor="fontSize">Размер шрифта:</label>
              <input
                type="number"
                id="fontSize"
                name="fontSize"
                value={block.fontSize || DEFAULT_FONT_SIZE}
                onChange={handleChange}
              />
            </>
          )}

          {block.type === 'image' && (
            <>
              <label htmlFor="url">URL изображения:</label>
              <input
                type="text"
                id="url"
                name="url"
                value={block.url || ''}
                onChange={handleChange}
              />
              <label htmlFor="width">Ширина:</label>
              <input
                type="number"
                id="width"
                name="width"
                value={block.width || 200}
                onChange={handleChange}
              />
              <label htmlFor="height">Высота:</label>
              <input
                type="number"
                id="height"
                name="height"
                value={block.height || 200}
                onChange={handleChange}
              />
            </>
          )}

          {block.type === 'shape' && (
            <>
              <label htmlFor="shapeType">Тип фигуры:</label>
              <select
                id="shapeType"
                name="shapeType"
                value={block.shapeType || 'rectangle'}
                onChange={handleChange}
              >
                <option value="rectangle">Прямоугольник</option>
                <option value="circle">Круг</option>
                <option value="triangle">Треугольник</option>
              </select>

              <label htmlFor="color">Цвет:</label>
              <input
                type="color"
                id="color"
                name="color"
                value={block.color || '#cccccc'}
                onChange={handleChange}
              />

              <label htmlFor="shapeWidth">Ширина:</label>
              <input
                type="number"
                id="shapeWidth"
                name="width"
                value={block.width || 100}
                onChange={handleChange}
              />

              <label htmlFor="shapeHeight">Высота:</label>
              <input
                type="number"
                id="shapeHeight"
                name="height"
                value={block.height || 100}
                onChange={handleChange}
              />
            </>
          )}
        </form>
      )}
    </div>
  );
};