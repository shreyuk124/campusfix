import {
  Droplets,
  Zap,
  Sparkles,
  Wifi,
  Armchair,
  ShieldAlert,
  CircleHelp,
} from 'lucide-react';

/**
 * Category Icon Resolver
 */
export function getCategoryIcon(category, size = 18, className = '') {
  const norm = String(category || '').toLowerCase();
  if (norm.includes('plumb')) return <Droplets size={size} className={className} />;
  if (norm.includes('elect')) return <Zap size={size} className={className} />;
  if (norm.includes('clean') || norm.includes('sanitat')) return <Sparkles size={size} className={className} />;
  if (norm.includes('net') || norm.includes('wifi') || norm.includes('wi-fi')) return <Wifi size={size} className={className} />;
  if (norm.includes('furn') || norm.includes('carp')) return <Armchair size={size} className={className} />;
  if (norm.includes('safe') || norm.includes('hazard')) return <ShieldAlert size={size} className={className} />;
  return <CircleHelp size={size} className={className} />;
}
