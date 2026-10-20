import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Footer from './Footer';

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas text-body flex flex-col">
      <TopBar onMenuClick={() => setMenuOpen(true)} />

      <div className="flex flex-1">
        <Sidebar
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <main className="min-w-0 flex-1 p-4 pb-24 sm:p-6 lg:pb-8">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
