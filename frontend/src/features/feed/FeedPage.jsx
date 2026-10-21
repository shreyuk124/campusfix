// features/feed/FeedPage.jsx - Campus Public Issue Feed conforming to DESIGN.md §478-480
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
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
    priority: searchParams.get('priority') || 'all',
    sort: searchParams.get('sort') || 'newest',
  });

  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const limit = 10;
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
    if (newFilters.priority !== 'all') params.set('priority', newFilters.priority);
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
    let ignore = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await issuesService.getIssues({
          page,
          limit,
          ...filters,
          simulateDelay: 300,
        });
        if (!ignore) {
          setData(result);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Error fetching feed issues:', err);
          setError(err.message || 'Failed to load feed');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [page, limit, filters]);

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
          message: `Added your vote to ${issue.referenceId}. Authorities will see increased student priority.`,
        });
      } else {
        addToast({
          type: 'info',
          title: 'Vote removed',
          message: `Removed your vote from ${issue.referenceId}.`,
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
      {/* Top Hero Banner */}
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-7 shadow-card">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-700 mb-2">
            <Sparkles size={13} className="text-brand-500" />
            <span>Campus Issue Transparency</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Campus Issue Feed
          </h1>
          <p className="mt-1 text-sm sm:text-base text-muted max-w-2xl">
            Browse campus maintenance reports, view live progress, and vote on issues that affect your daily classes or hostel living.
          </p>
        </div>

        {/* Quick Stats Strip */}
        <div className="mt-6 pt-5 border-t border-line grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3 rounded-xl bg-surface-muted border border-line/60">
            <span className="text-xs text-muted font-medium">Total Tracked</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold text-ink">
                {data.total || 8}
              </span>
              <span className="text-xs text-brand-600 font-medium">reports</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/60">
            <span className="text-xs text-teal-800 font-medium">Resolved This Week</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold text-teal-900">18</span>
              <CheckCircle2 size={16} className="text-teal-600" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-muted border border-line/60">
            <span className="text-xs text-muted font-medium">In Active Progress</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold text-indigo-700">4</span>
              <Clock size={16} className="text-indigo-500" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-200/60">
            <span className="text-xs text-orange-800 font-medium">Critical Hazards</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold text-danger">2</span>
              <AlertTriangle size={16} className="text-danger" />
            </div>
          </div>
        </div>
      </div>

      {/* FilterBar (Search, Building, Category, Status, Priority, Sort) */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        showStatusFilter={true}
      />

      {/* Feed Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <IssueCardSkeleton />
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
        <div className="space-y-5">
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

          {/* Cards Grid: 1 col on mobile, 2 cols on tablet/desktop */}
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
                    className={`h-9 w-9 rounded-lg text-xs font-semibold transition-colors ${
                      p === page
                        ? 'bg-brand-500 text-white shadow-xs'
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
