import { AlertTriangle, ThumbsUp, ArrowRight, Clock, MapPin } from 'lucide-react';
import { MOCK_EXISTING_ISSUES } from '../mock/mockDuplicates';

/**
 * DuplicateChecker Component
 * 
 * Intercepts the reporting flow early:
 * When both `building` and `category` are selected, it queries for matching
 * open issues in that building.
 * 
 * Props:
 * @param {string} building - Currently selected building (e.g. 'Academic Complex')
 * @param {string} category - Currently selected category (e.g. 'plumbing')
 * @param {function} onAffectedToo - Callback when student clicks "I am affected too"
 * @param {function} onProceedAsNew - Callback when student confirms "None of these, continue"
 */
export default function DuplicateChecker({
  building,
  category,
  onAffectedToo,
  onProceedAsNew,
}) {
  // If either field is missing, we don't have enough data to check for duplicates yet
  if (!building || !category) {
    return null;
  }

  // Filter matching issues based on exact building and category
  const matchingIssues = MOCK_EXISTING_ISSUES.filter(
    (issue) =>
      issue.building.toLowerCase() === building.toLowerCase() &&
      issue.category.toLowerCase() === category.toLowerCase()
  );

  // If no matching issues exist in this building, return null (render nothing)
  if (matchingIssues.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-warning-border bg-warning-bg/60 p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
      {/* Alert Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-warning font-bold border border-warning-border">
          <AlertTriangle size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-ink flex items-center gap-2">
            <span>Similar Issue Already Reported!</span>
            <span className="rounded-full bg-orange-700/10 px-2 py-0.5 text-[11px] font-semibold text-warning">
              {matchingIssues.length} found in {building}
            </span>
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            Another student may have already reported this problem. If one of these matches yours, click <strong>"I am affected too"</strong> to boost its priority without submitting a duplicate ticket!
          </p>
        </div>
      </div>

      {/* List of Matching Duplicate Cards */}
      <div className="space-y-2.5">
        {matchingIssues.map((issue) => (
          <div
            key={issue.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-line bg-surface p-3.5 shadow-sm"
          >
            {/* Issue Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-brand-600">
                  {issue.id}
                </span>
                <span className="text-xs font-semibold text-ink">
                  {issue.title}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted">
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  <span>{issue.specificLocation}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{issue.reportedAt}</span>
                </span>
                <span className="rounded bg-status-progress-bg text-status-progress-fg px-1.5 py-0.5 font-medium">
                  {issue.statusLabel}
                </span>
              </div>
            </div>

            {/* "I am affected too" Action Button */}
            <button
              type="button"
              onClick={() => onAffectedToo(issue)}
              className="inline-flex items-center justify-center gap-1.5 shrink-0 rounded-md bg-teal px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-teal-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-teal/30"
            >
              <ThumbsUp size={14} />
              <span>I am affected too ({issue.affectedCount})</span>
            </button>
          </div>
        ))}
      </div>

      {/* Bypass Action: Not my issue, continue to upload */}
      <div className="flex items-center justify-between border-t border-warning-border/60 pt-3">
        <span className="text-xs text-muted">
          Is your problem different or in another room?
        </span>
        <button
          type="button"
          onClick={onProceedAsNew}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
        >
          <span>None of these — report as new</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}