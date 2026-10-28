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
 * Resolves category container background tint and icon color
 */
function getCategoryTint(category) {
  const norm = String(category || '').toLowerCase();

  // Furniture: soft blue background, blue icon
  if (
    norm.includes('furn') ||
    norm.includes('bench') ||
    norm.includes('desk') ||
    norm.includes('chair') ||
    norm.includes('fixture')
  ) {
    return 'bg-blue-50/90 text-blue-600 border-blue-200/70 group-hover:bg-blue-100/90 group-hover:border-blue-300';
  }

  // Water/plumbing: soft cyan background, cyan icon
  if (
    norm.includes('plumb') ||
    norm.includes('water') ||
    norm.includes('leak') ||
    norm.includes('tap') ||
    norm.includes('washroom') ||
    norm.includes('pipe')
  ) {
    return 'bg-cyan-50/90 text-cyan-600 border-cyan-200/70 group-hover:bg-cyan-100/90 group-hover:border-cyan-300';
  }

  // Electrical: soft amber background, amber icon
  if (
    norm.includes('elect') ||
    norm.includes('power') ||
    norm.includes('light') ||
    norm.includes('switch') ||
    norm.includes('spark') ||
    norm.includes('wire')
  ) {
    return 'bg-amber-50/90 text-amber-600 border-amber-200/70 group-hover:bg-amber-100/90 group-hover:border-amber-300';
  }

  // Any other category: neutral fallback
  return 'bg-slate-100/90 text-slate-700 border-slate-200/70 group-hover:bg-slate-200/80 group-hover:border-slate-300';
}

/**
 * Cleans up and deduplicates building/location segments
 */
function formatLocationSegments(building, location) {
  const rawSegments = [];

  const extract = (str) => {
    if (!str || typeof str !== 'string') return;
    const parts = str.split(/\s*[·•]\s*/);
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed) {
        rawSegments.push(trimmed);
      }
    }
  };

  extract(building);
  extract(location);

  const seen = new Set();
  const deduped = [];
  for (const seg of rawSegments) {
    const key = seg.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(seg);
    }
  }

  return deduped;
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

  const pLower = String(resolvedPriority || '').toLowerCase();
  const isHighOrCritical = pLower.includes('high') || pLower.includes('critical');

  const detailUrl = `/issues/${id || referenceId}`;
  const locationSegments = formatLocationSegments(building, location);

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
      className={`group relative rounded-xl border border-line bg-surface p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-slate-300 hover:-translate-y-[2px] transition-all duration-150 ease-out ${
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

          {/* 2. Category Icon Squircle Container with light per-category tinting */}
          <div
            className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl border shadow-2xs group-hover:scale-105 group-hover:-rotate-2 transition-all duration-150 ${getCategoryTint(
              category
            )}`}
            title={category}
          >
            {getCategoryIcon(category, 22, 'stroke-[2.2]')}
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

            {/* 3. Location Line with Deduplicated Segments */}
            {locationSegments.length > 0 && (
              <div className="mt-1 flex items-center gap-1.5 text-xs sm:text-[13px] text-slate-500">
                <MapPin size={13} className="shrink-0 text-slate-400" />
                <span className="truncate">
                  {locationSegments.map((segment, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span className="text-slate-300 mx-1">·</span>}
                      <span className={idx === 0 ? 'font-medium text-slate-600' : 'text-slate-400'}>
                        {segment}
                      </span>
                    </React.Fragment>
                  ))}
                </span>
              </div>
            )}

            {/* Badges Row: Status Pill, Priority, Reporter, Hotspot */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {/* Status Badge */}
              <StatusBadge status={status} />

              {/* 5. Priority: Prominent for High/Critical, subtle text label for Medium/Low */}
              {isHighOrCritical ? (
                <PriorityBadge priority={resolvedPriority} score={priorityScore} />
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  <span>{resolvedPriority} Priority</span>
                </span>
              )}

              {/* Reporter label */}
              {isReporter && (
                <span className="inline-flex items-center rounded-full bg-brand-50 border border-brand-200 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                  Reported by you
                </span>
              )}

              {isHotspot && <HotspotBadge count={1} />}
            </div>

            {/* 5. Metadata Sub-line: Reference ID + Relative Timestamp */}
            <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono font-medium text-slate-500">
                ID: {referenceId}
              </span>
              <span className="text-slate-300">•</span>
              <span>Reported {formatRelativeTime(createdAt || updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* 4. Right Column: Actions Stack with Fixed-Width Aligned Buttons */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-line w-full sm:w-36">
          {/* View Details Button */}
          <Link
            to={detailUrl}
            className="w-full sm:w-36 inline-flex items-center justify-center h-9 px-3 rounded-lg border border-line-strong bg-surface text-xs sm:text-sm font-semibold text-ink shadow-xs hover:bg-surface-muted hover:border-slate-400 active:scale-95 transition-all"
          >
            <span>View Details</span>
          </Link>

          {/* 4. Upvote + Affected Count Merged Widget */}
          {showJoinButton && status !== 'Resolved' && status !== 'Closed' ? (
            <div className="relative w-full sm:w-36">
              {showPlusOne && (
                <span className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 animate-float-up rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-md z-30">
                  +1
                </span>
              )}

              <button
                type="button"
                onClick={handleJoinClick}
                disabled={isReporter}
                className={`relative inline-flex items-center justify-center gap-1.5 h-9 w-full rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95 ${
                  isBouncing ? 'animate-spring-bounce' : ''
                } ${
                  hasJoined
                    ? 'border border-brand-500 bg-brand-50 text-brand-600 hover:bg-brand-100 cursor-pointer'
                    : 'border border-line-strong bg-surface text-slate-700 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-300 cursor-pointer'
                } ${isReporter ? 'opacity-80 cursor-not-allowed' : ''}`}
                title={
                  isReporter
                    ? 'You reported this issue'
                    : hasJoined
                    ? 'You upvoted this issue. Click to remove.'
                    : 'Upvote: mark that this issue affects you'
                }
              >
                {hasJoined ? (
                  <>
                    <Check size={14} className="stroke-[2.5] text-brand-600 shrink-0" />
                    <span className="font-bold tabular-nums">{affectedCount}</span>
                    <span>Upvoted</span>
                  </>
                ) : (
                  <>
                    <ArrowUp size={14} className="stroke-[2.5] text-slate-500 shrink-0" />
                    <span className="font-bold tabular-nums text-ink">{affectedCount}</span>
                    <span>Upvote</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            (status === 'Resolved' || status === 'Closed') && (
              <div
                className="w-full sm:w-36 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-slate-200/70 bg-slate-50 text-slate-500 text-xs font-medium"
                title={`${affectedCount} ${affectedCount === 1 ? 'student affected' : 'students affected'}`}
              >
                <Users size={13} className="shrink-0 text-slate-400" />
                <span className="tabular-nums font-semibold text-slate-600">{affectedCount}</span>
                <span>affected</span>
              </div>
            )
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
