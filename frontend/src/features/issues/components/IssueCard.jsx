// features/issues/components/IssueCard.jsx - Shared core IssueCard component
// Conforms to DESIGN.md §4.5 and reusable across Student Feed, My Issues, Staff and Admin dashboards
import { Link } from 'react-router-dom';
import {
  Users,
  Clock,
  User,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { StatusBadge, PriorityBadge, SlaBadge, HotspotBadge } from '../../../components/ui/Badge';
import { formatRelativeTime } from '../../../lib/format';
import { getCategoryIcon } from './categoryIcons';

/**
 * Priority Border Color resolver for left 4px bar
 */
function getPriorityBorderColor(priority) {
  const p = String(priority || '').toLowerCase();
  if (p === 'critical') return 'border-l-[#D92D20]';
  if (p === 'high') return 'border-l-[#ED7D1E]';
  if (p === 'medium') return 'border-l-[#E0B000]';
  return 'border-l-[#22A559]'; // low
}

/**
 * IssueCard Component
 *
 * @param {Object} props
 * @param {Object} props.issue - The issue object
 * @param {string} props.variant - 'default' | 'admin' | 'staff'
 * @param {boolean} props.isSelected - Selection state for admin multi-select
 * @param {Function} props.onSelect - Callback when admin selects this card
 * @param {Function} props.onToggleJoin - Quick "+1 I'm affected" button action
 * @param {Function} props.onQuickAction - Quick actions handler (assign, status)
 * @param {boolean} props.showJoinButton - Whether to show quick join button
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
    priority = 'Medium',
    priorityScore,
    slaDeadline,
    createdAt,
    updatedAt,
    affectedCount = 1,
    hasJoined = false,
    isReporter = false,
    isHotspot = false,
    assignedTeam = 'Unassigned',
  } = issue;

  const priorityBorderClass = getPriorityBorderColor(priority);
  const detailUrl = `/issues/${id || referenceId}`;

  const handleJoinClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleJoin) {
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
      className={`group relative flex flex-col justify-between rounded-xl border border-line bg-surface p-4 sm:p-5 shadow-card transition-all duration-150 hover:shadow-hover hover:border-line-strong border-l-4 ${priorityBorderClass} ${
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

        {/* Badges Row */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <StatusBadge status={status} />
          <PriorityBadge priority={priority} score={priorityScore} />
          {slaDeadline && <SlaBadge deadline={slaDeadline} created={createdAt} />}
          {isHotspot && <HotspotBadge />}
          {isReporter && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-200 px-2 py-0.5 text-xs font-medium text-brand-700">
              Reported by you
            </span>
          )}
          {hasJoined && !isReporter && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-xs font-medium text-orange-700">
              <Heart size={11} className="fill-orange-600 text-orange-600" />
              You joined
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <hr className="my-3.5 border-line" />

      {/* Footer: Affected count, Updated relative time, Owner team */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        {/* Left: Affected Count with quick toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleJoinClick}
            disabled={!showJoinButton}
            title={hasJoined ? "You marked that you're affected by this" : "Click if this problem affects you too"}
            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-medium transition-colors ${
              hasJoined
                ? 'bg-orange-50 text-orange-700 border border-orange-200'
                : 'bg-surface-muted text-muted hover:text-orange-700 hover:bg-orange-50/70 border border-line'
            } ${showJoinButton ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <Users
              size={13}
              className={hasJoined ? 'text-orange-600' : 'text-muted group-hover:text-orange-600'}
            />
            <span>
              {affectedCount} affected
            </span>
            {showJoinButton && !hasJoined && (
              <span className="text-[10px] text-brand-600 font-semibold ml-0.5">+1</span>
            )}
          </button>
        </div>

        {/* Center/Right: Relative time and Owner Team */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1" title={createdAt}>
            <Clock size={12} className="text-muted" />
            <span>Updated {formatRelativeTime(updatedAt || createdAt)}</span>
          </span>

          <span
            className="hidden sm:inline-flex items-center gap-1 font-medium text-ink/80 truncate max-w-[130px]"
            title={`Assigned team: ${assignedTeam}`}
          >
            <User size={12} className="text-muted shrink-0" />
            <span className="truncate">{assignedTeam}</span>
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
          <span className="text-muted">
            Assigned: <strong className="text-ink">{assignedTeam}</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickAction('assign', issue);
              }}
              className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 hover:bg-brand-100 font-medium"
            >
              Assign
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickAction('priority', issue);
              }}
              className="px-2 py-0.5 rounded bg-surface-muted border border-line text-ink hover:bg-brand-50 font-medium"
            >
              Priority
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default IssueCard;
