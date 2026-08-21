import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";

import Dashboard from "../pages/Dashboard";
import Condominios from "../pages/Condominios";
import Unidades from "../pages/Unidades";
import Financeiro from "../pages/Financeiro";
import Manutencao from "../pages/Manutencao";
import Configuracoes from "../pages/Configuracoes";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Recover from "../pages/auth/Recover";

export const router = createBrowserRouter([
  {
    path: "/auth",
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "recover", element: <Recover /> },
    ],
  },

  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "condominios", element: <Condominios /> },
      { path: "unidades", element: <Unidades /> },
      { path: "financeiro", element: <Financeiro /> },
      { path: "manutencao", element: <Manutencao /> },
      { path: "configuracoes", element: <Configuracoes /> },
    ],
  },
]);
