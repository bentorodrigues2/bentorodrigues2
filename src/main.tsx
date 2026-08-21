import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { aiStudioRouter } from "./aistudio/AIStudioRouter";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={aiStudioRouter} />
  </React.StrictMode>
);
