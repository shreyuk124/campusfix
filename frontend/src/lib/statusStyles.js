export const STATUS_STYLES = {
  Reported: 'bg-slate-100 text-slate-600',
  Assigned: 'bg-sky-100 text-sky-800',
  'In Progress': 'bg-indigo-100 text-indigo-800',
  Resolved: 'bg-teal-50 text-teal-700',
};

export const PRIORITY_STYLES = {
  Low: {
    badge: 'bg-green-50 text-green-700',
    dot: 'bg-green-600',
  },
  Medium: {
    badge: 'bg-yellow-100 text-yellow-800',
    dot: 'bg-yellow-600',
  },
  High: {
    badge: 'bg-orange-100 text-orange-800',
    dot: 'bg-orange-600',
  },
  Critical: {
    badge: 'bg-red-600 text-white',
    dot: 'bg-white',
  },
};

export const STATUS_CONFIG = {
  Reported: { label: 'Reported', bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' },
  Assigned: { label: 'Assigned', bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD' },
  'In Progress': { label: 'In Progress', bg: '#EEF2FF', text: '#4338CA', border: '#C7D2FE' },
  Resolved: { label: 'Resolved', bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
};

export const PRIORITY_BANDS = [
  { key: 'low', label: 'Low', min: 0, max: 29, bg: '#F0FDF4', fg: '#15803D', dot: '#22C55E' },
  { key: 'medium', label: 'Medium', min: 30, max: 54, bg: '#FEFCE8', fg: '#854D0E', dot: '#EAB308' },
  { key: 'high', label: 'High', min: 55, max: 74, bg: '#FFF7ED', fg: '#9A3412', dot: '#F97316' },
  { key: 'critical', label: 'Critical', min: 75, max: 100, bg: '#FEF2F2', fg: '#991B1B', dot: '#EF4444' },
];

export function getSlaStatus(deadline) {
  if (!deadline) return { state: 'normal', label: 'On Track', isOverdue: false };
  const now = Date.now();
  const target = new Date(deadline).getTime();
  const diff = target - now;
  if (diff <= 0) return { state: 'overdue', label: 'Overdue', isOverdue: true };
  const hours = Math.round(diff / (1000 * 60 * 60));
  if (hours <= 24) return { state: 'due-soon', label: `${hours}h left`, isOverdue: false };
  const days = Math.round(hours / 24);
  return { state: 'normal', label: `${days}d left`, isOverdue: false };
}
