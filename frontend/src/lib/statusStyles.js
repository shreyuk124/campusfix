export const STATUS_STYLES = {
  Reported: 'bg-slate-100 text-slate-600',
  Assigned: 'bg-sky-100 text-sky-800',
  'In Progress': 'bg-indigo-100 text-indigo-800',
  Resolved: 'bg-teal-50 text-teal-700',
  Closed: 'bg-slate-200 text-slate-700',
  Reopened: 'bg-red-50 text-red-700',
  Rejected: 'bg-gray-100 text-gray-600',
  Merged: 'bg-purple-50 text-purple-700',
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
