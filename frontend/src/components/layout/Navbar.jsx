import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Inbox,
  Bell,
  Plus,
  Shield,
  LayoutDashboard,
  User,
  LogOut,
  Menu,
  X,
  Check,
} from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    await logout();
    navigate('/', { replace: true });
  };

  // Role booleans
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';
  const isStudent = !isAdmin && !isStaff;

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AW';

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 sm:h-[70px] max-w-content items-center justify-between px-4 sm:px-6">
        {/* Brand Logo Lockup — Collegiate squircle + Check badge */}
        <Link
          to={isAdmin ? '/admin' : isStaff ? '/staff' : '/feed'}
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg group"
        >
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white shadow-xs transition-transform group-hover:scale-105">
            {/* Collegiate Classical Pediment Building */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="translate-y-[-0.5px]"
            >
              <path d="M4 10h16M4 14h16M4 18h16" />
              <path d="M6 10v8M10 10v8M14 10v8M18 10v8" />
              <path d="M3 10l9-7 9 7v1H3v-1z" />
              <path d="M2 21h20v-2H2v2z" />
            </svg>
            {/* Mini Orange Checkmark Badge */}
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-action-orange text-white ring-2 ring-surface">
              <Check size={10} strokeWidth={3.5} />
            </span>
          </div>

          <div className="flex items-baseline font-display">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-brand-500">
              Campus
            </span>
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-action">
              Fix
            </span>
            <span className="hidden md:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider text-muted bg-surface-muted border border-line px-1.5 py-0.5 rounded">
              {isAdmin ? 'Admin' : isStaff ? 'Staff' : 'Campus'}
            </span>
          </div>
        </Link>

        {/* Center Navigation Links (Matching campus_feed_redesign.jpg active tab indicator) */}
        <nav className="hidden lg:flex items-center gap-6">
          {/* STUDENT NAVIGATION */}
          {isStudent && (
            <>
              <NavLink to="/feed" className="relative flex items-center py-6 px-1 text-sm transition-colors">
                {({ isActive }) => (
                  <>
                    <span
                      className={`font-semibold ${
                        isActive ? 'text-ink font-bold' : 'text-muted hover:text-ink'
                      }`}
                    >
                      Campus Feed
                    </span>
                    {isActive && (
                      <span className="absolute bottom-0 inset-x-0 flex flex-col items-center">
                        <span className="h-[3px] w-full bg-brand-500 rounded-full" />
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-500 -mt-1" />
                      </span>
                    )}
                  </>
                )}
              </NavLink>

              <NavLink to="/my-issues" className="relative flex items-center py-6 px-1 text-sm transition-colors">
                {({ isActive }) => (
                  <>
                    <span
                      className={`font-semibold ${
                        isActive ? 'text-ink font-bold' : 'text-muted hover:text-ink'
                      }`}
                    >
                      My Reports
                    </span>
                    {isActive && (
                      <span className="absolute bottom-0 inset-x-0 flex flex-col items-center">
                        <span className="h-[3px] w-full bg-brand-500 rounded-full" />
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-500 -mt-1" />
                      </span>
                    )}
                  </>
                )}
              </NavLink>

              <NavLink to="/report" className="relative flex items-center py-6 px-1 text-sm transition-colors">
                {({ isActive }) => (
                  <>
                    <span
                      className={`font-semibold ${
                        isActive ? 'text-ink font-bold' : 'text-muted hover:text-ink'
                      }`}
                    >
                      Report Issue
                    </span>
                    {isActive && (
                      <span className="absolute bottom-0 inset-x-0 flex flex-col items-center">
                        <span className="h-[3px] w-full bg-brand-500 rounded-full" />
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-500 -mt-1" />
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </>
          )}

          {/* ADMIN NAVIGATION */}
          {isAdmin && (
            <>
              <NavLink to="/admin" className="relative flex items-center py-6 px-1 text-sm transition-colors">
                {({ isActive }) => (
                  <>
                    <span className={`font-semibold ${isActive ? 'text-ink font-bold' : 'text-muted hover:text-ink'}`}>
                      Operations & Triage
                    </span>
                    {isActive && (
                      <span className="absolute bottom-0 inset-x-0 flex flex-col items-center">
                        <span className="h-[3px] w-full bg-brand-500 rounded-full" />
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-500 -mt-1" />
                      </span>
                    )}
                  </>
                )}
              </NavLink>

              <NavLink to="/dashboard" className="relative flex items-center py-6 px-1 text-sm transition-colors">
                {({ isActive }) => (
                  <>
                    <span className={`font-semibold ${isActive ? 'text-ink font-bold' : 'text-muted hover:text-ink'}`}>
                      Analytics Dashboard
                    </span>
                    {isActive && (
                      <span className="absolute bottom-0 inset-x-0 flex flex-col items-center">
                        <span className="h-[3px] w-full bg-brand-500 rounded-full" />
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-500 -mt-1" />
                      </span>
                    )}
                  </>
                )}
              </NavLink>

              <NavLink to="/feed" className="relative flex items-center py-6 px-1 text-sm transition-colors">
                {({ isActive }) => (
                  <>
                    <span className={`font-semibold ${isActive ? 'text-ink font-bold' : 'text-muted hover:text-ink'}`}>
                      Campus Feed
                    </span>
                    {isActive && (
                      <span className="absolute bottom-0 inset-x-0 flex flex-col items-center">
                        <span className="h-[3px] w-full bg-brand-500 rounded-full" />
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-500 -mt-1" />
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </>
          )}

          {/* STAFF NAVIGATION */}
          {isStaff && (
            <>
              <NavLink to="/staff" className="relative flex items-center py-6 px-1 text-sm transition-colors">
                {({ isActive }) => (
                  <>
                    <span className={`font-semibold ${isActive ? 'text-ink font-bold' : 'text-muted hover:text-ink'}`}>
                      Assigned Tasks
                    </span>
                    {isActive && (
                      <span className="absolute bottom-0 inset-x-0 flex flex-col items-center">
                        <span className="h-[3px] w-full bg-brand-500 rounded-full" />
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-500 -mt-1" />
                      </span>
                    )}
                  </>
                )}
              </NavLink>

              <NavLink to="/feed" className="relative flex items-center py-6 px-1 text-sm transition-colors">
                {({ isActive }) => (
                  <>
                    <span className={`font-semibold ${isActive ? 'text-ink font-bold' : 'text-muted hover:text-ink'}`}>
                      Campus Feed
                    </span>
                    {isActive && (
                      <span className="absolute bottom-0 inset-x-0 flex flex-col items-center">
                        <span className="h-[3px] w-full bg-brand-500 rounded-full" />
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-500 -mt-1" />
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </>
          )}
        </nav>

        {/* Right Stack: User Initials Avatar | Vertical Divider | + Report Issue CTA */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative flex items-center gap-2.5">
              {/* User Avatar Circle */}
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-200 bg-white text-xs font-bold text-brand-500 shadow-xs hover:border-brand-500 transition-colors cursor-pointer"
                title={`${user?.name || 'Account'} (${user?.role || 'Student'})`}
                aria-label="User Account Menu"
              >
                {userInitials}
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 top-12 w-52 rounded-xl border border-line bg-surface p-2 shadow-modal animate-in fade-in-50 duration-100 z-50">
                  <div className="px-3 py-2 border-b border-line">
                    <p className="text-xs font-bold text-ink truncate">{user?.name || 'Student'}</p>
                    <p className="text-[11px] text-muted truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200 uppercase">
                      {user?.role || 'student'}
                    </span>
                  </div>
                  <div className="pt-1 space-y-0.5">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-danger hover:bg-danger-50 cursor-pointer"
                    >
                      <LogOut size={13} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Thin Vertical Divider Line */}
              <div className="hidden sm:block h-6 w-px bg-line-strong/60" />

              {/* Primary Action Button ("+ Report Issue") */}
              <Link
                to="/report"
                className="inline-flex items-center gap-1.5 rounded-lg bg-action px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-action-hover transition-colors"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Report Issue</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-body hover:bg-surface-muted"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-brand-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-brand-600"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle (<1024px) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-muted hover:text-ink hover:bg-surface-muted transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (<1024px) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-line bg-surface p-4 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {isStudent && (
            <>
              <NavLink
                to="/feed"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-body hover:bg-brand-50 hover:text-brand-600"
              >
                <Compass size={18} />
                <span>Campus Feed</span>
              </NavLink>
              <NavLink
                to="/my-issues"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-body hover:bg-brand-50 hover:text-brand-600"
              >
                <Inbox size={18} />
                <span>My Reports</span>
              </NavLink>
              <NavLink
                to="/report"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold bg-action text-white hover:bg-action-hover"
              >
                <Plus size={18} strokeWidth={2.5} />
                <span>Report Issue</span>
              </NavLink>
            </>
          )}

          {isAdmin && (
            <>
              <NavLink
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-body hover:bg-brand-50"
              >
                <Shield size={18} />
                <span>Operations & Triage</span>
              </NavLink>
              <NavLink
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-body hover:bg-brand-50"
              >
                <LayoutDashboard size={18} />
                <span>Analytics Dashboard</span>
              </NavLink>
            </>
          )}

          {isStaff && (
            <>
              <NavLink
                to="/staff"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-body hover:bg-brand-50"
              >
                <User size={18} />
                <span>Assigned Tasks</span>
              </NavLink>
              <NavLink
                to="/feed"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-body hover:bg-brand-50"
              >
                <Compass size={18} />
                <span>Campus Feed</span>
              </NavLink>
            </>
          )}

          {user && (
            <div className="pt-2 border-t border-line">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-danger hover:bg-danger-50 transition-colors"
              >
                <LogOut size={16} />
                <span>Sign Out ({user.name})</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
