import { NavLink, useNavigate } from 'react-router-dom';
import { Wrench, PlusCircle, LayoutDashboard, Shield, LogOut, User } from 'lucide-react';
import { useAuth } from '../../features/auth';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-50 text-brand-600 font-semibold'
        : 'text-muted hover:text-ink hover:bg-surface-muted'
    }`;

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  // Generate initials for avatar per DESIGN.md §4.15
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
      <div className="relative mx-auto flex h-16 max-w-content items-center justify-between px-4 sm:px-6">
        <NavLink
          to={isAuthenticated ? '/' : '/login'}
          className="flex items-center gap-2 shrink-0"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white shadow-sm">
            <Wrench size={20} />
          </span>
          <span className="text-lg font-bold tracking-tight text-ink">CampusFix</span>
        </NavLink>

        {/* Centralized Navigation: Feed on left, Report Issue in center, Issues on right */}
        {isAuthenticated && user && (
          <nav className="flex items-center gap-1 sm:gap-1.5 md:absolute md:left-1/2 md:-translate-x-1/2">
            <NavLink to="/" className={navLinkClass}>
              Feed
            </NavLink>

            <NavLink
              to="/report"
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-sm ring-2 ring-brand-200'
                    : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                }`
              }
            >
              <PlusCircle size={16} />
              <span>Report Issue</span>
            </NavLink>

            <NavLink to="/issues" className={navLinkClass}>
              <LayoutDashboard size={16} />
              <span>Issues</span>
            </NavLink>

            {user.role === 'admin' && (
              <NavLink to="/admin" className={navLinkClass}>
                <Shield size={16} />
                <span>Admin</span>
              </NavLink>
            )}
          </nav>
        )}

        <div className="flex items-center gap-2.5 shrink-0">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {/* Role badge */}
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  user.role === 'admin'
                    ? 'bg-orange-50 text-orange-700 border border-orange/20'
                    : 'bg-brand-50 text-brand-700 border border-brand-200'
                }`}
              >
                {user.role === 'admin' ? (
                  <>
                    <Shield size={12} />
                    <span>Admin</span>
                  </>
                ) : (
                  <>
                    <User size={12} />
                    <span>Student</span>
                  </>
                )}
              </span>

              {/* Avatar circle */}
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700"
                title={user.name || user.email}
              >
                {getInitials(user.name)}
              </div>

              {/* Sign out button */}
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface-muted hover:text-danger"
                title="Sign out"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Sign out</span>
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
                className="rounded-md bg-brand-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
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
