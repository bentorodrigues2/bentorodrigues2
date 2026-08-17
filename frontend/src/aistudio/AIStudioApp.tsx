import React from "react";
import { AIStudioRouter } from "./src/router";

export default function AIStudioApp() {
  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
      <AIStudioRouter />
    </div>
  );
}
