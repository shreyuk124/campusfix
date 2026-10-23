// components/layout/BottomNav.jsx - Mobile fixed bottom tab bar conforming to DESIGN.md §3.1
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Inbox, Plus, Shield, User } from 'lucide-react';

export function BottomNav() {
  const getTabClass = ({ isActive }) =>
    `flex flex-col items-center justify-center py-2 px-3 text-[11px] font-medium transition-colors ${
      isActive ? 'text-brand-600 font-bold' : 'text-muted hover:text-ink'
    }`;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md lg:hidden shadow-modal"
      aria-label="Mobile Navigation Bar"
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {/* Feed */}
        <NavLink to="/feed" className={getTabClass}>
          <Compass size={20} className="mb-0.5" />
          <span>Feed</span>
        </NavLink>

        {/* My Issues */}
        <NavLink to="/my-issues" className={getTabClass}>
          <Inbox size={20} className="mb-0.5" />
          <span>My Issues</span>
        </NavLink>

        {/* Center Prominent Report Action */}
        <NavLink
          to="/report"
          className="flex -mt-5 flex-col items-center justify-center group"
          aria-label="Report new issue"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white shadow-hover transition-transform group-hover:scale-105 active:scale-95 ring-4 ring-canvas">
            <Plus size={24} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-bold text-brand-600 mt-1">Report</span>
        </NavLink>

        {/* Admin Dashboard */}
        <NavLink to="/admin" className={getTabClass}>
          <Shield size={20} className="mb-0.5" />
          <span>Admin</span>
        </NavLink>

        {/* Profile / Auth */}
        <NavLink to="/login" className={getTabClass}>
          <User size={20} className="mb-0.5" />
          <span>Account</span>
        </NavLink>
      </div>
    </nav>
  );
}

export default BottomNav;
