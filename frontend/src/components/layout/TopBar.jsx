import { Link } from 'react-router-dom';
import { ShieldCheck, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../features/auth';

export default function TopBar({ onMenuClick }) {
  const { user, isAuthenticated, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AS';

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white shadow-xs">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="rounded-lg p-2 text-ink lg:hidden hover:bg-canvas transition-colors"
          >
            <Menu size={22} />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-xs">
              <ShieldCheck size={22} strokeWidth={2.2} />
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-ink tracking-tight">
                CampusFix
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold text-brand-600 bg-brand-50 border border-brand-200 px-1.5 py-0.5 rounded">
                Prototype
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/settings"
                className="flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-canvas transition-colors"
                title="Account Settings"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-xs border border-brand-200">
                  {initials}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-ink leading-tight">
                    {user?.name || 'Alex Sharma'}
                  </span>
                  <span className="text-[10px] font-medium text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200 self-start capitalize">
                    {user?.role || 'Student'}
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={logout}
                title="Sign out"
                aria-label="Sign out"
                className="rounded-lg p-2 text-muted hover:bg-brand-50 hover:text-danger transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
