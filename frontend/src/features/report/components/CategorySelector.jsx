import {
  ShieldAlert,
  Zap,
  Droplets,
  Wifi,
  Wrench,
  Trash2,
  Armchair,
  HelpCircle,
} from 'lucide-react';

/**
 * List of available issue categories on campus.
 * Each object holds:
 * - id: unique string value stored in state/database
 * - label: human-friendly text shown to the student
 * - icon: Lucide icon component to make selection visual
 * - description: short helper text explaining the category
 */
export const CATEGORIES = [
  {
    id: 'safety',
    label: 'Safety & Security',
    icon: ShieldAlert,
    description: 'Broken locks, hazards, security issues',
  },
  {
    id: 'electrical',
    label: 'Electrical',
    icon: Zap,
    description: 'Lights, fans, switches, wiring faults',
  },
  {
    id: 'plumbing',
    label: 'Water & Plumbing',
    icon: Droplets,
    description: 'Leaks, clogged washrooms, tap damage',
  },
  {
    id: 'wifi',
    label: 'Wi-Fi & Network',
    icon: Wifi,
    description: 'No signal, slow connection, router issues',
  },
  {
    id: 'equipment',
    label: 'Equipment & Labs',
    icon: Wrench,
    description: 'Projectors, lab tools, computers',
  },
  {
    id: 'sanitation',
    label: 'Sanitation & Hygiene',
    icon: Trash2,
    description: 'Dustbins, cleanliness, pest issues',
  },
  {
    id: 'furniture',
    label: 'Furniture & Fixtures',
    icon: Armchair,
    description: 'Broken benches, desks, whiteboards',
  },
  {
    id: 'other',
    label: 'Other',
    icon: HelpCircle,
    description: 'Issues that do not fit above',
  },
];

/**
 * CategorySelector Component
 * 
 * Props:
 * @param {string} value - The currently selected category id (e.g., 'electrical')
 * @param {function} onChange - Callback function to notify the parent when a new category is clicked
 * @param {string} error - Optional validation error message if the student tried to submit without picking one
 */
export default function CategorySelector({ value, onChange, error }) {
  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="mb-2">
        <label className="block text-sm font-semibold text-ink">
          Select Category <span className="text-danger">*</span>
        </label>
        <p className="text-xs text-muted">
          Choose the category that best matches the issue.
        </p>
      </div>

      {/* Grid of category cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {CATEGORIES.map((cat) => {
          // Check if this card is currently selected by comparing its id to the active value prop
          const isSelected = value === cat.id;
          const Icon = cat.icon;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange(cat.id)}
              className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all duration-150 ${
                isSelected
                  ? 'border-brand-500 bg-brand-50/70 ring-2 ring-brand-500 shadow-sm'
                  : 'border-line bg-surface hover:border-line-strong hover:bg-surface-muted'
              }`}
            >
              {/* Category Icon */}
              <div
                className={`mb-2 flex h-8 w-8 items-center justify-center rounded-md ${
                  isSelected
                    ? 'bg-brand-500 text-white'
                    : 'bg-canvas text-brand-600'
                }`}
              >
                <Icon size={18} />
              </div>

              {/* Category Title */}
              <span
                className={`text-sm font-medium ${
                  isSelected ? 'text-brand-700' : 'text-ink'
                }`}
              >
                {cat.label}
              </span>

              {/* Short helper description */}
              <span className="mt-0.5 line-clamp-1 text-[11px] text-muted">
                {cat.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Validation Error Message */}
      {error && (
        <p className="mt-1.5 text-xs text-danger font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}