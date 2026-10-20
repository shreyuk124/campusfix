import { Link } from 'react-router-dom';
import { ShieldCheck, Menu } from 'lucide-react';

export default function TopBar({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="rounded-lg p-2 text-ink lg:hidden hover:bg-canvas"
          >
            <Menu size={22} />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <ShieldCheck className="text-brand-500" size={26} />
            <span className="text-xl font-bold text-ink">
              CampusFix
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
