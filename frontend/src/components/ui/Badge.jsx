// components/ui/Badge.jsx - Core badge system conforming to DESIGN.md
import React from 'react';
import {
  CircleDot,
  UserCheck,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { STATUS_CONFIG, PRIORITY_BANDS } from '../../lib/constants';
import { getSlaStatus } from '../../lib/format';

/**
 * StatusBadge - Pill with icon + label
 * Colours from DESIGN.md §2.1
 */
export function StatusBadge({ status, className = '' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Reported;

  const renderIcon = () => {
    const iconProps = { size: 12, className: 'shrink-0', 'aria-hidden': 'true' };
    switch (status) {
      case 'Reported':
        return <CircleDot {...iconProps} />;
      case 'Assigned':
        return <UserCheck {...iconProps} />;
      case 'In Progress':
        return <RefreshCw {...iconProps} className="shrink-0 animate-spin" />;
      case 'Resolved':
        return <CheckCircle2 {...iconProps} />;
      default:
        return <CircleDot {...iconProps} />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border || 'transparent'}`,
      }}
    >
      {renderIcon()}
      <span>{config.label || status}</span>
    </span>
  );
}

/**
 * PriorityBadge - Pill with dot/icon + label
 * Low (0–29), Medium (30–54), High (55–74), Critical (75+)
 * Rule from DESIGN.md: Critical is solid red, the only solid-fill badge
 */
export function PriorityBadge({ priority, score, className = '' }) {
  let band = null;
  if (score !== undefined && score !== null) {
    band = PRIORITY_BANDS.find((b) => score >= b.min && score <= b.max);
  }
  if (!band && priority) {
    band = PRIORITY_BANDS.find(
      (b) =>
        b.label.toLowerCase() === String(priority).toLowerCase() ||
        b.key.toLowerCase() === String(priority).toLowerCase()
    );
  }
  if (!band) {
    band = PRIORITY_BANDS[1] || PRIORITY_BANDS[0];
  }

  const isCritical = band.key === 'critical';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isCritical ? 'animate-pulse font-bold tracking-wide' : ''
      } ${className}`}
      style={{
        backgroundColor: band.bg,
        color: band.fg,
        border: isCritical ? 'none' : `1px solid ${band.fg}33`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full shrink-0"
        style={{ backgroundColor: band.dot }}
        aria-hidden="true"
      />
      <span>{band.label}</span>
      {score !== undefined && score !== null && (
        <span className="font-mono text-[10px] opacity-80">({score})</span>
      )}
    </span>
  );
}

/**
 * SlaBadge - Clock icon + countdown
 * On track: teal, Due soon: amber, Overdue: red
 */
export function SlaBadge({ deadline, created, className = '' }) {
  const { state, label } = getSlaStatus(deadline, created);

  let style = {
    bg: '#E3F6F4',
    text: '#0F766E',
    border: '#A7E3DC',
  };

  if (state === 'overdue') {
    style = {
      bg: '#FDECEA',
      text: '#B42318',
      border: '#F7C1BB',
    };
  } else if (state === 'due-soon') {
    style = {
      bg: '#FDF1E1',
      text: '#9A5B0A',
      border: '#F6D3A6',
    };
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${className}`}
      style={{
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
      }}
    >
      <Clock size={11} className="shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export function HotspotBadge({ count = 1, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-danger-50 border border-danger-border px-2 py-0.5 text-[11px] font-bold text-danger ${className}`}
      title={`${count} issues reported in this building recently`}
    >
      <AlertTriangle size={11} className="shrink-0 text-danger" aria-hidden="true" />
      <span>Hotspot ({count})</span>
    </span>
  );
}

export function RoleBadge({ role = 'student', className = '' }) {
  const isAuthority = role === 'admin' || role === 'authority';
  const isStaff = role === 'staff';

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        isAuthority
          ? 'bg-purple-100 text-purple-800 border border-purple-200'
          : isStaff
          ? 'bg-blue-100 text-blue-800 border border-blue-200'
          : 'bg-stone-100 text-stone-700 border border-stone-200'
      } ${className}`}
    >
      {role}
    </span>
  );
}

StatusBadge.StatusBadge = StatusBadge;
StatusBadge.PriorityBadge = PriorityBadge;
StatusBadge.SlaBadge = SlaBadge;
StatusBadge.HotspotBadge = HotspotBadge;
StatusBadge.RoleBadge = RoleBadge;

export default StatusBadge;
