import { useState, useEffect } from 'react';
import { AlertTriangle, ThumbsUp, ArrowRight, Clock, MapPin, Loader2, PlusCircle } from 'lucide-react';
import { issuesApi } from '../../../api/issues';
import issuesService from '../../issues/issuesService';

/**
 * Helper: Formats an ISO date into human-readable relative time (e.g. "10 mins ago")
 */
function formatTimeAgo(dateString) {
  if (!dateString) return 'Recently';
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}

/**
 * DuplicateChecker Component
 * 
 * Searches for existing open issues in the same building and category.
 * If matches are found:
 * 1. Shows "I am affected too" buttons for 1-tap upvoting.
 * 2. Shows a clear "Report anyway as a new issue" button so the user is never blocked.
 * 
 * @param {string} building - Selected building name
 * @param {string} category - Selected category key
 * @param {function} onAffectedToo - Callback when student upvotes an existing issue
 * @param {function} onProceedAsNew - Callback when student chooses to report as new
 * @param {function} onDuplicatesFound - Callback to notify parent whether duplicates exist
 */
export default function DuplicateChecker({
  building,
  category,
  onAffectedToo,
  onProceedAsNew,
  onDuplicatesFound,
}) {
  const [matchingIssues, setMatchingIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Reset if building or category is not chosen yet
    if (!building || !category) {
      setMatchingIssues([]);
      if (onDuplicatesFound) onDuplicatesFound(false);
      return;
    }

    const fetchDuplicates = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch live open issues from MongoDB Atlas
        const response = await issuesApi.getSimilar({
          buildingId: building,
          categoryId: category,
        });

        let issues = response?.data || [];

        // 2. Also check local client storage so newly created issues show up immediately
        try {
          const localList = await issuesService.getIssues({ building, category });
          const activeLocal = localList.filter(
            (i) =>
              (i.building?.toLowerCase() === building.toLowerCase() || i.buildingName?.toLowerCase() === building.toLowerCase()) &&
              i.category?.toLowerCase() === category.toLowerCase() &&
              ['Reported', 'Assigned', 'In Progress', 'reported', 'assigned', 'progress'].includes(i.status)
          );

          // Merge without duplicate refIds
          const seenRefIds = new Set(issues.map((i) => i.refId));
          for (const item of activeLocal) {
            const rId = item.refId || item.referenceId || item.id;
            if (!seenRefIds.has(rId)) {
              issues.push({
                _id: item.id || item._id,
                refId: rId,
                title: item.title,
                locationText: item.location || item.locationText || 'Campus Area',
                status: item.status,
                reportCount: item.reportCount || item.affectedCount || 1,
                createdAt: item.createdAt || new Date().toISOString(),
                isReporter: Boolean(item.isReporter),
              });
              seenRefIds.add(rId);
            }
          }
        } catch (localErr) {
          console.warn('Could not read local issues store:', localErr);
        }

        if (isMounted) {
          setMatchingIssues(issues);
          if (onDuplicatesFound) {
            onDuplicatesFound(issues.length > 0);
          }
        }
      } catch (err) {
        console.warn('Live duplicate query error, checking local store:', err);
        // Fallback to local store if server is unreachable
        try {
          const localList = await issuesService.getIssues({ building, category });
          const fallback = localList.filter(
            (i) =>
              i.building?.toLowerCase() === building.toLowerCase() &&
              i.category?.toLowerCase() === category.toLowerCase()
          );
          if (isMounted) {
            setMatchingIssues(fallback);
            if (onDuplicatesFound) onDuplicatesFound(fallback.length > 0);
          }
        } catch {
          if (isMounted && onDuplicatesFound) onDuplicatesFound(false);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDuplicates();

    return () => {
      isMounted = false;
    };
  }, [building, category]);

  // Loading indicator while querying MongoDB
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-line bg-surface p-3 text-xs text-muted animate-pulse">
        <Loader2 size={16} className="animate-spin text-brand-600" />
        <span>Checking for existing complaints in {building}...</span>
      </div>
    );
  }

  // If no matching issues exist, return null
  if (!matchingIssues || matchingIssues.length === 0) {
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
              {matchingIssues.length} open in {building}
            </span>
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            This issue might already be reported. Click <strong>"I am affected too"</strong> to upvote it and increase its priority, or click <strong>"Report anyway"</strong> to submit your own complaint.
          </p>
        </div>
      </div>

      {/* List of Matching Open Complaints */}
      <div className="space-y-2.5">
        {matchingIssues.map((issue) => {
          const issueId = issue._id || issue.id;
          const refId = issue.refId || issue.referenceId || issueId;
          const count = issue.reportCount || issue.affectedCount || 1;
          const time = formatTimeAgo(issue.createdAt || issue.reportedAt);

          return (
            <div
              key={refId}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-line bg-surface p-3.5 shadow-sm"
            >
              {/* Issue Details */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-brand-600">
                    #{refId}
                  </span>
                  <span className="text-xs font-semibold text-ink line-clamp-1">
                    {issue.title}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    <span>{issue.locationText || issue.specificLocation || 'Building premises'}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{time}</span>
                  </span>
                  <span className="rounded bg-brand-50 text-brand-700 px-1.5 py-0.5 font-medium border border-brand-200 capitalize">
                    {issue.status || 'Reported'}
                  </span>
                </div>
              </div>

              {/* 1-Tap "I am affected too" Action */}
              {issue.isReporter ? (
                <span className="inline-flex items-center justify-center shrink-0 rounded-md bg-brand-50 border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700">
                  Your report ({count})
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onAffectedToo(issue)}
                  className="inline-flex items-center justify-center gap-1.5 shrink-0 rounded-md bg-teal px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-teal-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-teal/30 cursor-pointer"
                >
                  <ThumbsUp size={14} />
                  <span>I am affected too ({count})</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Clear Action: Report Anyway as a New Issue */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-warning-border/60 pt-3">
        <span className="text-xs text-muted text-center sm:text-left">
          Is your problem different or in another room?
        </span>
        <button
          type="button"
          onClick={onProceedAsNew}
          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-500 bg-brand-50/60 px-3.5 py-1.5 text-xs font-semibold text-brand-700 shadow-xs transition hover:bg-brand-100 hover:border-brand-600 active:scale-95 cursor-pointer"
        >
          <PlusCircle size={14} />
          <span>Report anyway as a new issue</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
