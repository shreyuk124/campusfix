// components/ui/Badge.jsx - Core badge system conforming to DESIGN.md
import React from 'react';
import {
  CircleDot,
  UserCheck,
  Wrench,
  CheckCircle2,
  Archive,
  RotateCcw,
  XCircle,
  GitMerge,
  Flame,
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
    const size = 13;
    const strokeWidth = 2;
    switch (status) {
      case 'Reported':
        return <CircleDot size={size} strokeWidth={strokeWidth} />;
      case 'Assigned':
        return <UserCheck size={size} strokeWidth={strokeWidth} />;
      case 'In Progress':
        return <Wrench size={size} strokeWidth={strokeWidth} />;
      case 'Resolved':
        return <CheckCircle2 size={size} strokeWidth={strokeWidth} />;
      case 'Closed':
        return <Archive size={size} strokeWidth={strokeWidth} />;
      case 'Reopened':
        return <RotateCcw size={size} strokeWidth={strokeWidth} />;
      case 'Rejected':
        return <XCircle size={size} strokeWidth={strokeWidth} />;
      case 'Merged':
        return <GitMerge size={size} strokeWidth={strokeWidth} />;
      default:
        return <CircleDot size={size} strokeWidth={strokeWidth} />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border || 'transparent',
      }}
    >
      {renderIcon()}
      <span>{config.label}</span>
    </span>
  );
}

/**
 * PriorityBadge - Pill with dot/icon + label
 * Low (0–29), Medium (30–54), High (55–74), Critical (75+)
 * Rule from DESIGN.md: Critical is solid red, the only solid-fill badge
 */
export function PriorityBadge({ priority, score, className = '' }) {
  // Normalize priority key
  let band = null;
  if (score !== undefined && score !== null) {
    band = PRIORITY_BANDS.find((b) => score >= b.min && score <= b.max);
  }
  if (!band && priority) {
    band = PRIORITY_BANDS.find((b) => b.label.toLowerCase() === String(priority).toLowerCase());
  }
  if (!band) {
    band = PRIORITY_BANDS[0]; // fallback to Low
  }

  const isCritical = band.key === 'critical';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isCritical ? 'bg-danger text-white shadow-xs' : 'border'
      } ${className}`}
      style={
        isCritical
          ? { backgroundColor: '#D92D20', color: '#FFFFFF' }
          : {
              backgroundColor: band.bg,
              color: band.fg,
              borderColor: `${band.dot}33`,
            }
      }
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isCritical ? 'bg-white' : ''}`}
        style={!isCritical ? { backgroundColor: band.dot } : {}}
      />
      <span>{band.label}</span>
    </span>
  );
}

/**
 * SlaBadge - Clock icon + countdown
 * On track: teal, Due soon: amber, Overdue: red
 */
export function SlaBadge({ deadline, created, className = '' }) {
  const { state, label, isOverdue } = getSlaStatus(deadline, created);

  let style = {
    bg: '#E3F6F4',
    text: '#0F766E',
    border: '#A7E3DC',
  };

  if (state === 'due-soon') {
    style = {
      bg: '#FFF5CC',
      text: '#8A6A00',
      border: '#F6D3A6',
    };
  } else if (state === 'overdue') {
    style = {
      bg: '#FDECEA',
      text: '#B42318',
      border: '#F7C1BB',
    };
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        isOverdue ? 'animate-pulse' : ''
      } ${className}`}
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderColor: style.border,
      }}
      title={`SLA target: ${label}`}
    >
      {isOverdue ? <AlertTriangle size={12} strokeWidth={2} /> : <Clock size={12} strokeWidth={2} />}
      <span>{label}</span>
    </span>
  );
}

/**
 * HotspotBadge - Orange tinted pill with Flame icon
 */
export function HotspotBadge({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700 ${className}`}
    >
      <Flame size={12} className="text-orange-600" />
      <span>Recurring hotspot</span>
    </span>
  );
}

/**
 * RoleBadge - Neutral pill (Student / Staff / Admin)
 */
export function RoleBadge({ role = 'student', className = '' }) {
  const roleDisplay = {
    student: { label: 'Student', bg: 'bg-brand-50', text: 'text-brand-700', border: 'border-brand-200' },
    staff: { label: 'Staff / Tech', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
    admin: { label: 'Admin', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  }[role.toLowerCase()] || { label: role, bg: 'bg-brand-50', text: 'text-brand-700', border: 'border-brand-200' };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${roleDisplay.bg} ${roleDisplay.text} ${roleDisplay.border} ${className}`}
    >
      {roleDisplay.label}
    </span>
  );
}

export default {
  StatusBadge,
  PriorityBadge,
  SlaBadge,
  HotspotBadge,
  RoleBadge,
};
