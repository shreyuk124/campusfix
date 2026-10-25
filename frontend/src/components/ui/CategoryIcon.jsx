// components/ui/CategoryIcon.jsx - High-performance SVG Category Icons for CampusFix
import React from 'react';

/**
 * 1. Safety & Security Icon
 */
export function SafetyIcon({ size = 20, className = '', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <rect x="9" y="11" width="6" height="5" rx="1" />
      <path d="M10 11V9a2 2 0 0 1 4 0v2" />
    </svg>
  );
}

/**
 * 2. Electrical Icon
 */
export function ElectricalIcon({ size = 20, className = '', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

/**
 * 3. Water & Plumbing Icon
 */
export function PlumbingIcon({ size = 20, className = '', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      <path d="M7 16a5 5 0 0 0 5 2" />
    </svg>
  );
}

/**
 * 4. Wi-Fi & Network Icon
 */
export function WifiIcon({ size = 20, className = '', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" />
    </svg>
  );
}

/**
 * 5. Equipment & Labs Icon
 */
export function EquipmentIcon({ size = 20, className = '', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M10 2v5.5L4.4 18.2A2 2 0 0 0 6.1 21h11.8a2 2 0 0 0 1.7-2.8L14 7.5V2" />
      <path d="M8.5 2h7" />
      <path d="M7 15h10" />
    </svg>
  );
}

/**
 * 6. Sanitation & Hygiene Icon
 */
export function SanitationIcon({ size = 20, className = '', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

/**
 * 7. Furniture & Fixtures Icon
 */
export function FurnitureIcon({ size = 20, className = '', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
      <path d="M3 16a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2H3v-2z" />
      <line x1="5" y1="18" x2="5" y2="21" />
      <line x1="19" y1="18" x2="19" y2="21" />
      <line x1="4" y1="11" x2="20" y2="11" />
    </svg>
  );
}

/**
 * 8. Other Category Icon
 */
export function OtherCategoryIcon({ size = 20, className = '', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

/**
 * Category-to-SVG Mapping Directory
 */
export const CATEGORY_SVG_MAP = {
  safety: SafetyIcon,
  electrical: ElectricalIcon,
  plumbing: PlumbingIcon,
  wifi: WifiIcon,
  equipment: EquipmentIcon,
  sanitation: SanitationIcon,
  furniture: FurnitureIcon,
  other: OtherCategoryIcon,
};

/**
 * Universal CategoryIcon Component
 * Resolves any category string/id and renders the corresponding SVG icon.
 */
export default function CategoryIcon({
  category,
  size = 18,
  className = '',
  ...props
}) {
  const norm = String(category || '').toLowerCase();

  if (norm.includes('safe') || norm.includes('hazard') || norm.includes('lock')) {
    return <SafetyIcon size={size} className={className} {...props} />;
  }
  if (norm.includes('elect') || norm.includes('power') || norm.includes('light')) {
    return <ElectricalIcon size={size} className={className} {...props} />;
  }
  if (norm.includes('plumb') || norm.includes('water') || norm.includes('leak') || norm.includes('tap')) {
    return <PlumbingIcon size={size} className={className} {...props} />;
  }
  if (norm.includes('net') || norm.includes('wifi') || norm.includes('wi-fi') || norm.includes('internet')) {
    return <WifiIcon size={size} className={className} {...props} />;
  }
  if (norm.includes('equip') || norm.includes('lab') || norm.includes('tool') || norm.includes('projector')) {
    return <EquipmentIcon size={size} className={className} {...props} />;
  }
  if (norm.includes('sanitat') || norm.includes('clean') || norm.includes('hygiene') || norm.includes('waste') || norm.includes('dustbin')) {
    return <SanitationIcon size={size} className={className} {...props} />;
  }
  if (norm.includes('furn') || norm.includes('bench') || norm.includes('desk') || norm.includes('chair') || norm.includes('fixture')) {
    return <FurnitureIcon size={size} className={className} {...props} />;
  }

  return <OtherCategoryIcon size={size} className={className} {...props} />;
}
