// features/issues/MyIssuesPage.jsx - Student issue tracking page conforming to DESIGN.md §454-456
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Inbox,
  CheckCircle2,
  Archive,
  PlusCircle,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { IssueCard, FilterBar } from './components';
import { IssueCardSkeleton, EmptyState, ErrorState, useToast } from '../../components/ui';
import issuesService from './issuesService';

export default function MyIssuesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();

  const currentTab = searchParams.get('tab') || 'active'; // 'active' | 'awaiting' | 'closed'

  const [filters, setFilters] = useState({
    search: '',
    building: 'all',
    category: 'all',
    status: 'all',
    priority: 'all',
    sort: 'newest',
  });

  const [page, setPage] = useState(1);
  const limit = 8;
  const [data, setData] = useState({ issues: [], total: 0, totalPages: 1 });
  const [tabCounts, setTabCounts] = useState({ active: 0, awaiting: 0, closed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Compute tab counts
  const refreshTabCounts = useCallback(() => {
    const all = issuesService.getAllLocalIssues();
    const myIssues = all.filter((i) => i.isReporter || i.hasJoined);

    const activeCount = myIssues.filter((i) =>
      ['Reported', 'Assigned', 'In Progress', 'Reopened'].includes(i.status)
    ).length;

    const awaitingCount = myIssues.filter((i) => i.status === 'Resolved').length;

    const closedCount = myIssues.filter((i) =>
      ['Closed', 'Rejected', 'Merged'].includes(i.status)
    ).length;

    setTabCounts({ active: activeCount, awaiting: awaitingCount, closed: closedCount });
  }, []);

  // Fetch my issues according to current tab and filters
  const fetchMyIssues = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const tabParam =
        currentTab === 'awaiting'
          ? 'my-awaiting'
          : currentTab === 'closed'
          ? 'my-closed'
          : 'my-active';

      const result = await issuesService.getIssues({
        page,
        limit,
        tab: tabParam,
        ...filters,
        simulateDelay: 250,
      });

      setData(result);
      refreshTabCounts();
    } catch (err) {
      console.error('Error fetching my issues:', err);
      setError(err.message || 'Could not load your issues');
    } finally {
      setIsLoading(false);
    }
  }, [page, currentTab, filters, refreshTabCounts]);

  useEffect(() => {
    fetchMyIssues();
  }, [fetchMyIssues]);

  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
    setPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleToggleJoin = async (issue) => {
    try {
      const updated = await issuesService.toggleJoinIssue(issue.id);
      setData((prev) => ({
        ...prev,
        issues: prev.issues.map((i) => (i.id === issue.id ? updated : i)),
      }));
      refreshTabCounts();

      addToast({
        type: updated.hasJoined ? 'success' : 'info',
        title: updated.hasJoined ? 'Joined issue' : 'Left issue',
        message: updated.hasJoined
          ? `You will now receive updates on ${issue.referenceId}.`
          : `Removed from ${issue.referenceId}.`,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update vote.',
      });
    }
  };

  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, data.total);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            My Tracked Issues
          </h1>
          <p className="mt-1 text-sm text-muted">
            Track progress on problems you reported or joined, and verify completed maintenance repairs.
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-brand-600 self-start sm:self-auto"
        >
          <PlusCircle size={18} />
          <span>Report New Issue</span>
        </Link>
      </div>

      {/* Tabs Navigation (DESIGN.md §454: Active · Awaiting confirmation · Closed) */}
      <div className="border-b border-line">
        <nav className="flex space-x-6 sm:space-x-8" aria-label="My Issues Tabs">
          <button
            type="button"
            onClick={() => handleTabChange('active')}
            className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium transition-colors ${
              currentTab === 'active'
                ? 'border-brand-500 text-brand-600 font-semibold'
                : 'border-transparent text-muted hover:border-line-strong hover:text-ink'
            }`}
          >
            <Inbox size={18} />
            <span>Active Issues</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                currentTab === 'active'
                  ? 'bg-brand-100 text-brand-700'
                  : 'bg-surface-muted text-muted'
              }`}
            >
              {tabCounts.active}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('awaiting')}
            className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium transition-colors ${
              currentTab === 'awaiting'
                ? 'border-teal-600 text-teal-700 font-semibold'
                : 'border-transparent text-muted hover:border-line-strong hover:text-ink'
            }`}
          >
            <CheckCircle2 size={18} />
            <span>Awaiting Confirmation</span>
            {tabCounts.awaiting > 0 && (
              <span className="animate-pulse rounded-full bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-800 border border-teal-300">
                {tabCounts.awaiting} action needed
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('closed')}
            className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium transition-colors ${
              currentTab === 'closed'
                ? 'border-brand-500 text-brand-600 font-semibold'
                : 'border-transparent text-muted hover:border-line-strong hover:text-ink'
            }`}
          >
            <Archive size={18} />
            <span>Closed History</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                currentTab === 'closed'
                  ? 'bg-brand-100 text-brand-700'
                  : 'bg-surface-muted text-muted'
              }`}
            >
              {tabCounts.closed}
            </span>
          </button>
        </nav>
      </div>

      {/* Prominent Action Banner for "Awaiting Confirmation" Tab (DESIGN.md §5.2) */}
      {currentTab === 'awaiting' && (
        <div className="rounded-xl border border-teal-300 bg-teal-50 p-4 sm:p-5 shadow-xs flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-teal-900">
              Needs your confirmation
            </h3>
            <p className="mt-0.5 text-xs sm:text-sm text-teal-950 leading-relaxed">
              Staff have marked these issues resolved. Please check the physical location and click &quot;Confirm Fixed&quot; or &quot;Reopen&quot; if the problem still persists.
            </p>
          </div>
        </div>
      )}

      {/* FilterBar inside My Issues */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        showStatusFilter={currentTab === 'active'}
      />

      {/* Issues List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <IssueCardSkeleton />
          <IssueCardSkeleton />
        </div>
      ) : error ? (
        <ErrorState
          title="Could not load your issues"
          message={error}
          onRetry={fetchMyIssues}
        />
      ) : data.issues.length === 0 ? (
        <EmptyState
          icon={currentTab === 'awaiting' ? 'check' : 'inbox'}
          title={
            currentTab === 'awaiting'
              ? 'No issues awaiting confirmation'
              : currentTab === 'closed'
              ? 'No closed reports yet'
              : 'No reports yet'
          }
          description={
            currentTab === 'awaiting'
              ? 'All your maintenance complaints are either in progress or have already been confirmed and closed.'
              : currentTab === 'closed'
              ? 'Issues you verify and close will be permanently recorded here in your resolution history.'
              : 'Spot something broken on campus? Report it in under a minute to notify the estate maintenance crew.'
          }
          actionLabel={currentTab === 'active' ? 'Report an Issue' : undefined}
          onAction={() => (window.location.href = '/report')}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted px-1">
            <span>
              Showing <strong className="text-ink">{startIndex}–{endIndex}</strong> of{' '}
              <strong className="text-ink">{data.total}</strong> issues in this tab
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.issues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                variant="default"
                onToggleJoin={handleToggleJoin}
                showJoinButton={true}
              />
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="pt-4 flex items-center justify-between border-t border-line">
              <span className="text-xs text-muted">
                Page {page} of {data.totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-line-strong bg-surface text-xs font-medium text-ink hover:bg-brand-50 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page >= data.totalPages}
                  className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-line-strong bg-surface text-xs font-medium text-ink hover:bg-brand-50 disabled:opacity-40"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
