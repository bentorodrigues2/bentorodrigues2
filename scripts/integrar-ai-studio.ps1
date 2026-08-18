Write-Host "Iniciando integração do AI Studio..."

$base = "frontend/src/aistudio"

# Criar pastas
New-Item -ItemType Directory -Force -Path $base | Out-Null
New-Item -ItemType Directory -Force -Path "$base/pages" | Out-Null

# Router interno
$router = @'
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Browser from "./pages/Browser";

export default function AIStudioRouter() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="browser" element={<Browser />} />
    </Routes>
  );
}
'@

Set-Content "$base/router.tsx" $router

# Wrapper
$wrapper = @'
import AIStudioRouter from "./router";

export default function AIStudioApp() {
  return (
    <div style={{ padding: "20px" }}>
      <AIStudioRouter />
    </div>
  );
}
'@

Set-Content "$base/AIStudioApp.tsx" $wrapper

# Páginas
$login = @'
export default function Login() {
  return <h1>AI Studio Login</h1>;
}
'@
Set-Content "$base/pages/Login.tsx" $login

$dashboard = @'
export default function Dashboard() {
  return <h1>AI Studio Dashboard</h1>;
}
'@
Set-Content "$base/pages/Dashboard.tsx" $dashboard

$browser = @'
export default function Browser() {
  return <h1>AI Studio Browser</h1>;
}
'@
Set-Content "$base/pages/Browser.tsx" $browser

Write-Host "Integração concluída."
Write-Host "Agora podes colar o AI Studio dentro de frontend/src/aistudio/"
