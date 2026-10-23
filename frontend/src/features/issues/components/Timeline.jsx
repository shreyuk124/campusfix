// features/issues/components/Timeline.jsx - Timeline conforming to DESIGN.md §4.7 & Privacy Rule §9
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
  Clock,
  CheckCircle,
} from 'lucide-react';
import { formatRelativeTime, formatAbsoluteDate } from '../../../lib/format';

export function Timeline({ timeline = [], resolutionNote = null, className = '' }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className={`rounded-xl border border-line bg-surface p-6 text-center text-sm text-muted ${className}`}>
        No timeline events recorded yet.
      </div>
    );
  }

  // Helper for timeline status dot icons
  const getDotIcon = (toStatus) => {
    const size = 14;
    switch (toStatus) {
      case 'Reported':
        return <CircleDot size={size} className="text-slate-500" />;
      case 'Assigned':
        return <UserCheck size={size} className="text-sky-600" />;
      case 'In Progress':
        return <Wrench size={size} className="text-indigo-600" />;
      case 'Resolved':
        return <CheckCircle2 size={size} className="text-teal-600" />;
      case 'Closed':
        return <Archive size={size} className="text-slate-600" />;
      case 'Reopened':
        return <RotateCcw size={size} className="text-danger" />;
      case 'Rejected':
        return <XCircle size={size} className="text-gray-500" />;
      case 'Merged':
        return <GitMerge size={size} className="text-purple-600" />;
      default:
        return <CircleDot size={size} className="text-brand-500" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Highlighted Resolution Note Block (DESIGN.md §4.7) if resolved */}
      {resolutionNote && (
        <div className="rounded-xl border border-teal-300 bg-teal-50 p-4 sm:p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs">
              <CheckCircle size={16} strokeWidth={2.5} />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-teal-900">Work Resolution Report</h4>
                <span className="text-xs font-semibold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-full">
                  Verified by Staff
                </span>
              </div>
              <p className="text-sm text-teal-950 leading-relaxed pt-1">{resolutionNote}</p>
            </div>
          </div>
        </div>
      )}

      {/* Vertical Timeline List */}
      <div className="rounded-xl border border-line bg-surface p-5 sm:p-6 shadow-card">
        <h3 className="text-base font-bold text-ink mb-5 flex items-center gap-2">
          <Clock size={18} className="text-brand-600" />
          <span>Status & Activity History</span>
        </h3>

        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
          {timeline.map((entry, index) => {
            const isLast = index === timeline.length - 1;
            const actorRole = entry.actor?.role || 'student';

            // PRIVACY RULE: Never display reporter identity to other students (DESIGN.md §9)
            const actorDisplayName =
              actorRole === 'student' ? 'A student' : entry.actor?.name || 'Campus Representative';

            return (
              <div key={entry.id || index} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-6 sm:-left-8 top-1 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border-2 border-surface bg-surface-muted shadow-xs ring-4 ring-canvas">
                  {getDotIcon(entry.toStatus)}
                </div>

                {/* Event Details */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-ink text-sm">
                        {entry.toStatus ? `Status: ${entry.toStatus}` : 'Event recorded'}
                      </span>
                      <span className="text-muted">by</span>
                      <span className="font-medium text-body bg-surface-muted px-1.5 py-0.5 rounded border border-line">
                        {actorDisplayName}
                      </span>
                    </div>

                    <time
                      dateTime={entry.timestamp}
                      className="text-muted hover:text-ink cursor-default"
                      title={formatAbsoluteDate(entry.timestamp)}
                    >
                      {formatRelativeTime(entry.timestamp)}
                    </time>
                  </div>

                  {entry.note && (
                    <p className="text-xs sm:text-sm text-body/90 bg-surface-muted/60 p-2.5 rounded-lg border border-line/60 mt-1 leading-relaxed">
                      {entry.note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Timeline;
