import { ThemeProvider } from './contexts/ThemeContext';
import { Editor } from './components/Editor/Editor'; // или import Editor from './components/Editor/Editor';

function App() {
  console.log('App component renders'); // Добавьте это
  return (
    <ThemeProvider>
      <Editor />
    </ThemeProvider>
  );
}

export default App;