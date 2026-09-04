import { useEffect, useState } from "react";

export default function AIStudioWrapper() {
  const [App, setApp] = useState(null);

  useEffect(() => {
    import("./index.css");

    import("./src/App")
      .then((mod) => setApp(() => mod.default))
      .catch((err) => console.error("Erro ao carregar AI Studio:", err));
  }, []);

  if (!App) return <div>A carregar AI Studio...</div>;

  return <App />;
}

