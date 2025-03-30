import { rgbToHex } from './utils.js';

export function initCanvas(canvasId, width = 1000, height = 1000, backgroundColor = '#ffffff') {
  const canvas = new fabric.Canvas(canvasId, {
    width,
    height,
    backgroundColor,
    preserveObjectStacking: true,
    renderOnAddRemove: false,
    selection: true,
    allowTouchScrolling: true,
    stopContextMenu: true,
    // Добавляем эти параметры для корректного зума
    fireRightClick: true,
    fireMiddleClick: true,
    stateful: true
  });

  // Инициализация зума и панорамирования
  canvas.zoom = 1;
  canvas.__pan = { x: 0, y: 0 };

  // Методы для работы с зумом
  canvas.getZoom = function() {
    return this.zoom;
  };

  canvas.setZoom = function(zoomLevel, point = { x: this.width/2, y: this.height/2 }) {
    const oldZoom = this.__zoom;
    this.__zoom = Math.max(0.1, Math.min(5, zoomLevel));
    
    // Вычисляем новые координаты панорамирования
    const zoomRatio = this.__zoom / oldZoom;
    this.__pan.x = point.x - (point.x - this.__pan.x) * zoomRatio;
    this.__pan.y = point.y - (point.y - this.__pan.y) * zoomRatio;
    
    // Применяем трансформацию
    this.setViewportTransform([
      this.__zoom, 0, 0, this.__zoom,
      this.__pan.x, this.__pan.y
    ]);
    
    this.requestRenderAll();
    return this.__zoom;
  };

  canvas.zoomToPoint = function(point, zoomLevel) {
    const oldZoom = this.zoom;
    this.zoom = Math.max(0.1, Math.min(5, zoomLevel / 100));
    
    // Рассчитываем новую точку центра
    const center = point || { x: this.width/2, y: this.height/2 };
    
    // Вычисляем смещение для сохранения точки под курсором
    const zoomRatio = this.zoom / oldZoom;
    this.panX = center.x - (center.x - this.panX) * zoomRatio;
    this.panY = center.y - (center.y - this.panY) * zoomRatio;
    
    // Применяем трансформацию
    this.setViewportTransform([
      this.zoom, 0, 0, this.zoom,
      this.panX, this.panY
    ]);
    
    this.fire('zoom:changed', { zoom: this.zoom * 100 });
  };

  // Метод для изменения размеров холста с учетом зума
  canvas.updateSize = function(width, height) {
    width = Math.max(1, Math.min(10000, width));
    height = Math.max(1, Math.min(10000, height));
    
    // Корректируем панорамирование при изменении размера
    const ratioX = width / this.width;
    const ratioY = height / this.height;
    this.__pan.x *= ratioX;
    this.__pan.y *= ratioY;
    
    this.setDimensions({ width, height });
    this.setViewportTransform([
      this.__zoom, 0, 0, this.__zoom,
      this.__pan.x, this.__pan.y
    ]);
    
    if (this.backgroundImage) {
      this.backgroundImage.set({
        scaleX: width / this.backgroundImage.width,
        scaleY: height / this.backgroundImage.height
      });
    }
    
    this.requestRenderAll();
  };

 // Оптимизированный метод изменения цвета
  canvas.updateBackgroundColor = function(color) {
    requestAnimationFrame(() => {
      this.setBackgroundColor(color, () => {
        this.renderAll();
      });
    });
  };

  // Метод для фонового изображения
  canvas.setBackgroundImage = function(url) {
    fabric.Image.fromURL(url, (img) => {
      requestAnimationFrame(() => {
        img.set({
          originX: 'left',
          originY: 'top',
          left: 0,
          top: 0,
          scaleX: this.width / img.width,
          scaleY: this.height / img.height,
          selectable: false,
          evented: false
        });
        this.setBackgroundImage(img, () => {
          this.renderAll();
        });
      });
    }, { crossOrigin: 'anonymous' });
  };
  setupCanvasZoom(canvas);
  
  return canvas;
}

function setupCanvasZoom(canvas) {
  // Зум колесом мыши
  canvas.on('mouse:wheel', function(opt) {
    const delta = opt.e.deltaY;
    const zoom = canvas.getZoom() * (delta > 0 ? 0.9 : 1.1);
    
    canvas.setZoom(zoom, {
      x: opt.e.offsetX,
      y: opt.e.offsetY
    });
    
    opt.e.preventDefault();
    opt.e.stopPropagation();
  });

  // Перемещение холста при зажатом пробеле
  let isSpacePressed = false;
  let isDragging = false;
  let lastPos = { x: 0, y: 0 };

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      isSpacePressed = true;
      canvas.defaultCursor = 'grab';
      canvas.renderAll();
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
      isSpacePressed = false;
      canvas.defaultCursor = 'default';
      canvas.renderAll();
    }
  });

  canvas.on('mouse:down', (opt) => {
    if (isSpacePressed) {
      isDragging = true;
      lastPos = { x: opt.e.clientX, y: opt.e.clientY };
      canvas.defaultCursor = 'grabbing';
      canvas.renderAll();
    }
  });

  canvas.on('mouse:move', (opt) => {
    if (isDragging && isSpacePressed) {
      const dx = opt.e.clientX - lastPos.x;
      const dy = opt.e.clientY - lastPos.y;
      
      canvas.__pan.x += dx;
      canvas.__pan.y += dy;
      
      canvas.setViewportTransform([
        canvas.__zoom, 0, 0, canvas.__zoom,
        canvas.__pan.x, canvas.__pan.y
      ]);
      
      lastPos = { x: opt.e.clientX, y: opt.e.clientY };
    }
  });

  canvas.on('mouse:up', () => {
    if (isDragging) {
      isDragging = false;
      canvas.defaultCursor = isSpacePressed ? 'grab' : 'default';
      canvas.renderAll();
    }
  });
}