import { Outlet } from "react-router-dom";
import Toast from "@/shared/components/Toast";
import Navbar from "./Navbar";

export default function MainLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
      <Toast />
    </div>
  );
}
