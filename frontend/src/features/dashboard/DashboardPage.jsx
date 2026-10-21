import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, ClipboardList, Clock, Activity, CheckCircle2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import { IssueCardSkeleton, EmptyState } from '../../components/ui';
import { IssueCard } from '../issues/components';
import { issuesService } from '../issues';
import { normalizeIssue } from '../../lib/normalizeIssue';
import { issuesApi } from '../../api';

function extractApiIssues(response) {
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.issues)) return data.issues;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data?.issues)) return data.data.issues;
  return null;
}

export default function DashboardPage() {
  const [filter, setFilter] = useState('All');

  const {
    data: queryResult,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['dashboard-issues'],
    queryFn: async () => {
      try {
        const res = await issuesApi.getAll();
        const list = extractApiIssues(res);
        if (list && list.length > 0) {
          return { items: list, isLive: true };
        }
      } catch {
        // Fall back gracefully to shared issuesService
      }
      const local = issuesService.getAllLocalIssues();
      return { items: local, isLive: false };
    },
    staleTime: 60 * 1000,
  });

  const rawItems = queryResult?.items ?? issuesService.getAllLocalIssues();
  const isLive = queryResult?.isLive ?? false;

  const issues = useMemo(() => {
    return rawItems.map((raw, idx) => normalizeIssue(raw, idx));
  }, [rawItems]);

  const stats = useMemo(() => {
    const pending = issues.filter(
      (i) => i.status === 'Reported' || i.status === 'Assigned'
    ).length;
    const inProgress = issues.filter(
      (i) => i.status === 'In Progress' || i.status === 'Reopened'
    ).length;
    const resolved = issues.filter(
      (i) => i.status === 'Resolved' || i.status === 'Closed'
    ).length;

    return [
      {
        label: 'Total Issues',
        value: issues.length,
        filterKey: 'All',
        icon: ClipboardList,
        color: 'text-brand-600',
      },
      {
        label: 'Pending',
        value: pending,
        filterKey: 'Reported',
        icon: Clock,
        color: 'text-amber-600',
      },
      {
        label: 'In Progress',
        value: inProgress,
        filterKey: 'In Progress',
        icon: Activity,
        color: 'text-indigo-600',
      },
      {
        label: 'Resolved',
        value: resolved,
        filterKey: 'Resolved',
        icon: CheckCircle2,
        color: 'text-teal-700',
      },
    ];
  }, [issues]);

  const statusCounts = useMemo(() => {
    return {
      All: issues.length,
      Reported: issues.filter((i) => i.status === 'Reported').length,
      Assigned: issues.filter((i) => i.status === 'Assigned').length,
      'In Progress': issues.filter((i) => i.status === 'In Progress').length,
      Resolved: issues.filter(
        (i) => i.status === 'Resolved' || i.status === 'Closed'
      ).length,
    };
  }, [issues]);

  const filteredIssues = useMemo(() => {
    if (filter === 'All') return issues;
    if (filter === 'Resolved') {
      return issues.filter((i) => i.status === 'Resolved' || i.status === 'Closed');
    }
    return issues.filter((issue) => issue.status === filter);
  }, [issues, filter]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-semibold tracking-wider uppercase text-brand-600">
          Authority Overview
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink">
          Authority Dashboard
        </h1>
        <p className="mt-2 text-muted">
          Monitor campus issues, KPI metrics, and track resolution workflows across all departments.
        </p>
      </div>

      {/* 4 KPI Cards with quick-filter clickability */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isActive = filter === stat.filterKey;
          return (
            <div
              key={stat.label}
              onClick={() => setFilter(stat.filterKey)}
              className="cursor-pointer transition hover:scale-[1.01]"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setFilter(stat.filterKey);
              }}
            >
              <Card
                className={`transition-all duration-150 ${
                  isActive
                    ? 'ring-2 ring-brand-500 border-brand-500 shadow-md'
                    : 'hover:shadow-card'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted">{stat.label}</p>
                  <Icon size={18} className={stat.color} aria-hidden="true" />
                </div>
                <p className="mt-3 text-3xl font-bold text-ink">
                  {stat.value}
                </p>
              </Card>
            </div>
          );
        })}
      </div>

      <Card
        title="Campus Facility Issues"
        description="Review reports, assign maintenance teams, and verify resolutions using the shared issue card system."
      >
        {/* Status Filter Tabs & Live API Indicator */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div className="flex flex-wrap gap-2">
            {['All', 'Reported', 'Assigned', 'In Progress', 'Resolved'].map(
              (status) => {
                const count = statusCounts[status] ?? 0;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFilter(status)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                      filter === status
                        ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                        : 'border-line-strong bg-white text-muted hover:bg-brand-50 hover:text-ink'
                    }`}
                  >
                    {status} ({count})
                  </button>
                );
              }
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">
              {isLive ? 'Connected to live API' : 'Using shared mock dataset'}
            </span>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh dashboard issues"
              className="rounded-lg p-1.5 text-muted hover:bg-brand-50 hover:text-brand-600 transition"
              aria-label="Refresh dashboard data"
            >
              <RefreshCw size={14} className={isFetching ? 'animate-spin text-brand-600' : ''} />
            </button>
          </div>
        </div>

        {/* Filtered Issues List using shared IssueCard */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <IssueCardSkeleton />
            <IssueCardSkeleton />
            <IssueCardSkeleton />
            <IssueCardSkeleton />
          </div>
        ) : filteredIssues.length === 0 ? (
          <EmptyState
            title={`No ${filter} issues`}
            description={`There are currently no campus maintenance issues marked as ${filter}.`}
            actionLabel="View all issues"
            onAction={() => setFilter('All')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                variant="admin"
                showJoinButton={false}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
