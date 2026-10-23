// features/admin/AdminPage.jsx - Authority Dashboard reusing IssueCard with variant="admin"
// Conforms to DESIGN.md §5.5 & PRD requirements
import React, { useState, useEffect } from 'react';
import {
  Shield,
  Layers,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  CheckSquare,
  Square,
  UserCheck,
  RotateCcw,
} from 'lucide-react';
import { IssueCard, FilterBar } from '../issues/components';
import { Button, Modal, useToast, EmptyState, IssueCardSkeleton } from '../../components/ui';
import issuesService from '../issues/issuesService';
import { CAMPUS_BUILDINGS, CATEGORIES } from '../../lib/constants';

export default function AdminPage() {
  const { addToast } = useToast();
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIssueIds, setSelectedIssueIds] = useState([]);
  const [activeTab, setActiveTab] = useState('triage'); // 'triage' | 'all'
  const [filters, setFilters] = useState({
    search: '',
    building: 'all',
    category: 'all',
    status: 'all',
    priority: 'all',
    sort: 'highest-priority',
  });

  // Quick Assign Modal
  const [assignModalIssue, setAssignModalIssue] = useState(null);
  const [assignedTeam, setAssignedTeam] = useState('Plumbing & Water Services');
  const [assignedStaff, setAssignedStaff] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchAdminIssues = async () => {
    setIsLoading(true);
    try {
      const res = await issuesService.getIssues({
        page: 1,
        limit: 50,
        status: activeTab === 'triage' ? 'Reported' : filters.status,
        ...filters,
        simulateDelay: 200,
      });
      setIssues(res.issues);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminIssues();
  }, [activeTab, filters]);

  const handleSelectCard = (issue) => {
    setSelectedIssueIds((prev) =>
      prev.includes(issue.id) ? prev.filter((id) => id !== issue.id) : [...prev, issue.id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIssueIds.length === issues.length) {
      setSelectedIssueIds([]);
    } else {
      setSelectedIssueIds(issues.map((i) => i.id));
    }
  };

  const handleQuickAction = (action, issue) => {
    if (action === 'assign') {
      setAssignModalIssue(issue);
      setAssignedTeam(issue.assignedTeam !== 'Unassigned' ? issue.assignedTeam : 'Plumbing & Water Services');
      setAssignedStaff(issue.assignedStaff !== 'Unassigned' ? issue.assignedStaff : '');
    } else if (action === 'priority') {
      addToast({
        type: 'info',
        title: 'Priority Override',
        message: `Opening priority override matrix for ${issue.referenceId}.`,
      });
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
        assignModalIssue.priority
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

  const handleResetData = () => {
    issuesService.resetData();
    setSelectedIssueIds([]);
    fetchAdminIssues();
    addToast({
      type: 'info',
      title: 'Demo Data Reset',
      message: 'All campus issues restored to original mock seed state.',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-card">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200 px-2.5 py-0.5 text-xs font-semibold text-orange-700 mb-2">
            <Shield size={13} className="text-orange-600" />
            <span>Estate & Infrastructure Authority Portal</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Sarthak&apos;s Authority Management Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted">
            Triage new campus reports, dispatch maintenance crews, and monitor SLA compliance.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleResetData}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs"
        >
          <RotateCcw size={13} />
          <span>Reset Demo Data</span>
        </Button>
      </div>

      {/* Authority KPI Strip (DESIGN.md §500) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
          <span className="text-xs font-semibold text-muted">Open Queue</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-ink font-mono">{issues.length}</span>
            <span className="text-xs text-brand-600 font-medium">tickets</span>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
          <span className="text-xs font-semibold text-muted">Overdue SLA</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-danger font-mono">1</span>
            <span className="text-xs text-danger font-medium">+10 SLA penalty</span>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
          <span className="text-xs font-semibold text-muted">SLA Compliance</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-teal-700 font-mono">92.4%</span>
            <span className="text-xs text-teal-700 font-medium">On target</span>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
          <span className="text-xs font-semibold text-muted">Avg. Fix Time</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-ink font-mono">18.5h</span>
            <span className="text-xs text-muted font-medium">Target &lt; 24h</span>
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
            Triage Queue (Reported)
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
            All Campus Issues
          </button>
        </div>

        {/* Bulk select summary if cards selected */}
        {selectedIssueIds.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-medium bg-brand-50 text-brand-700 px-3 py-1 rounded-lg border border-brand-200">
            <span>{selectedIssueIds.length} issues selected</span>
            <button
              type="button"
              onClick={() => setSelectedIssueIds([])}
              className="text-brand-900 font-bold hover:underline ml-1"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* FilterBar */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        showStatusFilter={activeTab === 'all'}
      />

      {/* Bulk Select Control Bar */}
      {issues.length > 0 && (
        <div className="flex items-center justify-between text-xs text-muted px-1">
          <button
            type="button"
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 font-medium hover:text-ink"
          >
            {selectedIssueIds.length === issues.length ? (
              <CheckSquare size={16} className="text-brand-600" />
            ) : (
              <Square size={16} />
            )}
            <span>Select all {issues.length} displayed issues</span>
          </button>

          <span>
            Reusing shared <strong className="text-ink">IssueCard (variant=&quot;admin&quot;)</strong>
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
              isSelected={selectedIssueIds.includes(issue.id)}
              onSelect={handleSelectCard}
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