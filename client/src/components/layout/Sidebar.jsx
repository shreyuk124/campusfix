
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Settings,
  X,
} from "lucide-react";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/issues", label: "Campus Issues", icon: ClipboardList },
  { to: "/report", label: "Report Issue", icon: PlusCircle },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ open, onClose }) {
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
          "fixed inset-y-0 left-0 z-50 w-64 bg-white",
          "border-r border-line p-5 transition-transform",
          "lg:sticky lg:top-16 lg:z-10 lg:h-[calc(100vh-4rem)]",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="mb-6 flex justify-between lg:hidden">
          <span className="font-bold text-ink">Navigation</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="space-y-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  "flex min-h-11 items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium",
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-muted hover:bg-brand-50",
                ].join(" ")
              }
            >
              <Icon size={20} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
