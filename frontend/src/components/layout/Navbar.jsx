import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Inbox,
  LayoutDashboard,
  PlusCircle,
  Shield,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate('/', { replace: true });
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-50 text-brand-600 font-bold'
        : 'text-muted hover:text-ink hover:bg-surface-muted'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-50 text-brand-600 font-bold'
        : 'text-muted hover:text-ink hover:bg-surface-muted'
    }`;

  // Role booleans
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';
  const isStudent = !isAdmin && !isStaff;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4 sm:px-6">
        {/* Brand Logo - links to role home */}
        <Link
          to={isAdmin ? '/admin' : isStaff ? '/staff' : '/feed'}
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg"
        >
          <img src="/logo.png" alt="CampusFix" className="h-8 w-auto object-contain" />
          <span className="hidden sm:inline-block ml-1.5 text-[10px] font-semibold text-brand-600 bg-brand-50 border border-brand-200 px-1.5 py-0.5 rounded">
            {isAdmin ? 'Admin' : isStaff ? 'Staff' : 'Student'}
          </span>
        </Link>

        {/* Desktop Navigation - Strictly Role-Based */}
        <nav className="hidden lg:flex items-center gap-1">
          {/* STUDENT NAVIGATION */}
          {isStudent && (
            <>
              <NavLink to="/feed" className={navLinkClass}>
                <Compass size={16} />
                <span>Campus Feed</span>
              </NavLink>
              <NavLink to="/my-issues" className={navLinkClass}>
                <Inbox size={16} />
                <span>My Reports</span>
              </NavLink>
              <NavLink to="/report" className={navLinkClass}>
                <PlusCircle size={16} />
                <span>Report Issue</span>
              </NavLink>
            </>
          )}

          {/* ADMIN NAVIGATION */}
          {isAdmin && (
            <>
              <NavLink to="/admin" className={navLinkClass}>
                <Shield size={16} />
                <span>Operations & Triage</span>
              </NavLink>
              <NavLink to="/dashboard" className={navLinkClass}>
                <LayoutDashboard size={16} />
                <span>Analytics Dashboard</span>
              </NavLink>
            </>
          )}

          {/* STAFF NAVIGATION */}
          {isStaff && (
            <>
              <NavLink to="/staff" className={navLinkClass}>
                <User size={16} />
                <span>Assigned Tasks</span>
              </NavLink>
              <NavLink to="/feed" className={navLinkClass}>
                <Compass size={16} />
                <span>Campus Feed</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* User Profile, Logout & Mobile Menu Button */}
        <div className="flex items-center gap-2">
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
                onClick={handleLogout}
                title="Log out"
                className="hidden sm:inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs font-medium text-muted hover:bg-surface-muted hover:text-ink transition-colors cursor-pointer"
              >
                <LogOut size={13} />
                <span>Log out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/"
              className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-brand-600"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Hamburger Toggle */}
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

      {/* Mobile Dropdown Menu (<1024px) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-line bg-surface p-4 space-y-1.5 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {isStudent && (
            <>
              <NavLink
                to="/feed"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass}
              >
                <Compass size={18} />
                <span>Campus Feed</span>
              </NavLink>
              <NavLink
                to="/my-issues"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass}
              >
                <Inbox size={18} />
                <span>My Reports</span>
              </NavLink>
              <NavLink
                to="/report"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold bg-brand-500 text-white hover:bg-brand-600 transition-colors"
              >
                <PlusCircle size={18} />
                <span>Report Issue</span>
              </NavLink>
            </>
          )}

          {isAdmin && (
            <>
              <NavLink
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass}
              >
                <Shield size={18} />
                <span>Operations & Triage</span>
              </NavLink>
              <NavLink
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass}
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
                className={mobileNavLinkClass}
              >
                <User size={18} />
                <span>Assigned Tasks</span>
              </NavLink>
              <NavLink
                to="/feed"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass}
              >
                <Compass size={18} />
                <span>Campus Feed</span>
              </NavLink>
            </>
          )}

          {user && (
            <div className="pt-2 border-t border-line/60">
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
