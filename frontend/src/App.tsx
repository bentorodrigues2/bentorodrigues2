import { BrowserRouter, Routes, Route } from "react-router-dom";
import AIStudioWrapper from "./aistudio/AIStudioWrapper";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <h1>Frontend OK</h1>
              <a href="/app">Área Pessoal</a>
            </div>
          }
        />
        <Route path="/app/*" element={<AIStudioWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
