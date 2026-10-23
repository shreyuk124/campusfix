import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * AppLayout Component
 * 
 * Acts as the master wrapper/frame for every page in CampusFix.
 * 
 * Key Responsibilities:
 * 1. Renders the sticky top Navbar.
 * 2. Provides the main content area where child routes are rendered via <Outlet />.
 * 3. Renders the global Footer at the bottom.
 * 4. Displays a Floating Action Button (FAB) in the bottom-right corner for quick
 *    issue reporting (similar to Gmail's "Compose" button).
 */
export default function AppLayout() {
  // useLocation gives us the current URL pathname (e.g., '/', '/issues', '/report')
  const location = useLocation();

  // If the user is ALREADY on the report page, we hide the button so it doesn't get in the way of the form
  const isReportPage = location.pathname === '/report';

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-body relative">
      {/* 1. Persistent Top Navigation Bar */}
      <Navbar />

      {/* 2. Main Content Container where whichever page you visit renders */}
      <main className="mx-auto w-full max-w-content flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      {/* 3. Global Floating Action Button (FAB) for quick reporting */}
      {!isReportPage && (
        <NavLink
          to="/report"
          aria-label="Report an issue"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-brand-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-brand-600 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-brand-200 active:bg-brand-700"
        >
          {/* Plus Icon with stroke width for clean visual clarity */}
          <Plus size={20} strokeWidth={2.5} aria-hidden="true" />
          <span>Report Issue</span>
        </NavLink>
      )}

      {/* 4. Persistent Footer */}
      <Footer />
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