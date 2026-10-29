import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  RefreshCw,
  ClipboardList,
  Clock,
  Activity,
  CheckCircle2,
  Shield,
  Layers,
  TrendingUp,
  AlertTriangle,
  Building2,
  Tag,
  Wrench,
  Inbox,
  ExternalLink,
  ChevronRight,
  X,
  Users,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import issuesService from '../issues/issuesService';

export default function DashboardPage() {
  const [filter, setFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [buildingFilter, setBuildingFilter] = useState('all');

  // Load live issues directly from issuesService with instant local initialData
  const {
    data: allIssues = [],
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['admin-dashboard-issues'],
    queryFn: async () => {
      try {
        const res = await issuesService.getIssues({ limit: 100, simulateDelay: 100 });
        return res?.issues && res.issues.length > 0
          ? res.issues
          : issuesService.getAllLocalIssues();
      } catch (err) {
        console.warn('Dashboard live sync note:', err.message);
        return issuesService.getAllLocalIssues();
      }
    },
    initialData: () => issuesService.getAllLocalIssues(),
    staleTime: 10 * 1000,
  });

  // Accurate dynamic KPI metrics computed from single source of truth
  const stats = useMemo(() => {
    const total = allIssues.length;
    const triage = allIssues.filter((i) => i.status === 'Reported').length;
    const inProgress = allIssues.filter(
      (i) => i.status === 'In Progress' || i.status === 'Assigned'
    ).length;
    const resolved = allIssues.filter((i) => i.status === 'Resolved').length;
    const totalActive = allIssues.filter((i) => i.status !== 'Resolved').length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const hotspotsCount = allIssues.filter(
      (i) => Boolean(i.isHotspot) || (i.affectedCount || 0) >= 10
    ).length;

    return {
      total,
      triage,
      inProgress,
      resolved,
      totalActive,
      resolutionRate,
      hotspotsCount,
    };
  }, [allIssues]);

  // Primary 4 KPI cards aligned 1:1 with Operations & Triage
  const kpiCards = useMemo(() => [
    {
      label: 'Total Issues',
      value: stats.total,
      subtext: 'all campus tickets',
      filterKey: 'All',
      icon: ClipboardList,
      color: 'text-brand-600',
      activeRing: 'ring-brand-500 border-brand-500',
      badgeColor: 'bg-brand-50 text-brand-700',
    },
    {
      label: 'Awaiting Triage',
      value: stats.triage,
      subtext: 'needs assignment',
      filterKey: 'Reported',
      icon: Clock,
      color: 'text-amber-600',
      activeRing: 'ring-amber-400 border-amber-400',
      badgeColor: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      subtext: 'active repairs',
      filterKey: 'In Progress',
      icon: Activity,
      color: 'text-indigo-600',
      activeRing: 'ring-indigo-400 border-indigo-400',
      badgeColor: 'bg-indigo-50 text-indigo-700',
    },
    {
      label: 'Resolved',
      value: stats.resolved,
      subtext: 'completed',
      filterKey: 'Resolved',
      icon: CheckCircle2,
      color: 'text-teal-600',
      activeRing: 'ring-teal-400 border-teal-400',
      badgeColor: 'bg-teal-50 text-teal-700',
    },
  ], [stats]);

  // Category breakdown calculation
  const categoryStats = useMemo(() => {
    const map = {};
    allIssues.forEach((issue) => {
      const cat = issue.category || 'General';
      if (!map[cat]) map[cat] = { name: cat, count: 0 };
      map[cat].count += 1;
    });
    return Object.values(map)
      .sort((a, b) => b.count - a.count)
      .map((item) => ({
        ...item,
        percentage: stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0,
      }));
  }, [allIssues, stats.total]);

  // Building hotspot breakdown calculation
  const buildingStats = useMemo(() => {
    const map = {};
    allIssues.forEach((issue) => {
      const b = issue.building || 'General Campus';
      if (!map[b]) map[b] = { name: b, count: 0 };
      map[b].count += 1;
    });
    return Object.values(map)
      .sort((a, b) => b.count - a.count)
      .map((item) => ({
        ...item,
        percentage: stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0,
      }));
  }, [allIssues, stats.total]);

  // Maintenance Team dispatch allocation
  const teamStats = useMemo(() => {
    const map = {};
    allIssues.forEach((issue) => {
      const team = issue.assignedTeam || 'Unassigned';
      if (!map[team]) map[team] = { name: team, count: 0, active: 0, resolved: 0 };
      map[team].count += 1;
      if (issue.status === 'Resolved') {
        map[team].resolved += 1;
      } else {
        map[team].active += 1;
      }
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [allIssues]);

  // Filtered issues list
  const filteredIssues = useMemo(() => {
    return allIssues.filter((issue) => {
      // 1. Status Filter
      if (filter === 'Reported' && issue.status !== 'Reported') return false;
      if (filter === 'In Progress' && issue.status !== 'In Progress' && issue.status !== 'Assigned') return false;
      if (filter === 'Resolved' && issue.status !== 'Resolved') return false;
      if (filter === 'Assigned' && issue.status !== 'Assigned') return false;

      // 2. Category Filter
      if (categoryFilter !== 'all' && issue.category !== categoryFilter) return false;

      // 3. Building Filter
      if (buildingFilter !== 'all' && issue.building !== buildingFilter) return false;

      return true;
    });
  }, [allIssues, filter, categoryFilter, buildingFilter]);

  const resetAllFilters = () => {
    setFilter('All');
    setCategoryFilter('all');
    setBuildingFilter('all');
  };

  const hasExtraFilters = categoryFilter !== 'all' || buildingFilter !== 'all';

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-card">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 px-2.5 py-0.5 text-xs font-semibold text-brand-700 mb-2">
            <Shield size={13} className="text-brand-600" />
            <span>Authority Operational Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Analytics Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted">
            Cross-campus operational overview, live triage workload, and real-time maintenance KPIs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Sync latest live issues"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-white px-3 py-2 text-xs font-medium text-ink hover:bg-brand-50 hover:border-brand-300 transition"
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin text-brand-600' : 'text-muted'} />
            <span>{isFetching ? 'Syncing...' : 'Sync Data'}</span>
          </button>

          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition"
          >
            <Shield size={13} />
            <span>Operations & Triage</span>
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>

      {/* 4 Primary KPI Cards (100% matched with Operations & Triage) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpiCards.map((stat) => {
          const Icon = stat.icon;
          const isActive =
            filter === stat.filterKey ||
            (stat.filterKey === 'in-progress-group' && filter === 'In Progress') ||
            (stat.filterKey === 'resolved-group' && filter === 'Resolved');
          return (
            <div
              key={stat.label}
              onClick={() => setFilter(stat.filterKey)}
              className={`rounded-xl border p-4 sm:p-5 shadow-card cursor-pointer transition-all hover:scale-[1.01] ${
                isActive
                  ? `${stat.activeRing} ring-2 bg-brand-50/20`
                  : 'border-line bg-surface hover:border-brand-300'
              }`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setFilter(stat.filterKey);
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted">{stat.label}</span>
                <Icon size={16} className={stat.color} aria-hidden="true" />
              </div>
              <div className="mt-2.5 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold text-ink font-mono">
                  {stat.value}
                </span>
                <span className="text-xs font-medium text-muted">{stat.subtext}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Metrics Strip: Resolution Rate & Operational Health */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Resolution Rate */}
        <Card className="flex flex-col justify-between p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Overall Resolution Rate</span>
            <TrendingUp size={16} className="text-teal-600" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-ink">{stats.resolutionRate}%</span>
              <span className="text-xs text-muted">
                {stats.resolved} of {stats.total} tickets resolved
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-teal-600 transition-all duration-500"
                style={{ width: `${stats.resolutionRate}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Active Campus Workload */}
        <Card className="flex flex-col justify-between p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Active Open Tickets</span>
            <Layers size={16} className="text-brand-600" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-ink">{stats.totalActive}</span>
              <span className="text-xs text-brand-700 font-medium">in queue & repairs</span>
            </div>
            <p className="mt-2 text-xs text-muted">
              {stats.triage} awaiting initial triage · {stats.inProgress} under active work
            </p>
          </div>
        </Card>

        {/* Community Impact / Hotspots */}
        <Card className="flex flex-col justify-between p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Community Impact Tickets</span>
            <Users size={16} className="text-amber-600" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-amber-700">{stats.hotspotsCount}</span>
              <span className="text-xs text-amber-800 font-medium">high student impact</span>
            </div>
            <p className="mt-2 text-xs text-muted">
              Issues flagged with 10+ student confirmations (+1 reports)
            </p>
          </div>
        </Card>
      </div>

      {/* Analytics Breakdown: Categories & Campus Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card
          title="Issues by Category"
          description="Click any category to filter the campus issues list below."
        >
          <div className="space-y-3 pt-1">
            {categoryStats.map((cat) => {
              const isCatActive = categoryFilter === cat.name;
              return (
                <div
                  key={cat.name}
                  onClick={() => setCategoryFilter(isCatActive ? 'all' : cat.name)}
                  className={`group rounded-lg p-2.5 transition cursor-pointer border ${
                    isCatActive
                      ? 'border-brand-500 bg-brand-50/40'
                      : 'border-transparent hover:bg-slate-50'
                  }`}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink group-hover:text-brand-600 transition-colors flex items-center gap-1.5">
                      <Tag size={13} className="text-muted group-hover:text-brand-600" />
                      <span>{cat.name}</span>
                    </span>
                    <span className="font-mono text-muted">
                      <strong className="text-ink">{cat.count}</strong> issue{cat.count !== 1 ? 's' : ''} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all duration-300"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Building & Zone Breakdown */}
        <Card
          title="Campus Building & Hotspots"
          description="Click any building to isolate maintenance tickets for that location."
        >
          <div className="space-y-3 pt-1">
            {buildingStats.map((b) => {
              const isBldActive = buildingFilter === b.name;
              return (
                <div
                  key={b.name}
                  onClick={() => setBuildingFilter(isBldActive ? 'all' : b.name)}
                  className={`group rounded-lg p-2.5 transition cursor-pointer border ${
                    isBldActive
                      ? 'border-brand-500 bg-brand-50/40'
                      : 'border-transparent hover:bg-slate-50'
                  }`}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink group-hover:text-brand-600 transition-colors flex items-center gap-1.5">
                      <Building2 size={13} className="text-muted group-hover:text-brand-600" />
                      <span>{b.name}</span>
                    </span>
                    <span className="font-mono text-muted">
                      <strong className="text-ink">{b.count}</strong> issue{b.count !== 1 ? 's' : ''} ({b.percentage}%)
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${b.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Maintenance Teams Workload */}
      <Card
        title="Maintenance Teams Dispatch & Workload"
        description="Assigned campus maintenance crews and resolution status."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {teamStats.map((t) => (
            <div
              key={t.name}
              className="rounded-xl border border-line bg-surface p-3.5 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-ink">{t.name}</h4>
                  <p className="text-[11px] text-muted mt-0.5">
                    {t.count} total ticket{t.count !== 1 ? 's' : ''}
                  </p>
                </div>
                <Wrench size={14} className="text-muted shrink-0 mt-0.5" />
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-2 text-xs font-mono">
                <span className="text-indigo-600 font-medium">
                  {t.active} active
                </span>
                <span className="text-teal-700 font-medium">
                  {t.resolved} resolved
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Detailed Issues Stream matching Operations & Triage */}
      <Card
        title="Live Campus Issues Stream"
        description="Verified issue records synchronized with campus infrastructure data."
      >
        {/* Status Filter Tabs & Active Filter Controls */}
        <div className="mb-4 space-y-3 border-b border-line pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'All', key: 'All', count: stats.total },
                { label: 'Reported', key: 'Reported', count: stats.triage },
                { label: 'Assigned', key: 'Assigned', count: allIssues.filter((i) => i.status === 'Assigned').length },
                { label: 'In Progress', key: 'In Progress', count: allIssues.filter((i) => i.status === 'In Progress').length },
                { label: 'Resolved', key: 'Resolved', count: stats.resolved },
              ].map((tab) => {
                const isTabActive = filter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilter(tab.key)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      isTabActive
                        ? 'border-brand-600 bg-brand-600 text-white shadow-xs'
                        : 'border-line-strong bg-white text-muted hover:bg-brand-50 hover:text-ink'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-muted">
              Showing <strong className="text-ink">{filteredIssues.length}</strong> of {stats.total} issues
            </div>
          </div>

          {/* Active Specific Filters (Category or Building) */}
          {hasExtraFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-medium text-muted">Filtered by:</span>
              {categoryFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 border border-brand-200 px-2 py-0.5 text-xs font-semibold text-brand-700">
                  Category: {categoryFilter}
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('all')}
                    className="hover:text-brand-900"
                    aria-label="Remove category filter"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {buildingFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 border border-brand-200 px-2 py-0.5 text-xs font-semibold text-brand-700">
                  Building: {buildingFilter}
                  <button
                    type="button"
                    onClick={() => setBuildingFilter('all')}
                    className="hover:text-brand-900"
                    aria-label="Remove building filter"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs font-semibold text-brand-600 hover:text-brand-800 hover:underline ml-1"
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>

        {/* Filtered Issues Cards */}
        {filteredIssues.length === 0 ? (
          <EmptyState
            title="No matching campus issues"
            description="No issues match the selected status, category, or building filters."
            actionLabel="Reset filters"
            onAction={resetAllFilters}
          />
        ) : (
          <div className="space-y-3">
            {filteredIssues.map((issue) => (
              <article
                key={issue.id}
                className="flex flex-col gap-3 rounded-xl border border-line bg-white p-4 transition hover:border-brand-300 hover:shadow-card sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                      {issue.referenceId || `CF-${issue.id}`}
                    </span>
                    <span className="font-medium text-muted bg-slate-100 px-2 py-0.5 rounded">
                      {issue.category || 'General'}
                    </span>
                    {(issue.affectedCount || 0) > 1 && (
                      <span className="inline-flex items-center gap-1 text-slate-600 text-[11px] font-medium">
                        <Users size={12} />
                        <span>{issue.affectedCount} affected</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-ink text-base">
                    {issue.title}
                  </h3>

                  <p className="text-xs text-muted flex items-center gap-1.5">
                    <Building2 size={13} className="shrink-0 text-muted" />
                    <span>{issue.building ? `${issue.building} · ` : ''}{issue.location}</span>
                  </p>

                  <p className="text-xs text-muted">
                    Assigned: <span className="font-medium text-ink">{issue.assignedTeam || 'Unassigned'}</span>
                    {issue.assignedStaff ? ` (${issue.assignedStaff})` : ''}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col sm:flex-row items-start sm:items-center gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-line">
                  <StatusBadge status={issue.status} />
                  <Link
                    to={`/issues/${issue.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 hover:underline"
                  >
                    <span>Inspect</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
