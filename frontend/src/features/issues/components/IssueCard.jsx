// features/issues/components/IssueCard.jsx - Grounded directly in campus_feed_redesign.jpg
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Users,
  ArrowUp,
  Check,
  ChevronRight,
} from 'lucide-react';
import CategoryIcon from '../../../components/ui/CategoryIcon';
import { StatusBadge, PriorityBadge, HotspotBadge } from '../../../components/ui/Badge';
import { formatRelativeTime } from '../../../lib/format';

/**
 * Category Icon Resolver
 */
export function getCategoryIcon(category, size = 20, className = '') {
  return <CategoryIcon category={category} size={size} className={className} />;
}

/**
 * IssueCard Component
 * Implements the card design from campus_feed_redesign.jpg with tactile micro-interactions
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
  style,
}) {
  if (!issue) return null;

  const [isBouncing, setIsBouncing] = useState(false);
  const [showPlusOne, setShowPlusOne] = useState(false);

  const {
    id,
    referenceId = 'CF-2026-0000',
    title,
    building,
    location,
    category,
    status = 'Reported',
    priority,
    priorityScore,
    isSafetyRisk = false,
    createdAt,
    updatedAt,
    affectedCount = 1,
    hasJoined = false,
    isReporter = false,
    isHotspot = false,
    assignedTeam = 'Unassigned',
  } = issue;

  const resolvedPriority =
    priority ||
    (isSafetyRisk ? 'High' : affectedCount >= 20 ? 'High' : affectedCount >= 10 ? 'Medium' : 'Medium');

  const detailUrl = `/issues/${id || referenceId}`;

  const handleJoinClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleJoin && !isReporter) {
      setIsBouncing(true);
      if (!hasJoined) {
        setShowPlusOne(true);
        setTimeout(() => setShowPlusOne(false), 750);
      }
      setTimeout(() => setIsBouncing(false), 400);
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
      style={style}
      className={`group relative rounded-xl border border-line bg-surface p-5 sm:p-6 shadow-card hover:shadow-hover hover:border-brand-300/80 hover:-translate-y-0.5 transition-all duration-200 ${
        isSelected ? 'ring-2 ring-brand-500 bg-brand-50/20' : ''
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left Column: Category Avatar & Issue Info */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          {/* Admin selection checkbox */}
          {variant === 'admin' && (
            <div className="pt-1 pr-1 shrink-0">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={handleCheckboxClick}
                className="h-4 w-4 rounded border-line-strong text-brand-600 focus:ring-brand-500 cursor-pointer"
                aria-label={`Select issue ${referenceId}`}
              />
            </div>
          )}

          {/* Category Icon Squircle Container (#F1F5F9 surface with hover tilt & active tint) */}
          <div
            className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100/90 text-slate-800 border border-slate-200/60 shadow-2xs group-hover:scale-105 group-hover:-rotate-3 group-hover:bg-brand-50 group-hover:text-brand-600 group-hover:border-brand-200 transition-all duration-200"
            title={category}
          >
            {getCategoryIcon(category, 22, 'stroke-[1.8]')}
          </div>

          {/* Main Info Stack */}
          <div className="min-w-0 flex-1">
            {/* Title */}
            <Link
              to={detailUrl}
              className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
            >
              <h3 className="text-base sm:text-[17px] font-bold text-ink leading-snug group-hover:text-brand-600 transition-colors">
                {title}
              </h3>
            </Link>

            {/* Location Line with Pin Icon */}
            <div className="mt-1 flex items-center gap-1.5 text-xs sm:text-[13px] text-muted">
              <MapPin size={13} className="shrink-0 text-muted/80" />
              <span className="truncate">
                <span className="font-medium text-body/90">{building}</span>
                {location && <span> · {location}</span>}
              </span>
            </div>

            {/* Reference ID in JetBrains Mono font */}
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-muted">
                ID: {referenceId}
              </span>
              {isHotspot && <HotspotBadge count={1} />}
            </div>

            {/* Badges Row: Status Pill, Priority Pill, and Affected Count */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {/* Status Badge (Solid Royal Blue pill in screenshot) */}
              <StatusBadge status={status} />

              {/* Priority Badge (High Priority Orange / Medium Priority Slate) */}
              <PriorityBadge priority={resolvedPriority} score={priorityScore} />

              {/* Community Impact Indicator */}
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 ml-1">
                <Users size={14} className="text-slate-500 shrink-0" />
                <span>{affectedCount} {affectedCount === 1 ? 'student affected' : 'students affected'}</span>
              </span>

              {/* Reporter label */}
              {isReporter && (
                <span className="inline-flex items-center rounded-full bg-brand-50 border border-brand-200 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                  Reported by you
                </span>
              )}
            </div>

            {/* Relative Timestamp */}
            <div className="mt-2.5 text-xs text-muted/90">
              <span>Reported {formatRelativeTime(createdAt || updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Actions Stack (View Details & ↑ Upvote) */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-line">
          {/* View Details Button */}
          <Link
            to={detailUrl}
            className="inline-flex items-center justify-center h-9 px-4 rounded-lg border border-line-strong bg-surface text-xs sm:text-sm font-semibold text-ink shadow-xs hover:bg-surface-muted hover:border-slate-400 active:scale-95 transition-all"
          >
            <span>View Details</span>
          </Link>

          {/* Upvote Button with Tactile Spring + "+1" Floating Burst */}
          {showJoinButton && status !== 'Resolved' && status !== 'Closed' && (
            <div className="relative">
              {showPlusOne && (
                <span className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 animate-float-up rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-md z-30">
                  +1
                </span>
              )}

              <button
                type="button"
                onClick={handleJoinClick}
                disabled={isReporter}
                className={`relative inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95 ${
                  isBouncing ? 'animate-spring-bounce' : ''
                } ${
                  hasJoined
                    ? 'border border-brand-500 bg-brand-50 text-brand-600 hover:bg-brand-100 cursor-pointer shadow-xs'
                    : 'border border-line-strong bg-surface text-ink hover:bg-brand-50 hover:text-brand-600 hover:border-brand-300 cursor-pointer'
                } ${isReporter ? 'opacity-85' : ''}`}
                title={isReporter ? 'You reported this issue' : hasJoined ? 'You upvoted this issue. Click to remove.' : 'Upvote: mark that this issue affects you'}
              >
                {hasJoined ? (
                  <>
                    <Check size={14} className="stroke-[2.5] text-brand-600" />
                    <span>Upvoted</span>
                  </>
                ) : (
                  <>
                    <ArrowUp size={14} className="stroke-[2.5]" />
                    <span>Upvote</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Admin Quick Actions Strip (when variant === 'admin') */}
      {variant === 'admin' && onQuickAction && (
        <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs">
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
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  !assignedTeam || assignedTeam === 'Unassigned' || status === 'Reported'
                    ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-xs'
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
