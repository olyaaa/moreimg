import { ThemeProvider } from './contexts/ThemeContext';
import { Editor } from './components/Editor/Editor'; // или import Editor from './components/Editor/Editor';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

function App() {
  console.log('App component renders'); // Добавьте это
  return (
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider>
        <Editor />
      </ThemeProvider>
    </DndProvider>
  );
}

export default App;