// components/layout/Navbar.jsx - Conforms to DESIGN.md §3.1 & §3.3
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Wrench,
  Compass,
  Inbox,
  PlusCircle,
  Shield,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-50 text-brand-600 font-bold'
        : 'text-muted hover:text-ink hover:bg-surface-muted'
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-xs">
            <Wrench size={20} strokeWidth={2.25} />
          </span>
          <div>
            <span className="text-lg font-bold tracking-tight text-ink">CampusFix</span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold text-brand-600 bg-brand-50 border border-brand-200 px-1.5 py-0.2 rounded">
              Prototype
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          <NavLink to="/feed" className={navLinkClass}>
            <Compass size={16} />
            <span>Feed</span>
          </NavLink>
          <NavLink to="/my-issues" className={navLinkClass}>
            <Inbox size={16} />
            <span>My Issues</span>
          </NavLink>
          <NavLink to="/report" className={navLinkClass}>
            <PlusCircle size={16} />
            <span>Report Issue</span>
          </NavLink>
          <NavLink to="/staff" className={navLinkClass}>
            <User size={16} />
            <span>Staff</span>
          </NavLink>
          <NavLink to="/admin" className={navLinkClass}>
            <Shield size={16} />
            <span>Authority Portal</span>
          </NavLink>
        </nav>

        {/* User Profile or Login Action */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-xs shadow-xs border border-brand-200"
                title={user?.email || 'User'}
              >
                {user?.name
                  ? user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                  : 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-ink leading-tight">
                  {user?.name || 'User'}
                </span>
                <span className="text-[10px] font-medium text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200 self-start mt-0.5 capitalize">
                  {user?.role || 'Student'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                title="Log out"
                className="ml-1 inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-xs font-medium text-muted hover:bg-surface-muted hover:text-ink transition-colors"
              >
                <LogOut size={13} />
                <span className="hidden md:inline">Log out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className="rounded-md border border-line-strong px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-surface-muted"
              >
                Log in
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-md bg-brand-500 px-3 py-1.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-brand-600"
              >
                Register
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}