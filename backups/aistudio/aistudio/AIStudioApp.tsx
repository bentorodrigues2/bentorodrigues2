import { Outlet } from "react-router-dom";
import LayoutTop from "../components/LayoutTop";

export default function AIStudioApp() {
  return (
    <LayoutTop>
      <Outlet />
    </LayoutTop>
  );
}
