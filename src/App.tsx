import { Editor } from './components/Editor/Editor'; // Новый путь

const App = () => {  // Изменяем на обычную функцию
  return (
    <div className="app">
      <Editor />
    </div>
  );
};

export default App;