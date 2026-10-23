// components/layout/AppLayout.jsx - Conforms to DESIGN.md §3.1
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import Footer from './Footer';
import { useAuth } from '../../features/auth/useAuth';

export default function AppLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // When unauthenticated or on login/register pages, show only the login page
  if (!isAuthenticated || isAuthPage) {
    return (
      <div className="flex min-h-screen flex-col bg-canvas text-body">
        <main className="mx-auto flex w-full max-w-content flex-1 items-center justify-center px-4 py-8">
          <Outlet />
        </main>
      </div>
    );
  }

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