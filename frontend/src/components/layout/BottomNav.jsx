import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Inbox, PlusCircle, LayoutDashboard, Shield, User } from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth';

export function BottomNav() {
  const { user } = useAuth();

  const getTabClass = ({ isActive }) =>
    `flex flex-col items-center justify-center h-full w-full py-1 text-[11px] font-medium transition-colors ${
      isActive ? 'text-brand-600 font-bold' : 'text-muted hover:text-ink'
    }`;

  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';
  const isStudent = !isAdmin && !isStaff;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] lg:hidden shadow-modal"
      aria-label="Mobile Navigation Bar"
    >
      <div className="w-full max-w-md mx-auto h-16">
        {/* STUDENT MOBILE NAV - Perfectly Centered 3-Column Grid */}
        {isStudent && (
          <div className="grid grid-cols-3 h-full items-center text-center">
            <NavLink to="/feed" className={getTabClass}>
              <Compass size={20} className="mb-0.5" />
              <span>Feed</span>
            </NavLink>

            <NavLink to="/report" className={getTabClass}>
              <PlusCircle size={22} className="mb-0.5 text-brand-600" />
              <span className="font-semibold text-brand-600">Report</span>
            </NavLink>

            <NavLink to="/my-issues" className={getTabClass}>
              <Inbox size={20} className="mb-0.5" />
              <span>My Reports</span>
            </NavLink>
          </div>
        )}

        {/* ADMIN MOBILE NAV */}
        {isAdmin && (
          <div className="grid grid-cols-2 h-full items-center text-center">
            <NavLink to="/admin" className={getTabClass}>
              <Shield size={20} className="mb-0.5" />
              <span>Operations</span>
            </NavLink>

            <NavLink to="/dashboard" className={getTabClass}>
              <LayoutDashboard size={20} className="mb-0.5" />
              <span>Analytics</span>
            </NavLink>
          </div>
        )}

        {/* STAFF MOBILE NAV */}
        {isStaff && (
          <div className="grid grid-cols-2 h-full items-center text-center">
            <NavLink to="/staff" className={getTabClass}>
              <User size={20} className="mb-0.5" />
              <span>My Tasks</span>
            </NavLink>

            <NavLink to="/feed" className={getTabClass}>
              <Compass size={20} className="mb-0.5" />
              <span>Feed</span>
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
}

export default BottomNav;
