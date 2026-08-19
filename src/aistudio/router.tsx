import React from "react";
import { Routes, Route } from "react-router-dom";
import AIStudioApp from "./AIStudioApp";

export default function AIStudioRouter() {
  return (
    <Routes>
      <Route path="/" element={<AIStudioApp />} />
      <Route path="/app/*" element={<AIStudioApp />} />
    </Routes>
  );
}
