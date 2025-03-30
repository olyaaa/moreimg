import { addImage, addText, deleteSelected } from './objectManager.js';
import { saveTemplate, loadTemplate, loadExcel } from './fileManager.js';

function debounce(func, delay) {
  let timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, arguments), delay);
  };
}

export function setupEventListeners(canvas, appState) {
  const elements = {
    widthInput: document.getElementById('canvasWidth'),
    heightInput: document.getElementById('canvasHeight'),
    colorInput: document.getElementById('canvasColor'),
    bgImageBtn: document.getElementById('setBackgroundImageBtn'),
    addImageBtn: document.getElementById('addImageBtn'),
    addTextBtn: document.getElementById('addTextBtn'),
    deleteSelectedBtn: document.getElementById('deleteSelectedBtn'),
    saveTemplateBtn: document.getElementById('saveTemplateBtn'),
    loadTemplateBtn: document.getElementById('loadTemplateBtn'),
    loadExcelBtn: document.getElementById('loadExcelBtn'),
    zoomIn: document.getElementById('zoomIn'),
    zoomOut: document.getElementById('zoomOut'),
    resetZoom: document.getElementById('resetZoom'),
    zoomSlider: document.getElementById('zoomSlider')
  };

  // Проверка существования элементов
  if (!elements.zoomIn || !elements.zoomOut || !elements.resetZoom || !elements.zoomSlider) {
    console.error('Не найдены элементы управления зумом');
    return;
  }

  // Функция обновления размеров холста
  const updateCanvasSize = debounce(() => {
    const width = Math.max(1, Math.min(10000, parseInt(elements.widthInput.value) || 1000));
    const height = Math.max(1, Math.min(10000, parseInt(elements.heightInput.value) || 1000));
    
    elements.widthInput.value = width;
    elements.heightInput.value = height;
    appState.canvas = { ...appState.canvas, width, height };
    
    canvas.setDimensions({ width, height });
    canvas.renderAll();
  }, 200);

  // Инициализация управления зумом
  const initZoomControls = () => {
    // Обновление слайдера
    const updateSlider = () => {
      elements.zoomSlider.value = Math.round(canvas.getZoom() * 100);
    };

    // Кнопка увеличения
    elements.zoomIn.addEventListener('click', () => {
      const newZoom = Math.min(5, canvas.getZoom() + 0.25);
      canvas.setZoom(newZoom);
      updateSlider();
    });

    // Кнопка уменьшения
    elements.zoomOut.addEventListener('click', () => {
      const newZoom = Math.max(0.1, canvas.getZoom() - 0.25);
      canvas.setZoom(newZoom);
      updateSlider();
    });

    // Сброс зума
    elements.resetZoom.addEventListener('click', () => {
      canvas.__zoom = 1;
      canvas.__pan = { x: 0, y: 0 };
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      canvas.requestRenderAll();
      updateSlider();
    });

    // Слайдер зума
    elements.zoomSlider.addEventListener('input', (e) => {
      canvas.zoomToPoint(
        { x: canvas.width/2, y: canvas.height/2 },
        parseInt(e.target.value)
      );
    });

    // Инициализация начального значения
    updateSlider();
  };
  
    // Инициализация зума
  initZoomControls();

  // Основные обработчики событий
  elements.colorInput?.addEventListener('input', (e) => {
    canvas.setBackgroundColor(e.target.value);
    appState.canvas.bgColor = e.target.value;
    canvas.renderAll();
  });

  elements.bgImageBtn?.addEventListener('click', async () => {
    try {
      const imageUrl = prompt('Введите URL изображения:');
      if (!imageUrl) return;
      
      const img = await new Promise((resolve, reject) => {
        fabric.Image.fromURL(imageUrl, resolve, {
          crossOrigin: 'anonymous',
          errorHandler: reject
        });
      });
      
      img.set({
        scaleX: canvas.width / img.width,
        scaleY: canvas.height / img.height,
        selectable: false
      });
      
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error);
      alert('Не удалось загрузить изображение');
    }
  });

  // Обработчики для работы с объектами
  elements.addImageBtn?.addEventListener('click', () => addImage(canvas));
  elements.addTextBtn?.addEventListener('click', () => addText(canvas));
  elements.deleteSelectedBtn?.addEventListener('click', () => deleteSelected(canvas));
  
  // Обработчики для работы с файлами
  elements.saveTemplateBtn?.addEventListener('click', () => saveTemplate(canvas));
  elements.loadTemplateBtn?.addEventListener('click', () => loadTemplate(canvas));
  elements.loadExcelBtn?.addEventListener('click', loadExcel);

  // Обработчики изменения размеров
  elements.widthInput.addEventListener('input', updateCanvasSize);
  elements.heightInput.addEventListener('input', updateCanvasSize);

  // Инициализация значений по умолчанию
  elements.widthInput.value = appState.canvas.width;
  elements.heightInput.value = appState.canvas.height;
  elements.colorInput.value = appState.canvas.bgColor;

}