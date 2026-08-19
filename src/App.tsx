import React from "react";
import "./App.css";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import AIStudioRouter from "./aistudio/router";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <h1>Frontend restaurado</h1>
        <p>O projeto voltou ao estado funcional.</p>

        <AIStudioRouter />
      </div>
    </BrowserRouter>
  );
}

export default App;
