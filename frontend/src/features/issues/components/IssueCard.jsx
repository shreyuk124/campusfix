// features/issues/components/IssueCard.jsx - Shared core IssueCard component
// Minimalistic, clean, modern design without SLA score clutter or emojis
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Droplets,
  Zap,
  Sparkles,
  Wifi,
  Armchair,
  ShieldAlert,
  CircleHelp,
  Users,
  Clock,
  User,
  Check,
  ChevronRight,
} from 'lucide-react';
import CategoryIcon from '../../../components/ui/CategoryIcon';
import { StatusBadge, HotspotBadge } from '../../../components/ui/Badge';
import { formatRelativeTime } from '../../../lib/format';

/**
 * Category Icon Resolver
 */
export function getCategoryIcon(category, size = 18, className = '') {
  return <CategoryIcon category={category} size={size} className={className} />;
}

/**
 * IssueCard Component
 */
export function IssueCard({
  issue,
  variant = 'default',
  isSelected = false,
  onSelect,
  onToggleJoin,
  onQuickAction,
  showJoinButton = true,
  className = '',
}) {
  if (!issue) return null;

  const {
    id,
    referenceId = 'CF-2026-0000',
    title,
    building,
    location,
    category,
    status = 'Reported',
    createdAt,
    updatedAt,
    affectedCount = 1,
    hasJoined = false,
    isReporter = false,
    isHotspot = false,
    assignedTeam = 'Unassigned',
  } = issue;

  const detailUrl = `/issues/${id || referenceId}`;

  const handleJoinClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleJoin && !isReporter) {
      onToggleJoin(issue);
    }
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(issue);
    }
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-xl border border-line bg-surface p-4 sm:p-5 shadow-card transition-all duration-150 hover:shadow-hover hover:border-brand-200 ${
        isSelected ? 'ring-2 ring-brand-500 bg-brand-50/20' : ''
      } ${className}`}
    >
      {/* Top Row: Category Icon, Title, Reference ID & Optional Admin Checkbox */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            {/* Admin checkbox */}
            {variant === 'admin' && (
              <div className="pt-0.5 pr-1">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={handleCheckboxClick}
                  className="h-4 w-4 rounded border-line-strong text-brand-600 focus:ring-brand-500 cursor-pointer"
                  aria-label={`Select issue ${referenceId}`}
                />
              </div>
            )}

            {/* Category Icon Badge */}
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 border border-brand-100 transition-colors group-hover:bg-brand-100"
              title={category}
            >
              {getCategoryIcon(category, 18)}
            </div>

            {/* Title & Location */}
            <div className="min-w-0 flex-1">
              <Link
                to={detailUrl}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
              >
                <h3 className="text-sm sm:text-base font-semibold text-ink line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors">
                  {title}
                </h3>
              </Link>
              <p className="mt-1 text-xs text-muted truncate">
                <span className="font-medium text-body/90">{building}</span>
                {location && <span> · {location}</span>}
              </p>
            </div>
          </div>

          {/* Reference ID in JetBrains Mono font */}
          <div className="shrink-0 text-right">
            <span className="font-mono text-xs font-semibold text-muted bg-surface-muted px-2 py-0.5 rounded border border-line">
              {referenceId}
            </span>
          </div>
        </div>

        {/* Clean Badges Row (Zero SLA/Score clutter) */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <StatusBadge status={status} />
          {isHotspot && <HotspotBadge />}
          {variant !== 'admin' && isReporter && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-200 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
              Reported by you
            </span>
          )}
          {variant !== 'admin' && hasJoined && !isReporter && (
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
              <Check size={11} className="text-teal-700 stroke-[2.5]" />
              You marked affected
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <hr className="my-3.5 border-line" />

      {/* Footer: Affected count, Mark Affected action, Updated time */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        {/* Left: Affected Count pill + distinct Action Button on the side */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-body font-medium px-2.5 py-1 rounded-md bg-surface-muted border border-line">
            <Users size={13} className="text-muted shrink-0" />
            <span>{affectedCount} affected</span>
          </span>

          {variant !== 'admin' && showJoinButton && !isReporter && status !== 'Resolved' && status !== 'Closed' && (
            <button
              type="button"
              onClick={handleJoinClick}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                hasJoined
                  ? 'bg-teal-50 text-teal-800 border border-teal-300 hover:bg-teal-100 cursor-pointer shadow-xs'
                  : 'bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 hover:border-brand-300 cursor-pointer shadow-xs'
              }`}
              title={hasJoined ? 'Click to unmark' : 'Click to mark that this issue affects you too'}
            >
              {hasJoined ? (
                <>
                  <Check size={13} className="text-teal-700 stroke-[2.5]" />
                  <span>You marked affected</span>
                </>
              ) : (
                <>
                  <span className="font-bold text-brand-600">+1</span>
                  <span>Mark affected</span>
                </>
              )}
            </button>
          )}

          {variant !== 'admin' && isReporter && (
            <span className="inline-flex items-center text-[11px] font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
              Your report
            </span>
          )}
        </div>

        {/* Right: Relative time and View detail arrow */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1" title={createdAt}>
            <Clock size={12} className="text-muted" />
            <span>Updated {formatRelativeTime(updatedAt || createdAt)}</span>
          </span>

          <Link
            to={detailUrl}
            className="flex h-6 w-6 items-center justify-center rounded text-muted hover:bg-brand-50 hover:text-brand-600 transition-colors"
            aria-label={`View details for ${referenceId}`}
          >
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* Admin Quick Actions Strip (when variant='admin') */}
      {variant === 'admin' && onQuickAction && (
        <div className="mt-3 pt-2.5 border-t border-line/60 flex items-center justify-between text-xs">
          {status === 'Resolved' || status === 'Closed' ? (
            <span className="text-muted">
              Handled by: <strong className="text-ink">{assignedTeam !== 'Unassigned' ? assignedTeam : 'Campus Maintenance'}</strong>
            </span>
          ) : !assignedTeam || assignedTeam === 'Unassigned' || status === 'Reported' ? (
            <span className="inline-flex items-center gap-1.5 text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Awaiting Assignment
            </span>
          ) : (
            <span className="text-muted">
              Assigned: <strong className="text-ink">{assignedTeam}</strong>
            </span>
          )}

          {status !== 'Resolved' && status !== 'Closed' && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickAction('assign', issue);
                }}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  !assignedTeam || assignedTeam === 'Unassigned' || status === 'Reported'
                    ? 'bg-brand-500 text-white hover:bg-brand-600 font-semibold shadow-xs'
                    : 'bg-surface-muted text-body hover:bg-brand-50 hover:text-brand-700 border border-line'
                }`}
              >
                {!assignedTeam || assignedTeam === 'Unassigned' || status === 'Reported'
                  ? 'Assign Team'
                  : 'Reassign'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default IssueCard;
