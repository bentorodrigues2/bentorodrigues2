
import { useEffect } from "react";

export default function AIStudioWrapper() {
  useEffect(() => {
    import("./index.css");
  }, []);

  const AIStudioApp = require("./src/App.tsx").default;

  return <AIStudioApp />;
}
