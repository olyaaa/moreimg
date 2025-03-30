import { rgbToHex } from './utils.js';

export function initPropertiesPanel(canvas) {
  const panel = document.getElementById('propertiesPanel');
  const objText = document.getElementById('objText');
  const objFontSize = document.getElementById('objFontSize');
  const objColor = document.getElementById('objColor');
  const objLeft = document.getElementById('objLeft');
  const objTop = document.getElementById('objTop');
  const objScale = document.getElementById('objScale');
  const objAngle = document.getElementById('objAngle');

  // Обработчики изменений свойств
  objText.addEventListener('change', () => updateSelectedText(canvas));
  objFontSize.addEventListener('change', () => updateSelectedFontSize(canvas));
  objColor.addEventListener('change', () => updateSelectedColor(canvas));
  objLeft.addEventListener('change', () => updateSelectedPosition(canvas));
  objTop.addEventListener('change', () => updateSelectedPosition(canvas));
  objScale.addEventListener('change', () => updateSelectedScale(canvas));
  objAngle.addEventListener('change', () => updateSelectedAngle(canvas));

  // Обработчики событий canvas
  canvas.on('selection:created', () => updatePropertiesPanel(canvas));
  canvas.on('selection:updated', () => updatePropertiesPanel(canvas));
  canvas.on('selection:cleared', () => panel.classList.remove('visible'));
  canvas.on('object:modified', () => updatePropertiesPanel(canvas));

  function updatePropertiesPanel() {
    const activeObject = canvas.getActiveObject();
    
    if (activeObject) {
      panel.classList.add('visible');
      
      objLeft.value = activeObject.left || 0;
      objTop.value = activeObject.top || 0;
      objScale.value = Math.round((activeObject.scaleX || 1) * 100);
      objAngle.value = activeObject.angle || 0;
      
      if (activeObject.type === 'text') {
        objText.value = activeObject.text || '';
        objFontSize.value = activeObject.fontSize || 20;
        objColor.value = rgbToHex(activeObject.fill || '#000000');
        
        objText.disabled = false;
        objFontSize.disabled = false;
        objColor.disabled = false;
      } else {
        objText.disabled = true;
        objFontSize.disabled = true;
        objColor.disabled = true;
      }
    } else {
      panel.classList.remove('visible');
    }
  }

  function updateSelectedText() {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'text') {
      activeObject.set('text', objText.value);
      canvas.renderAll();
    }
  }

  function updateSelectedFontSize() {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'text') {
      activeObject.set('fontSize', parseInt(objFontSize.value));
      canvas.renderAll();
    }
  }

  function updateSelectedColor() {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'text') {
      activeObject.set('fill', objColor.value);
      canvas.renderAll();
    }
  }

  function updateSelectedPosition() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({
        left: parseInt(objLeft.value),
        top: parseInt(objTop.value)
      });
      canvas.renderAll();
    }
  }

  function updateSelectedScale() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      const scale = parseInt(objScale.value) / 100;
      activeObject.set({
        scaleX: scale,
        scaleY: scale
      });
      canvas.renderAll();
    }
  }

  function updateSelectedAngle() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set('angle', parseInt(objAngle.value));
      canvas.renderAll();
    }
  }
}