export function addImage(canvas) {
  try {
    const imageUrl = prompt('Введите URL изображения:');
    if (!imageUrl) return;

    fabric.Image.fromURL(imageUrl, img => {
      img.set({
        left: 100,
        top: 100,
        scaleX: 0.5,
        scaleY: 0.5,
        hasControls: true,
        hasBorders: true
      });
      
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      
      console.log("Изображение добавлено:", img);
    }, {
      crossOrigin: 'anonymous',
      errorHandler: (error) => {
        console.error("Ошибка загрузки:", error);
        alert("Не удалось загрузить изображение. Проверьте URL и CORS политику.");
      }
    });
  } catch (error) {
    console.error("Ошибка в addImage:", error);
  }
}

export function addText(canvas) {
  try {
    const text = new fabric.Text('Новый текст', {
      left: 100,
      top: 100,
      fontSize: 20,
      fill: 'black',
      hasControls: true,
      hasBorders: true
    });
    
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    
    console.log("Текст добавлен:", text);
  } catch (error) {
    console.error("Ошибка в addText:", error);
  }
}

export function deleteSelected(canvas) {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    canvas.remove(activeObject);
  }
}