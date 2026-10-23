import { NavLink } from 'react-router-dom';
import { Wrench, PlusCircle, LayoutDashboard, UserCheck, Shield } from 'lucide-react';

export default function Navbar() {
  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-50 text-brand-600 font-semibold'
        : 'text-muted hover:text-ink hover:bg-surface-muted'
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white shadow-sm">
            <Wrench size={20} />
          </span>
          <span className="text-lg font-bold tracking-tight text-ink">CampusFix</span>
        </NavLink>

        <nav className="flex items-center gap-2">
          <NavLink to="/" className={navLinkClass}>
            Feed
          </NavLink>
          <NavLink to="/issues" className={navLinkClass}>
            <LayoutDashboard size={16} />
            Issues
          </NavLink>
          <NavLink to="/report" className={navLinkClass}>
            <PlusCircle size={16} />
            Report Issue
          </NavLink>
          <NavLink to="/staff" className={navLinkClass}>
            <UserCheck size={16} />
            Staff
          </NavLink>
          <NavLink to="/admin" className={navLinkClass}>
            <Shield size={16} />
            Admin
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <NavLink
            to="/login"
            className="rounded-md border border-line-strong px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-surface-muted"
          >
            Log in
          </NavLink>
        </div>
      </div>
    </header>
  );
}