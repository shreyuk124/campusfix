
import { useState } from "react";
import { Outlet } from "react-router-dom";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas">
      <TopBar onMenuClick={() => setMenuOpen(true)} />

      <div className="flex">
        <Sidebar
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
        />

        <main className="min-w-0 flex-1 p-4 pb-24 sm:p-6 lg:pb-6">
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
