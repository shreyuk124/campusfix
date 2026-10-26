// features/issues/IssueDetailPage.jsx - Comprehensive Issue Detail and Tracking page
// Role-aware: Admins/Staff get Authority Controls; Students get student impact & voting
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Check,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Wrench,
  Shield,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  StatusBadge,
  HotspotBadge,
  IssueDetailSkeleton,
  ErrorState,
  Button,
  Modal,
  useToast,
} from '../../components/ui';
import {
  StatusStepper,
  Timeline,
  PhotoGallery,
  getCategoryIcon,
} from './components';
import { useAuth } from '../auth/useAuth';
import issuesService from './issuesService';
import { formatAbsoluteDate, formatRelativeTime } from '../../lib/format';

export default function IssueDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();

  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';
  const isStudent = !isAdmin && !isStaff;

  const [issue, setIssue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Authority Action Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignedTeam, setAssignedTeam] = useState('Plumbing & Water Services');
  const [assignedStaff, setAssignedStaff] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const fetchIssue = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await issuesService.getById(id, { simulateDelay: 250 });
      setIssue(data);
      if (data?.assignedTeam && data.assignedTeam !== 'Unassigned') {
        setAssignedTeam(data.assignedTeam);
      }
      if (data?.assignedStaff && data.assignedStaff !== 'Unassigned') {
        setAssignedStaff(data.assignedStaff);
      }
    } catch (err) {
      console.error('Error fetching issue detail:', err);
      setError(err.message || 'Issue not found');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIssue();
  }, [fetchIssue]);

  // Copy reference ID
  const handleCopyReference = () => {
    if (!issue?.referenceId) return;
    navigator.clipboard.writeText(issue.referenceId);
    setCopied(true);
    addToast({
      type: 'info',
      title: 'Copied to clipboard',
      message: `Reference ID ${issue.referenceId} copied.`,
      duration: 3000,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Student Toggle "+1 I am affected too"
  const handleToggleJoin = async () => {
    if (!issue || issue.isReporter || issue.status === 'Resolved' || issue.status === 'Closed') return;
    try {
      const updated = await issuesService.toggleJoinIssue(issue.id);
      setIssue(updated);
      addToast({
        type: updated.hasJoined ? 'success' : 'info',
        title: updated.hasJoined ? 'Marked as affected' : 'Vote removed',
        message: updated.hasJoined
          ? `You marked that ${issue.referenceId} affects you. Affected count is now ${updated.affectedCount}.`
          : `Removed your vote from ${issue.referenceId}.`,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Could not update affected count.',
      });
    }
  };

  // Authority: Confirm Assignment
  const handleConfirmAssignment = async () => {
    if (!issue) return;
    setIsAssigning(true);
    try {
      const updated = await issuesService.assignIssue(
        issue.id,
        assignedTeam,
        assignedStaff || 'Assigned Staff',
        );
      setIssue(updated);
      setIsAssignModalOpen(false);
      addToast({
        type: 'success',
        title: 'Work Order Assigned',
        message: `${issue.referenceId} dispatched to ${assignedTeam}.`,
      });
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to assign issue.' });
    } finally {
      setIsAssigning(false);
    }
  };

  // Authority: Start Work (In Progress)
  const handleStartWork = async () => {
    if (!issue) return;
    try {
      const updated = await issuesService.updateStatus(
        issue.id,
        'In Progress',
        'Maintenance crew dispatched and repair work actively started on-site.',
        user?.name || 'Estate Maintenance'
      );
      setIssue(updated);
      addToast({
        type: 'success',
        title: 'Work In Progress',
        message: `${issue.referenceId} moved to In Progress.`,
      });
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update status.' });
    }
  };

  // Authority: Mark Resolved
  const handleConfirmResolve = async () => {
    if (!issue) return;
    setIsResolving(true);
    try {
      const note = resolutionNote.trim() || 'Work order completed and verified on-site by estate authorities.';
      const updated = await issuesService.updateStatus(
        issue.id,
        'Resolved',
        note,
        user?.name || 'Estate Maintenance'
      );
      setIssue(updated);
      setIsResolveModalOpen(false);
      setResolutionNote('');
      addToast({
        type: 'success',
        title: 'Issue Resolved',
        message: `${issue.referenceId} marked as successfully resolved.`,
      });
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to resolve issue.' });
    } finally {
      setIsResolving(false);
    }
  };

  const backUrl = isAdmin ? '/admin' : isStaff ? '/staff' : '/feed';
  const backLabel = isAdmin ? 'Back to Admin Portal' : isStaff ? 'Back to Staff Portal' : 'Back to Issue Feed';

  if (isLoading) {
    return <IssueDetailSkeleton />;
  }

  if (error || !issue) {
    return (
      <div className="space-y-4">
        <Link
          to={backUrl}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft size={16} />
          <span>{backLabel}</span>
        </Link>
        <ErrorState
          title="Issue Not Found"
          message={error || 'The requested issue ID does not exist or has been removed.'}
          onRetry={fetchIssue}
        />
      </div>
    );
  }

  const isResolved = issue.status === 'Resolved' || issue.status === 'Closed';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={backUrl}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-brand-600 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>{backLabel}</span>
        </Link>
      </div>

      {/* Issue Header Card */}
      <div className="rounded-xl border border-line bg-surface p-5 sm:p-6 shadow-card space-y-4">
        {/* Category & Title */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-200"
              title={issue.category}
            >
              {getCategoryIcon(issue.category, 22)}
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                  {issue.category}
                </span>
                <span className="text-line-strong font-mono">/</span>
                <span className="text-xs font-medium text-muted">{issue.building}</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink leading-snug">
                {issue.title}
              </h1>
            </div>
          </div>

          {/* Reference ID in JetBrains Mono font + Copy button */}
          <div className="flex items-center gap-2 self-start shrink-0">
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface-muted px-3 py-1.5 font-mono text-xs font-bold text-ink">
              <span>{issue.referenceId}</span>
              <button
                type="button"
                onClick={handleCopyReference}
                className="text-muted hover:text-brand-600 transition-colors ml-1 cursor-pointer"
                title="Copy reference ID"
                aria-label="Copy reference ID"
              >
                {copied ? <Check size={14} className="text-teal-700 stroke-[2.5]" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Clean Badges Row (Zero SLA/Score clutter, No emojis) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-line/60">
          <StatusBadge status={issue.status} />
          {issue.isHotspot && <HotspotBadge />}
          {issue.isSafetyRisk && (
            <span className="inline-flex items-center gap-1 rounded-full bg-danger-50 border border-danger/30 px-2.5 py-0.5 text-xs font-medium text-danger">
              <AlertTriangle size={12} />
              Safety Hazard
            </span>
          )}
          {/* Student-only ownership badges */}
          {isStudent && issue.isReporter && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-200 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
              Reported by you
            </span>
          )}
          {isStudent && issue.hasJoined && !issue.isReporter && (
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
              <Check size={12} className="text-teal-700 stroke-[2.5]" />
              You marked affected
            </span>
          )}
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Status Stepper */}
          <section aria-labelledby="status-tracking-heading">
            <h2 id="status-tracking-heading" className="sr-only">
              Resolution Progress Stepper
            </h2>
            <StatusStepper currentStatus={issue.status} />
          </section>

          {/* 2. Issue Description & Exact Location Card */}
          <div className="rounded-xl border border-line bg-surface p-5 sm:p-6 shadow-card space-y-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
                Problem Description
              </h3>
              <p className="mt-2 text-sm sm:text-base text-body leading-relaxed whitespace-pre-line">
                {issue.description}
              </p>
            </div>

            <hr className="border-line" />

            {/* Location block */}
            <div className="flex items-start gap-2.5">
              <MapPin size={18} className="text-brand-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-ink">Exact Location on Campus</h4>
                <p className="text-sm text-body/90 mt-0.5">
                  <strong className="text-ink">{issue.building}</strong> — {issue.location}
                </p>
              </div>
            </div>

            {/* Photo Gallery with Lightbox */}
            {issue.photos && issue.photos.length > 0 && (
              <>
                <hr className="border-line" />
                <PhotoGallery photos={issue.photos} />
              </>
            )}
          </div>

          {/* 3. Timeline & Activity History */}
          <section aria-labelledby="timeline-heading">
            <h2 id="timeline-heading" className="sr-only">
              Issue Timeline
            </h2>
            <Timeline
              timeline={issue.timeline}
              resolutionNote={issue.resolutionNote}
            />
          </section>
        </div>

        {/* Side Column (1 col) */}
        <div className="space-y-6">
          {/* Reassuring Notice when Resolved */}
          {isResolved && (
            <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-5 shadow-card space-y-2">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
                <CheckCircle2 size={18} className="text-teal-700" />
                <span>Issue Resolved</span>
              </div>
              <p className="text-xs text-teal-950 leading-relaxed">
                This campus maintenance issue has been addressed and marked resolved by estate authorities.
              </p>
            </div>
          )}

          {/* AUTHORITY CONTROL PANEL (Only for Admin / Staff) */}
          {(isAdmin || isStaff) && (
            <div className="rounded-xl border border-brand-200 bg-surface p-5 shadow-card space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-line">
                <div className="flex items-center gap-2 text-xs font-bold text-ink uppercase tracking-wider">
                  <Shield size={16} className="text-brand-600" />
                  <span>Authority Actions</span>
                </div>
                <StatusBadge status={issue.status} />
              </div>

              {issue.status === 'Reported' && (
                <div className="space-y-3">
                  <p className="text-xs text-muted leading-relaxed">
                    This new report has not been assigned to a department yet.
                  </p>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => setIsAssignModalOpen(true)}
                  >
                    Assign Maintenance Team
                  </Button>
                </div>
              )}

              {issue.status === 'Assigned' && (
                <div className="space-y-2.5">
                  <p className="text-xs text-muted leading-relaxed">
                    Assigned to <strong className="text-ink">{issue.assignedTeam}</strong>.
                  </p>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleStartWork}
                    className="inline-flex items-center justify-center gap-2"
                  >
                    <Play size={14} />
                    <span>Start Work (Mark In Progress)</span>
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth
                    size="sm"
                    onClick={() => setIsAssignModalOpen(true)}
                  >
                    Reassign Team or Technician
                  </Button>
                </div>
              )}

              {issue.status === 'In Progress' && (
                <div className="space-y-2.5">
                  <p className="text-xs text-muted leading-relaxed">
                    Repairs are actively underway by <strong className="text-ink">{issue.assignedTeam}</strong>.
                  </p>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => setIsResolveModalOpen(true)}
                    className="bg-teal-600 hover:bg-teal-700 text-white inline-flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    <span>Mark Issue as Resolved</span>
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth
                    size="sm"
                    onClick={() => setIsAssignModalOpen(true)}
                  >
                    Reassign Crew
                  </Button>
                </div>
              )}

              {isResolved && (
                <div className="text-center py-2 text-xs font-semibold text-teal-800 bg-teal-50 rounded-lg border border-teal-200">
                  ✓ Ticket resolved and work verified
                </div>
              )}
            </div>
          )}

          {/* STUDENT IMPACT CARD */}
          <div className="rounded-xl border border-line bg-surface p-5 shadow-card space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-ink uppercase tracking-wider">
                <Users size={16} className="text-body" />
                <span>Student Impact</span>
              </div>
              <span className="text-xs text-muted font-medium">Campus Voice</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-ink font-mono">
                {issue.affectedCount || 1}
              </span>
              <span className="text-sm text-muted font-medium">
                {issue.affectedCount === 1 ? 'student affected' : 'students affected'}
              </span>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              When multiple students flag the same problem, estate authorities prioritize and dispatch maintenance faster.
            </p>

            {/* ONLY STUDENTS GET THE VOTE / MARK AFFECTED BUTTON */}
            {isStudent && (
              <Button
                variant={issue.hasJoined ? 'secondary' : 'primary'}
                fullWidth
                disabled={issue.isReporter || isResolved}
                onClick={handleToggleJoin}
                className={
                  isResolved
                    ? 'bg-surface-muted text-muted border border-line cursor-default'
                    : issue.isReporter
                    ? 'bg-surface-muted text-muted border border-line cursor-default'
                    : issue.hasJoined
                    ? 'border-teal-300 bg-teal-50 text-teal-800 hover:bg-teal-100'
                    : 'bg-brand-500 hover:bg-brand-600'
                }
              >
                {isResolved ? (
                  <span>Resolved (Voting closed)</span>
                ) : issue.isReporter ? (
                  <span>You created this report</span>
                ) : issue.hasJoined ? (
                  <>
                    <Check size={16} className="mr-1.5 text-teal-700 stroke-[2.5]" />
                    <span>You marked affected</span>
                  </>
                ) : (
                  <>
                    <span className="mr-1.5 font-bold">+1</span>
                    <span>Mark as affected</span>
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Assignment & Details Card */}
          <div className="rounded-xl border border-line bg-surface p-5 shadow-card space-y-4 text-xs">
            <h4 className="font-bold text-ink uppercase tracking-wider text-xs flex items-center gap-2">
              <UserCheck size={16} className="text-brand-600" />
              <span>Assignment &amp; Details</span>
            </h4>

            <div className="space-y-3">
              <div className="flex items-start justify-between pb-2.5 border-b border-line/60">
                <span className="text-muted">Assigned Team:</span>
                <span className="font-semibold text-ink text-right max-w-[160px] truncate">
                  {issue.assignedTeam || 'Unassigned'}
                </span>
              </div>

              {issue.assignedStaff && issue.assignedStaff !== 'Unassigned' && (
                <div className="flex items-start justify-between pb-2.5 border-b border-line/60">
                  <span className="text-muted">Lead Technician:</span>
                  <span className="font-semibold text-ink">{issue.assignedStaff}</span>
                </div>
              )}

              <div className="flex items-start justify-between pb-2.5 border-b border-line/60">
                <span className="text-muted">Reported On:</span>
                <span className="font-medium text-ink" title={formatAbsoluteDate(issue.createdAt)}>
                  {formatRelativeTime(issue.createdAt)}
                </span>
              </div>

              <div className="flex items-start justify-between">
                <span className="text-muted">Reporter Identity:</span>
                <span className="font-semibold text-muted bg-surface-muted px-2 py-0.5 rounded border border-line">
                  Hidden (Protected)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Authority Assign Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign Maintenance Team (${issue.referenceId})`}
        description="Select the department and lead technician to dispatch to the site."
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
              onClick={() => setIsAssignModalOpen(false)}
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

      {/* Authority Resolve Modal */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title={`Mark Resolved (${issue.referenceId})`}
        description="Record the work resolution details for estate records and the student timeline."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink">Work Resolution Report</label>
            <textarea
              rows={4}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Describe the repair work conducted (e.g. Swapped broken mixer tap with new OEM valve, tested high pressure seals and verified water flow)..."
              className="w-full rounded-lg border border-line-strong bg-surface p-3 text-sm text-ink focus:border-brand-500 focus:ring-brand-100"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="secondary"
              onClick={() => setIsResolveModalOpen(false)}
              disabled={isResolving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmResolve}
              loading={isResolving}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Confirm Resolution
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
