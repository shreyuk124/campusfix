import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Activity,
  Shield,
  Settings,
  X,
} from 'lucide-react';

const primaryLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/issues', label: 'Campus Issues', icon: ClipboardList },
  { to: '/report', label: 'Report Issue', icon: PlusCircle },
  { to: '/feed', label: 'Activity Feed', icon: Activity },
];

const portalLinks = [
  { to: '/admin', label: 'Admin Portal', icon: Shield },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const linkClass = ({ isActive }) =>
    [
      'flex min-h-11 items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
      isActive
        ? 'bg-brand-50 text-brand-700 font-semibold'
        : 'text-muted hover:bg-brand-50 hover:text-brand-700',
    ].join(' ');

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        aria-label="Main navigation"
        className={[
          'fixed inset-y-0 left-0 z-50 w-64 bg-white',
          'border-r border-line p-5 transition-transform duration-200 ease-in-out',
          'lg:sticky lg:top-16 lg:z-10 lg:h-[calc(100vh-4rem)]',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <div className="mb-6 flex justify-between lg:hidden">
          <span className="font-bold text-ink">Navigation</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-md p-1 text-muted hover:text-ink"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="space-y-6">
          <div className="space-y-1.5">
            <p className="px-4 text-xs font-semibold uppercase tracking-wider text-muted">
              Main Menu
            </p>
            {primaryLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={linkClass}
              >
                <Icon size={20} aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-line">
            <p className="px-4 text-xs font-semibold uppercase tracking-wider text-muted">
              Management
            </p>
            {portalLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={linkClass}
              >
                <Icon size={20} aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}
