import { NavLink } from 'react-router-dom';
import {
  House,
  Activity,
  Plus,
  Inbox,
  UserRound,
} from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Home', icon: House },
  { to: '/feed', label: 'Feed', icon: Activity },
  { to: '/report', label: 'Report', icon: Plus, isCta: true },
  { to: '/my-issues', label: 'My Issues', icon: Inbox },
  { to: '/settings', label: 'Settings', icon: UserRound },
];

export default function BottomNav() {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] lg:hidden shadow-modal"
    >
      <div className="grid grid-cols-5 h-16 items-center">
        {links.map(({ to, label, icon: Icon, isCta }) => {
          if (isCta) {
            return (
              <NavLink
                key={to}
                to={to}
                className="flex -mt-4 flex-col items-center justify-center group"
                aria-label="Report new issue"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-white shadow-hover transition-transform group-hover:scale-105 active:scale-95 ring-4 ring-white">
                  <Icon size={22} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-bold text-brand-600 mt-1">Report</span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center justify-center gap-0.5 text-[11px] transition-colors py-1',
                  isActive ? 'text-brand-600 font-bold' : 'text-muted hover:text-ink',
                ].join(' ')
              }
            >
              <Icon size={19} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
