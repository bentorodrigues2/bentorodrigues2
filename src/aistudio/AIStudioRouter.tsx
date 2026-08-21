import { createBrowserRouter } from "react-router-dom";
import AIStudioApp from "./AIStudioApp";

import Dashboard from "../pages/Dashboard";
import Predios from "../pages/Predios";
import Fracoes from "../pages/Fracoes";
import Fornecedores from "../pages/Fornecedores";
import Movimentos from "../pages/Movimentos";
import Reservas from "../pages/Reservas";
import Documentos from "../pages/Documentos";
import Juridico from "../pages/Juridico";
import Auditoria from "../pages/Auditoria";
import Manutencao from "../pages/Manutencao";
import PortalCondomino from "../pages/PortalCondomino";

export const aiStudioRouter = createBrowserRouter([
  {
    path: "/",
    element: <AIStudioApp />,
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "predios", element: <Predios /> },
      { path: "fracoes", element: <Fracoes /> },
      { path: "fornecedores", element: <Fornecedores /> },
      { path: "movimentos", element: <Movimentos /> },
      { path: "reservas", element: <Reservas /> },
      { path: "documentos", element: <Documentos /> },
      { path: "juridico", element: <Juridico /> },
      { path: "auditoria", element: <Auditoria /> },
      { path: "manutencao", element: <Manutencao /> },
      { path: "portal", element: <PortalCondomino /> },
    ],
  },
]);
