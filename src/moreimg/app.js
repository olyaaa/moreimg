import { initCanvas } from './canvasManager.js';
import { setupEventListeners } from './eventManager.js';
import { initPropertiesPanel } from './propertiesPanel.js';

const appState = {
  isControlsHidden: false,
  canvas: {
    width: 1000,
    height: 1000,
    bgColor: '#ffffff'
  }
};

function toggleControls() {
  appState.isControlsHidden = !appState.isControlsHidden;
  const controls = document.querySelector('.controls');
  controls.classList.toggle('hidden', appState.isControlsHidden);
  localStorage.setItem('controlsHidden', appState.isControlsHidden);
}

export function initApp() {
  const canvas = initCanvas('canvas', appState.canvas.width, appState.canvas.height, appState.canvas.bgColor);

  // Проверяем, что методы существуют
  if (!canvas.getZoom || !canvas.setZoom) {
    console.error('Методы зума не были добавлены к canvas');
    return;
  }
  
  // Инициализация всех модулей
  setupEventListeners(canvas, appState);
  initPropertiesPanel(canvas);
  
  // Восстановление состояния
  appState.isControlsHidden = localStorage.getItem('controlsHidden') === 'true';
  document.querySelector('.controls').classList.toggle('hidden', appState.isControlsHidden);
  document.getElementById('togglePanelBtn').addEventListener('click', toggleControls);
  
  // Тема
  if (localStorage.getItem('theme') === 'dark') {
    document.body.dataset.theme = 'dark';
  }

  // Переносим логирование сюда, после полной инициализации
  console.log('Canvas initialized:', canvas);
  console.log('Current appState:', appState);
  console.log('Canvas zoom:', canvas.getZoom());
  console.log('Canvas dimensions:', canvas.width, canvas.height);
}

// Исправляем вызов initApp
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});