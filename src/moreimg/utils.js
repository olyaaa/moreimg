 export function rgbToHex(color) {
  if (!color) return '#000000';
  if (color.indexOf('#') === 0) return color;
  
  if (color.indexOf('rgba') === 0) {
    color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
    return rgbToHex(`rgb(${color[1]},${color[2]},${color[3]})`);
  }
  
  if (color.indexOf('rgb') === 0) {
    color = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    return '#' + 
      ('0' + parseInt(color[1], 10).toString(16)).slice(-2) +
      ('0' + parseInt(color[2], 10).toString(16)).slice(-2) +
      ('0' + parseInt(color[3], 10).toString(16)).slice(-2);
  }
  
  return color;
}