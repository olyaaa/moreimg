import { Editor } from './components/Editor/Editor'; // Новый путь

function App() {
  return (
    <div className="app">
      <Editor /> {/* Используем Editor вместо Canvas+Toolbar */}
    </div>
  );
}