import { RouterProvider } from "react-router-dom";
import router from "./src/router";

export default function AIStudioApp() {
  return <RouterProvider router={router} />;
}
