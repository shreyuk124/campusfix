// features/issues/MyIssuesPage.jsx - Student issue tracking page
// Minimalistic design with 2 clean tabs (Active Reports & Resolved History)
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Inbox,
  CheckCircle2,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { IssueCard, FilterBar } from './components';
import { IssueCardSkeleton, EmptyState, ErrorState } from '../../components/ui';
import issuesService from './issuesService';
import { issuesApi } from '../../api/issues';

export default function MyIssuesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab: 'active' | 'resolved' (fallbacks from legacy 'awaiting' / 'closed' map to 'resolved')
  const rawTab = searchParams.get('tab') || 'active';
  const currentTab = rawTab === 'awaiting' || rawTab === 'closed' ? 'resolved' : rawTab;

  const [filters, setFilters] = useState({
    search: '',
    building: 'all',
    category: 'all',
    status: 'all',
    sort: 'newest',
  });

  const [page, setPage] = useState(1);
  const limit = 8;
  const [data, setData] = useState({ issues: [], total: 0, totalPages: 1 });
  const [tabCounts, setTabCounts] = useState({ active: 0, resolved: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Compute tab counts exclusively for currently authenticated student
  const refreshTabCounts = useCallback(async () => {
    try {
      const res = await issuesApi.getMyIssues({ limit: 100 });
      const rawList = Array.isArray(res?.data) ? res.data : [];
      const activeCount = rawList.filter((i) =>
        ['Reported', 'Assigned', 'In Progress'].includes(i.status)
      ).length;
      const resolvedCount = rawList.filter((i) =>
        i.status === 'Resolved'
      ).length;
      setTabCounts({ active: activeCount, resolved: resolvedCount });
    } catch {
      // Fallback to local isolated issues
      const all = issuesService.getAllLocalIssues();
      const myIssues = all.filter((i) => i.isReporter);
      const activeCount = myIssues.filter((i) =>
        ['Reported', 'Assigned', 'In Progress'].includes(i.status)
      ).length;
      const resolvedCount = myIssues.filter((i) =>
        i.status === 'Resolved'
      ).length;
      setTabCounts({ active: activeCount, resolved: resolvedCount });
    }
  }, []);

  // Fetch my issues according to current tab and filters from protected backend
  const fetchMyIssues = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const tabParam = currentTab === 'resolved' ? 'resolved' : 'active';
      let items = [];
      let total = 0;
      let totalPages = 1;

      try {
        const res = await issuesApi.getMyIssues({
          page,
          limit,
          tab: tabParam,
          ...filters,
        });

        const rawList = Array.isArray(res?.data) ? res.data : [];
        items = rawList.map((doc) => ({
          ...issuesService.normalizeIssue(doc),
          isReporter: true,
        }));
        total = res?.pagination?.total ?? items.length;
        totalPages = res?.pagination?.totalPages ?? 1;
      } catch (apiErr) {
        // Fallback to isolated local service
        const fallback = await issuesService.getIssues({
          page,
          limit,
          tab: tabParam === 'resolved' ? 'my-resolved' : 'my-active',
          ...filters,
        });
        items = fallback.issues;
        total = fallback.total;
        totalPages = fallback.totalPages;
      }

      setData({ issues: items, total, totalPages });
      refreshTabCounts();
    } catch (err) {
      console.error('Error fetching my issues:', err);
      setError(err?.response?.data?.error?.message || err.message || 'Could not load your issues');
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
            Track real-time progress on problems you reported or joined across campus.
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

      {/* Tabs Navigation (Active Reports · Resolved Issues) */}
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
            <span>Active Reports</span>
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
            onClick={() => handleTabChange('resolved')}
            className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium transition-colors ${
              currentTab === 'resolved'
                ? 'border-teal-600 text-teal-700 font-semibold'
                : 'border-transparent text-muted hover:border-line-strong hover:text-ink'
            }`}
          >
            <CheckCircle2 size={18} />
            <span>Resolved History</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                currentTab === 'resolved'
                  ? 'bg-teal-100 text-teal-800'
                  : 'bg-surface-muted text-muted'
              }`}
            >
              {tabCounts.resolved}
            </span>
          </button>
        </nav>
      </div>

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
          icon={currentTab === 'resolved' ? 'check' : 'inbox'}
          title={
            currentTab === 'resolved'
              ? 'No resolved reports yet'
              : 'No active reports'
          }
          description={
            currentTab === 'resolved'
              ? 'When estate maintenance finishes repairing your reported or joined complaints, they will appear here.'
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
                showJoinButton={false}
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
