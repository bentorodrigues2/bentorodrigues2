import { BrowserRouter, Routes, Route } from "react-router-dom";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
