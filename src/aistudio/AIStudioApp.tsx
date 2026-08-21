import { Outlet } from "react-router-dom";
import Layout from "./Layout"; // mantém o layout do AI Studio

export default function AIStudioApp() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
