import { NavLink } from 'react-router-dom';
import {
  House,
  ClipboardList,
  PlusCircle,
  UserRound,
} from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Home', icon: House },
  { to: '/issues', label: 'Issues', icon: ClipboardList },
  { to: '/report', label: 'Report', icon: PlusCircle },
  { to: '/settings', label: 'Profile', icon: UserRound },
];

export default function BottomNav() {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden shadow-lg"
    >
      <div className="grid grid-cols-4">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex min-h-14 flex-col items-center justify-center gap-1 text-xs transition-colors',
                isActive ? 'text-brand-600 font-semibold' : 'text-muted hover:text-ink',
              ].join(' ')
            }
          >
            <Icon size={21} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
