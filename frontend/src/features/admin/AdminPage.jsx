// features/admin/AdminPage.jsx - Authority Dashboard
// Clean minimalist dashboard without SLA / internal penalty clutter
import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Layers,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  UserCheck,
  RotateCcw,
  Wrench,
  Inbox,
} from 'lucide-react';
import { IssueCard, FilterBar } from '../issues/components';
import { Button, Modal, useToast, EmptyState, IssueCardSkeleton } from '../../components/ui';
import { useAuth } from '../auth/useAuth';
import issuesService from '../issues/issuesService';
import { CAMPUS_BUILDINGS, CATEGORIES } from '../../lib/constants';

export default function AdminPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [issues, setIssues] = useState([]);
  const [allLocalIssues, setAllLocalIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('triage'); // 'triage' | 'all'
  const [filters, setFilters] = useState({
    search: '',
    building: 'all',
    category: 'all',
    status: 'all',
    sort: 'newest',
  });

  // Quick Assign Modal
  const [assignModalIssue, setAssignModalIssue] = useState(null);
  const [assignedTeam, setAssignedTeam] = useState('Plumbing & Water Services');
  const [assignedStaff, setAssignedStaff] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchAdminIssues = async () => {
    setIsLoading(true);
    try {
      const all = issuesService.getAllLocalIssues();
      setAllLocalIssues(all);

      const res = await issuesService.getIssues({
        page: 1,
        limit: 50,
        status: activeTab === 'triage' ? 'Reported' : filters.status,
        ...filters,
        simulateDelay: 200,
      });
      setIssues(res.issues);
      // Ensure local issues are refreshed in case syncWithBackend updated them
      setAllLocalIssues(issuesService.getAllLocalIssues());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminIssues();
  }, [activeTab, filters]);

  // Dynamic live metric calculations
  const stats = useMemo(() => {
    const triage = allLocalIssues.filter((i) => i.status === 'Reported').length;
    const inProgress = allLocalIssues.filter((i) => i.status === 'In Progress' || i.status === 'Assigned').length;
    const resolved = allLocalIssues.filter((i) => i.status === 'Resolved').length;
    const totalActive = allLocalIssues.filter((i) => i.status !== 'Resolved').length;
    return { triage, inProgress, resolved, totalActive };
  }, [allLocalIssues]);

  const handleQuickAction = (action, issue) => {
    if (action === 'assign') {
      setAssignModalIssue(issue);
      setAssignedTeam(issue.assignedTeam !== 'Unassigned' ? issue.assignedTeam : 'Plumbing & Water Services');
      setAssignedStaff(issue.assignedStaff !== 'Unassigned' ? issue.assignedStaff : '');
    }
  };

  const handleConfirmAssignment = async () => {
    if (!assignModalIssue) return;
    setIsAssigning(true);
    try {
      await issuesService.assignIssue(
        assignModalIssue.id,
        assignedTeam,
        assignedStaff || 'Assigned Staff',
        );
      addToast({
        type: 'success',
        title: 'Work Order Assigned',
        message: `${assignModalIssue.referenceId} assigned to ${assignedTeam}.`,
      });
      setAssignModalIssue(null);
      fetchAdminIssues();
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to assign issue.' });
    } finally {
      setIsAssigning(false);
    }
  };

  const displayName = user?.name ? `${user.name}'s Management Dashboard` : 'Authority Management Dashboard';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-card">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 px-2.5 py-0.5 text-xs font-semibold text-brand-700 mb-2">
            <Shield size={13} className="text-brand-600" />
            <span>Estate & Infrastructure Authority Portal</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            {displayName}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Triage new campus reports, dispatch maintenance crews, and track resolution progress.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchAdminIssues}
          disabled={isLoading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs"
        >
          <RotateCcw size={13} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh Queue</span>
        </Button>
      </div>

      {/* Clean Operational KPI Strip (Zero SLA clutter) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Triage Queue */}
        <div
          onClick={() => setActiveTab('triage')}
          className={`rounded-xl border p-4 shadow-card cursor-pointer transition-all ${
            activeTab === 'triage'
              ? 'border-amber-400 bg-amber-50/50 ring-2 ring-amber-200'
              : 'border-line bg-surface hover:border-amber-300'
          }`}
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Awaiting Triage</span>
            <Inbox size={15} className="text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-amber-600 font-mono">{stats.triage}</span>
            <span className="text-xs text-amber-700 font-medium">needs assignment</span>
          </div>
        </div>

        {/* 2. In Progress */}
        <div
          onClick={() => {
            setActiveTab('all');
            setFilters((f) => ({ ...f, status: 'in-progress-group' }));
          }}
          className="rounded-xl border border-line bg-surface p-4 shadow-card cursor-pointer hover:border-indigo-300 transition-all"
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">In Progress</span>
            <Wrench size={15} className="text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-indigo-600 font-mono">{stats.inProgress}</span>
            <span className="text-xs text-indigo-700 font-medium">active repairs</span>
          </div>
        </div>

        {/* 3. Resolved */}
        <div
          onClick={() => {
            setActiveTab('all');
            setFilters((f) => ({ ...f, status: 'Resolved' }));
          }}
          className="rounded-xl border border-line bg-surface p-4 shadow-card cursor-pointer hover:border-teal-300 transition-all"
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Resolved</span>
            <CheckCircle2 size={15} className="text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-teal-700 font-mono">{stats.resolved}</span>
            <span className="text-xs text-teal-700 font-medium">completed</span>
          </div>
        </div>

        {/* 4. Total Active Workload */}
        <div
          onClick={() => {
            setActiveTab('all');
            setFilters((f) => ({ ...f, status: 'all' }));
          }}
          className="rounded-xl border border-line bg-surface p-4 shadow-card cursor-pointer hover:border-brand-300 transition-all"
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Total Active</span>
            <Layers size={15} className="text-brand-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-ink font-mono">{stats.totalActive}</span>
            <span className="text-xs text-brand-600 font-medium">open tickets</span>
          </div>
        </div>
      </div>

      {/* Tabs: Triage Queue vs All Issues */}
      <div className="flex items-center justify-between border-b border-line">
        <div className="flex space-x-6">
          <button
            type="button"
            onClick={() => setActiveTab('triage')}
            className={`py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'triage'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            Triage Queue ({stats.triage})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            All Campus Issues ({allLocalIssues.length})
          </button>
        </div>
      </div>

      {/* FilterBar */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        showStatusFilter={activeTab === 'all'}
      />

      {/* Issues Count Bar */}
      {issues.length > 0 && (
        <div className="flex items-center justify-end text-xs text-muted px-1">
          <span>
            Showing <strong className="text-ink">{issues.length}</strong> issues
          </span>
        </div>
      )}

      {/* Grid of Reused IssueCards in Admin mode */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <IssueCardSkeleton />
          <IssueCardSkeleton />
        </div>
      ) : issues.length === 0 ? (
        <EmptyState
          title={activeTab === 'triage' ? 'Triage queue is clear' : 'No issues match criteria'}
          description="Great job! All submitted campus maintenance reports have been assigned to appropriate staff."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              variant="admin"
              onQuickAction={handleQuickAction}
              showJoinButton={false}
            />
          ))}
        </div>
      )}

      {/* Quick Assign Drawer / Modal */}
      <Modal
        isOpen={Boolean(assignModalIssue)}
        onClose={() => setAssignModalIssue(null)}
        title={`Assign Maintenance Ticket ${assignModalIssue?.referenceId || ''}`}
        description="Select the department and technician to dispatch to the site."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink">Assigned Department / Team</label>
            <select
              value={assignedTeam}
              onChange={(e) => setAssignedTeam(e.target.value)}
              className="w-full h-10 rounded-lg border border-line-strong bg-surface pl-3.5 pr-9 text-sm text-ink cursor-pointer focus:border-brand-500 focus:ring-brand-100"
            >
              <option value="Plumbing & Water Services">Plumbing & Water Services</option>
              <option value="Electrical Works Team">Electrical Works Team</option>
              <option value="Campus Housekeeping & Sanitation">Campus Housekeeping & Sanitation</option>
              <option value="Network Operations Center (NOC)">Network Operations Center (NOC)</option>
              <option value="Carpentry & Furniture Workshop">Carpentry & Furniture Workshop</option>
              <option value="Civil & Structural Maintenance">Civil & Structural Maintenance</option>
              <option value="HVAC & Refrigeration Services">HVAC & Refrigeration Services</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink">Lead Technician Name (Optional)</label>
            <input
              type="text"
              value={assignedStaff}
              onChange={(e) => setAssignedStaff(e.target.value)}
              placeholder="e.g. Ramesh Kumar, Sunita Bai..."
              className="w-full h-10 rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="secondary"
              onClick={() => setAssignModalIssue(null)}
              disabled={isAssigning}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmAssignment}
              loading={isAssigning}
            >
              Confirm Assignment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
