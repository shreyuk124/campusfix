// features/feed/FeedPage.jsx - Campus Public Issue Feed conforming to DESIGN.md §478-480
// Minimalistic design without SLA or internal priority scoring
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  Users,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileText,
  Check,
  Settings,
} from 'lucide-react';
import { IssueCard, FilterBar } from '../issues/components';
import { IssueCardSkeleton, EmptyState, ErrorState, useToast } from '../../components/ui';
import issuesService from '../issues/issuesService';

export default function FeedPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();

  // State initialized from URL search params for seamless link sharing
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    building: searchParams.get('building') || 'all',
    category: searchParams.get('category') || 'all',
    status: searchParams.get('status') || 'all',
    sort: searchParams.get('sort') || 'newest',
  });

  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState({ issues: [], total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync state to URL params
  const updateUrlParams = useCallback((newFilters, newPage) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set('q', newFilters.search);
    if (newFilters.building !== 'all') params.set('building', newFilters.building);
    if (newFilters.category !== 'all') params.set('category', newFilters.category);
    if (newFilters.status !== 'all') params.set('status', newFilters.status);
    if (newFilters.sort !== 'newest') params.set('sort', newFilters.sort);
    if (newPage > 1) params.set('page', String(newPage));
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Fetch issues
  const fetchFeedIssues = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await issuesService.getIssues({
        page,
        limit,
        ...filters,
        simulateDelay: 300,
      });
      setData(result);
    } catch (err) {
      console.error('Error fetching feed issues:', err);
      setError(err.message || 'Failed to load feed');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => {
    fetchFeedIssues();
  }, [fetchFeedIssues]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to page 1 on filter change
    updateUrlParams(newFilters, 1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateUrlParams(filters, newPage);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Toggle Join "+1 I am affected too"
  const handleToggleJoin = async (issue) => {
    try {
      const updated = await issuesService.toggleJoinIssue(issue.id);
      setData((prev) => ({
        ...prev,
        issues: prev.issues.map((i) => (i.id === issue.id ? updated : i)),
      }));

      if (updated.hasJoined) {
        addToast({
          type: 'success',
          title: 'Marked as affected',
          message: `Added your response to ${issue.referenceId}. Authorities will see increased student priority.`,
        });
      } else {
        addToast({
          type: 'info',
          title: 'Vote removed',
          message: `Removed your response from ${issue.referenceId}.`,
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Action failed',
        message: 'Could not update your response. Please try again.',
      });
    }
  };

  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, data.total);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Hero Banner matching campus_feed_redesign.jpg */}
      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-7 shadow-xs">
        <div>
          {/* Blue Pill with Orange Checkmark Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white mb-2 shadow-xs">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-action-orange text-white">
              <Check size={9} strokeWidth={3.5} />
            </span>
            <span>Campus Issue Transparency</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-display">
            Campus Issue Feed
          </h1>
        </div>

        {/* 4 Solid Vibrant KPI Cards matching campus_feed_redesign.jpg with shimmer sheen on hover */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Total Tracked (Sky Blue) */}
          <div className="group/kpi relative overflow-hidden p-4 rounded-xl bg-[#0284C7] text-white flex items-center gap-3.5 shadow-xs hover:scale-[1.02] hover:shadow-md transition-all duration-200 cursor-default">
            <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/kpi:animate-shimmer" />
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white transition-transform duration-200 group-hover/kpi:scale-110">
              <FileText size={22} />
            </div>
            <div>
              <span className="text-xs text-white/90 font-medium block">Total Tracked</span>
              <span className="text-xl sm:text-2xl font-bold block leading-tight">
                {data.total || 39} reports
              </span>
            </div>
          </div>

          {/* 2. Resolved This Week (Emerald Green) */}
          <div className="group/kpi relative overflow-hidden p-4 rounded-xl bg-[#10B981] text-white flex items-center gap-3.5 shadow-xs hover:scale-[1.02] hover:shadow-md transition-all duration-200 cursor-default">
            <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/kpi:animate-shimmer" />
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white transition-transform duration-200 group-hover/kpi:scale-110">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <span className="text-xs text-white/90 font-medium block">Resolved This Week</span>
              <span className="text-xl sm:text-2xl font-bold block leading-tight">18</span>
            </div>
          </div>

          {/* 3. In Active Progress (Royal Blue) */}
          <div className="group/kpi relative overflow-hidden p-4 rounded-xl bg-[#2563EB] text-white flex items-center gap-3.5 shadow-xs hover:scale-[1.02] hover:shadow-md transition-all duration-200 cursor-default">
            <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/kpi:animate-shimmer" />
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white transition-transform duration-200 group-hover/kpi:scale-110">
              <Settings size={22} />
            </div>
            <div>
              <span className="text-xs text-white/90 font-medium block">In Active Progress</span>
              <span className="text-xl sm:text-2xl font-bold block leading-tight">4</span>
            </div>
          </div>

          {/* 4. Students Affected (Action Orange) */}
          <div className="group/kpi relative overflow-hidden p-4 rounded-xl bg-[#EA580C] text-white flex items-center gap-3.5 shadow-xs hover:scale-[1.02] hover:shadow-md transition-all duration-200 cursor-default">
            <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/kpi:animate-shimmer" />
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white transition-transform duration-200 group-hover/kpi:scale-110">
              <Users size={22} />
            </div>
            <div>
              <span className="text-xs text-white/90 font-medium block">Students Affected</span>
              <span className="text-xl sm:text-2xl font-bold block leading-tight">42</span>
            </div>
          </div>
        </div>
      </div>

      {/* FilterBar (Search, Building, Category, Status, Sort) */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        showStatusFilter={true}
      />

      {/* Feed Content */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          <IssueCardSkeleton />
          <IssueCardSkeleton />
          <IssueCardSkeleton />
        </div>
      ) : error ? (
        <ErrorState
          title="Could not load issue feed"
          message={error}
          onRetry={fetchFeedIssues}
        />
      ) : data.issues.length === 0 ? (
        <EmptyState
          icon="search"
          title="No campus issues found"
          description="We couldn't find any issues matching your search criteria. Try removing some filters or search for another building."
          actionLabel="Report a New Issue"
          onAction={() => (window.location.href = '/report')}
        />
      ) : (
        <div className="space-y-4">
          {/* Results Summary Count */}
          <div className="flex items-center justify-between text-xs text-muted px-1">
            <span>
              Showing <strong className="text-ink">{startIndex}–{endIndex}</strong> of{' '}
              <strong className="text-ink">{data.total}</strong> campus issues
            </span>
            <span className="hidden sm:inline">
              Student reporter names are kept private
            </span>
          </div>

          {/* Cards Stream with Staggered Cascading Entrance */}
          <div className="flex flex-col gap-4">
            {data.issues.map((issue, index) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                variant="default"
                onToggleJoin={handleToggleJoin}
                showJoinButton={true}
                className="animate-feed-card"
                style={{ animationDelay: `${index * 55}ms` }}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {data.totalPages > 1 && (
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-line">
              <div className="text-xs text-muted">
                Page <strong className="text-ink">{page}</strong> of{' '}
                <strong className="text-ink">{data.totalPages}</strong>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 h-9 px-3 rounded-lg border border-line-strong bg-surface text-xs font-medium text-ink transition-colors hover:bg-brand-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>

                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePageChange(p)}
                    className={`h-9 w-9 rounded-lg text-xs font-medium transition-colors ${
                      page === p
                        ? 'bg-brand-500 font-bold text-white shadow-xs'
                        : 'border border-line-strong bg-surface text-ink hover:bg-brand-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= data.totalPages}
                  className="inline-flex items-center gap-1 h-9 px-3 rounded-lg border border-line-strong bg-surface text-xs font-medium text-ink transition-colors hover:bg-brand-50 disabled:opacity-40 disabled:cursor-not-allowed"
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
