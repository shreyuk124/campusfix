// components/layout/AppLayout.jsx - Conforms to DESIGN.md §3.1
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import Footer from './Footer';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-body">
      <Navbar />
      <main className="mx-auto w-full max-w-content flex-1 px-4 py-6 sm:px-6 sm:py-8 pb-24 lg:pb-8">
        <Outlet />
      </main>
      <Footer />
      {/* Mobile Fixed Bottom Navigation Bar (<1024px) */}
      <BottomNav />
    </div>
  );
}