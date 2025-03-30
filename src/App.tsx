// src/App.tsx
import { Canvas } from './components/Canvas/Canvas';
import { Toolbar } from './components/Toolbar/Toolbar';
import { useDrawing } from './hooks/useDrawing';

function App() {
  const { tool, setTool } = useDrawing();
  return (
    <div className="app">
      <Toolbar tool={tool} setTool={setTool} />
      <Canvas />
    </div>
  );
}
export default App;