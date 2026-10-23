import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, ClipboardList, Clock, Activity, CheckCircle2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import PriorityBadge from '../../components/ui/PriorityBadge';
import EmptyState from '../../components/ui/EmptyState';
import { issuesApi } from '../../api';

const defaultSampleIssues = [
  {
    id: 'sample-1',
    title: 'Water leaking near Block A washroom',
    location: 'Block A · 2nd Floor',
    status: 'In Progress',
    priority: 'High',
    team: 'Maintenance',
  },
  {
    id: 'sample-2',
    title: 'Wi-Fi unavailable in the library',
    location: 'Central Library · Ground Floor',
    status: 'Assigned',
    priority: 'Medium',
    team: 'IT Support',
  },
  {
    id: 'sample-3',
    title: 'Broken lights in the corridor',
    location: 'Block B · 1st Floor',
    status: 'Reported',
    priority: 'Low',
    team: 'Electrical',
  },
  {
    id: 'sample-4',
    title: 'Damaged classroom bench',
    location: 'Room 204 · Block C',
    status: 'Resolved',
    priority: 'Medium',
    team: 'Facilities',
  },
];

function normalizeIssues(response) {
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
    data: apiIssuesData,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['dashboard-issues'],
    queryFn: async () => {
      try {
        const res = await issuesApi.getAll();
        const list = normalizeIssues(res);
        return list && list.length > 0 ? list : null;
      } catch {
        return null;
      }
    },
    staleTime: 60 * 1000,
  });

  const isSampleData = !apiIssuesData || apiIssuesData.length === 0;

  const issues = useMemo(() => {
    if (isSampleData) {
      return defaultSampleIssues;
    }
    return apiIssuesData.map((issue, index) => ({
      id: issue._id ?? issue.id ?? index,
      title: issue.title ?? issue.description ?? 'Untitled issue',
      location:
        issue.locationText ??
        issue.location ??
        issue.building?.name ??
        'Campus Location',
      status: issue.status ?? 'Reported',
      priority: issue.priorityBand ?? issue.priority ?? 'Medium',
      team:
        issue.assignedTeam?.name ??
        issue.team?.name ??
        issue.team ??
        'Maintenance Team',
    }));
  }, [apiIssuesData, isSampleData]);

  const stats = useMemo(() => {
    if (!isSampleData) {
      const pending = issues.filter(
        (i) => i.status === 'Reported' || i.status === 'Assigned'
      ).length;
      const inProgress = issues.filter(
        (i) => i.status === 'In Progress'
      ).length;
      const resolved = issues.filter(
        (i) => i.status === 'Resolved' || i.status === 'Closed'
      ).length;

      return [
        { label: 'Total Issues', value: issues.length, filterKey: 'All', icon: ClipboardList, color: 'text-brand-600' },
        { label: 'Pending', value: pending, filterKey: 'Reported', icon: Clock, color: 'text-amber-600' },
        { label: 'In Progress', value: inProgress, filterKey: 'In Progress', icon: Activity, color: 'text-indigo-600' },
        { label: 'Resolved', value: resolved, filterKey: 'Resolved', icon: CheckCircle2, color: 'text-teal' },
      ];
    }

    return [
      { label: 'Total Issues', value: 24, filterKey: 'All', icon: ClipboardList, color: 'text-brand-600' },
      { label: 'Pending', value: 8, filterKey: 'Reported', icon: Clock, color: 'text-amber-600' },
      { label: 'In Progress', value: 10, filterKey: 'In Progress', icon: Activity, color: 'text-indigo-600' },
      { label: 'Resolved', value: 6, filterKey: 'Resolved', icon: CheckCircle2, color: 'text-teal' },
    ];
  }, [isSampleData, issues]);

  const statusCounts = useMemo(() => {
    return {
      All: issues.length,
      Reported: issues.filter((i) => i.status === 'Reported').length,
      Assigned: issues.filter((i) => i.status === 'Assigned').length,
      'In Progress': issues.filter((i) => i.status === 'In Progress').length,
      Resolved: issues.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length,
    };
  }, [issues]);

  const filteredIssues = useMemo(() => {
    if (filter === 'All') return issues;
    return issues.filter((issue) => issue.status === filter);
  }, [issues, filter]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-semibold tracking-wider uppercase text-brand-600">
          Authority Overview
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink">
          Dashboard
        </h1>
        <p className="mt-2 text-muted">
          Monitor campus issues, KPI metrics, and track maintenance progress.
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
        title="Recent Campus Issues"
        description="Review reported problems and their current status."
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
              {isSampleData ? 'Showing preview sample data' : 'Connected to live API'}
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

        {/* Filtered Issues List */}
        {filteredIssues.length === 0 ? (
          <EmptyState
            title={`No ${filter} issues`}
            description={`There are currently no campus maintenance issues marked as ${filter}.`}
            actionLabel="View all issues"
            onAction={() => setFilter('All')}
          />
        ) : (
          <div className="space-y-3">
            {filteredIssues.map((issue) => (
              <article
                key={issue.id}
                className="flex flex-col gap-3 rounded-xl border border-line bg-white p-4 transition-shadow hover:shadow-card sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-ink text-base">
                    {issue.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {issue.location}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Assigned team: <span className="font-medium text-ink">{issue.team}</span>
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <StatusBadge status={issue.status} />
                  <PriorityBadge priority={issue.priority} />
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
