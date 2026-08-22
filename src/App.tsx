import { useState, useEffect } from "react";
import LayoutTop from "./components/LayoutTop";

// CORREÇÃO: usar o PortalAutenticacao ORIGINAL do AI Studio
import PortalAutenticacao from "./aistudio/src/components/PortalAutenticacao";

export default function App() {

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [browserIsLoggedOut, setBrowserIsLoggedOut] = useState(true);
  const [browserEmail, setBrowserEmail] = useState("carlos.adm@condomanager.pt");
  const [loginErrorMessage, setLoginErrorMessage] = useState("");
  const [currentRoute, setCurrentRoute] = useState("/");

  // Tema automático
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setTheme(mq.matches ? "dark" : "light");
    const handler = (e: any) => setTheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Login simples
  const handleLoginFromTop = (emailInput?: string) => {
    const cleanEmail = (emailInput || browserEmail).trim().toLowerCase();
    setBrowserEmail(cleanEmail);
    setBrowserIsLoggedOut(false);

    // Rota após login
    setCurrentRoute("/dashboard");
    window.history.pushState({}, "", "/dashboard");
  };

  // Roteamento interno simples
  useEffect(() => {
    const updateRoute = () => {
      const path = window.location.pathname;
      if (path === "/dashboard") setCurrentRoute("/dashboard"); else if (path === "/auth") setCurrentRoute("/auth");
      else setCurrentRoute("/");
    };
    updateRoute();
    window.addEventListener("popstate", updateRoute);
    return () => window.removeEventListener("popstate", updateRoute);
  }, []);

  // LOGIN
  if (browserIsLoggedOut) {
    if (currentRoute === "/auth") { return (<div className="h-screen w-screen flex items-center justify-center p-4"><PortalAutenticacao initialEmail={browserEmail} initialErrorMessage={loginErrorMessage} onLoginSuccess={handleLoginFromTop} /></div>); } if (currentRoute === "/") {
      return <LayoutTop onLoginSuccess={handleLoginFromTop} />;
    }
    return (
      <div className="h-screen w-screen flex items-center justify-center p-4">
        <PortalAutenticacao
          initialEmail={browserEmail}
          initialErrorMessage={loginErrorMessage}
          onLoginSuccess={handleLoginFromTop}
        />
      </div>
    );
  }

  // DASHBOARD SIMPLES (placeholder)
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <h1 className="text-3xl font-bold">Dashboard</h1>
    </div>
  );
}
