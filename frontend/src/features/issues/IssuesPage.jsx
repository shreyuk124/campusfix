import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Users, RefreshCw } from 'lucide-react';
import { issuesApi } from '../../api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import PriorityBadge from '../../components/ui/PriorityBadge';
import EmptyState from '../../components/ui/EmptyState';

const sampleIssues = [
  {
    id: 'sample-1',
    title: 'Water leaking near Block A washroom',
    location: 'Block A · 2nd Floor',
    status: 'In Progress',
    priority: 'High',
    team: 'Maintenance',
    reportCount: 5,
  },
  {
    id: 'sample-2',
    title: 'Wi-Fi unavailable in the library',
    location: 'Central Library · Ground Floor',
    status: 'Assigned',
    priority: 'Medium',
    team: 'IT Support',
    reportCount: 8,
  },
  {
    id: 'sample-3',
    title: 'Broken lights in the corridor',
    location: 'Block B · 1st Floor',
    status: 'Reported',
    priority: 'Low',
    team: 'Electrical',
    reportCount: 2,
  },
  {
    id: 'sample-4',
    title: 'Damaged classroom bench',
    location: 'Room 204 · Block C',
    status: 'Resolved',
    priority: 'Medium',
    team: 'Facilities',
    reportCount: 1,
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

function mapIssue(issue, index) {
  return {
    id: issue._id ?? issue.id ?? `issue-${index}`,
    title: issue.title ?? issue.description ?? 'Untitled issue',
    location:
      issue.locationText ??
      issue.location ??
      issue.building?.name ??
      'Location unavailable',
    status: issue.status ?? 'Reported',
    priority: issue.priorityBand ?? issue.priority ?? 'Medium',
    team:
      issue.assignedTeam?.name ??
      issue.team?.name ??
      issue.team ??
      'Unassigned',
    reportCount: issue.reportCount ?? 1,
  };
}

export default function IssuesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');

  const {
    data,
    isLoading: loading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['issues', status, priority],
    queryFn: async () => {
      try {
        const response = await issuesApi.getAll({
          status: status !== 'All' ? status : undefined,
          priority: priority !== 'All' ? priority : undefined,
        });

        const result = normalizeIssues(response);

        if (result && result.length > 0) {
          return {
            items: result.map(mapIssue),
            isSample: false,
          };
        }
      } catch {
        // Fall back gracefully to sample issues if API is not running
      }

      return {
        items: sampleIssues,
        isSample: true,
      };
    },
    staleTime: 60 * 1000,
  });

  const issues = data?.items ?? sampleIssues;
  const usingSampleData = data?.isSample ?? true;

  function clearFilters() {
    setSearch('');
    setStatus('All');
    setPriority('All');
  }

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        issue.title.toLowerCase().includes(query) ||
        issue.location.toLowerCase().includes(query) ||
        issue.team.toLowerCase().includes(query);

      const matchesStatus = status === 'All' || issue.status === status;
      const matchesPriority = priority === 'All' || issue.priority === priority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [issues, search, status, priority]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-semibold tracking-wider uppercase text-brand-600">
          Issue Management
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink">
          Campus Issues
        </h1>
        <p className="mt-2 text-muted">
          Search, filter and review reported campus problems.
        </p>
      </div>

      <Card title="Find Issues" description="Filter by title, location, status or priority.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor="issue-search" className="block text-sm font-medium text-ink">
              Search
            </label>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                id="issue-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, building or team..."
                className="w-full rounded-md border border-line-strong bg-white pl-10 pr-3 py-2.5 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="issue-status" className="block text-sm font-medium text-ink">
              Status
            </label>
            <select
              id="issue-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-11 rounded-md border border-line-strong bg-white px-3 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="All">All statuses</option>
              <option value="Reported">Reported</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
              <option value="Reopened">Reopened</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="issue-priority" className="block text-sm font-medium text-ink">
              Priority
            </label>
            <select
              id="issue-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full h-11 rounded-md border border-line-strong bg-white px-3 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="All">All priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-line">
          <div className="flex flex-wrap gap-2.5">
            <Button type="button" onClick={() => refetch()} loading={loading}>
              <RefreshCw size={15} aria-hidden="true" />
              Refresh
            </Button>
            <Button type="button" variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>

          <span className="text-xs text-muted">
            {usingSampleData ? 'Using sample preview data' : 'Connected to live API'}
          </span>
        </div>
      </Card>

      {isError && (
        <div
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
        >
          Could not connect to live API. Showing sample issues instead.
        </div>
      )}

      <Card
        title={`Issues (${filteredIssues.length})`}
        description="Currently matching campus issue reports."
      >
        {filteredIssues.length === 0 ? (
          <EmptyState
            title="No matching issues found"
            description="Try adjusting your search keywords or resetting your status and priority filters."
            actionLabel="Reset filters"
            onAction={clearFilters}
          />
        ) : (
          <div className="space-y-3">
            {filteredIssues.map((issue) => (
              <article
                key={issue.id}
                className="flex flex-col gap-4 rounded-xl border border-line bg-white p-4 transition hover:shadow-card sm:flex-row sm:items-start sm:justify-between sm:p-5"
              >
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-ink text-base leading-snug">
                    {issue.title}
                  </h2>

                  <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                    <MapPin size={16} className="shrink-0 text-muted" aria-hidden="true" />
                    <span>{issue.location}</span>
                  </p>

                  <p className="mt-1.5 text-sm text-muted">
                    Assigned team:{' '}
                    <span className="font-medium text-ink">{issue.team}</span>
                  </p>

                  {issue.reportCount !== undefined && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                      <Users size={14} aria-hidden="true" />
                      <span>
                        {issue.reportCount} report{issue.reportCount === 1 ? '' : 's'}
                      </span>
                    </p>
                  )}
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
