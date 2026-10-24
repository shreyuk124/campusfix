import React, { useEffect } from 'react';
import { Outlet, useLocation, ScrollRestoration } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import Footer from './Footer';

/**
 * AppLayout Component
 * Master application shell for authenticated users.
 * Displays role-tailored Navbar, Outlet, Footer, and mobile BottomNav.
 * Enforces scroll-to-top on route changes for desktop & mobile.
 */
export default function AppLayout() {
  const location = useLocation();

  // Scroll to top on every page change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [location.pathname, location.search]);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // On login/register pages, show clean centered layout without navigation chrome
  if (isAuthPage) {
    return (
      <div className="flex min-h-screen flex-col bg-canvas text-body">
        <ScrollRestoration />
        <main className="mx-auto flex w-full max-w-content flex-1 items-center justify-center px-4 py-8">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-body relative">
      <ScrollRestoration />

      {/* 1. Persistent Top Navigation Bar */}
      <Navbar />

      {/* 2. Main Content Container where child routes render */}
      <main className="mx-auto w-full max-w-content flex-1 px-4 py-6 sm:px-6 sm:py-8 pb-20 lg:pb-8">
        <Outlet />
      </main>

      {/* 3. Persistent Footer */}
      <Footer />

      {/* 4. Mobile Fixed Bottom Navigation Bar (<1024px) */}
      <BottomNav />
    </div>
  );
}
