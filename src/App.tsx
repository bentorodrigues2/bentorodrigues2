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
              <a href="/app">√Årea Pessoal</a>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { askAI } from "../aistudio/useAI";

async function testAI() {
  const reply = await askAI("Ol·, quem Ès tu?");
  console.log("AI Studio:", reply);
}

testAI();
