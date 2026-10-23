// features/issues/IssueDetailPage.jsx - Comprehensive Issue Detail and Tracking page
// Conforms to DESIGN.md §457-477, §4.6, §4.7 & Privacy Rule §9
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Check,
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Share2,
  Calendar,
  AlertTriangle,
  UserCheck,
  Building,
  Heart,
  Wrench,
} from 'lucide-react';
import {
  StatusBadge,
  PriorityBadge,
  SlaBadge,
  HotspotBadge,
  IssueDetailSkeleton,
  ErrorState,
  Modal,
  Button,
  useToast,
} from '../../components/ui';
import {
  StatusStepper,
  Timeline,
  PhotoGallery,
  PriorityExplainer,
  getCategoryIcon,
} from './components';
import issuesService from './issuesService';
import { formatAbsoluteDate, formatRelativeTime, formatAffectedCount } from '../../lib/format';

export default function IssueDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [issue, setIssue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Modals state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [reopenError, setReopenError] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Quick simulation menu for testing status changes
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);

  const fetchIssue = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await issuesService.getById(id, { simulateDelay: 250 });
      setIssue(data);
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

  // Toggle "+1 I am affected too"
  const handleToggleJoin = async () => {
    if (!issue) return;
    try {
      const updated = await issuesService.toggleJoinIssue(issue.id);
      setIssue(updated);
      addToast({
        type: updated.hasJoined ? 'success' : 'info',
        title: updated.hasJoined ? 'Joined report' : 'Left report',
        message: updated.hasJoined
          ? `You voted on ${issue.referenceId}. Affected count updated to ${updated.affectedCount}.`
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

  // Student action: Confirm fixed (Resolved -> Closed)
  const handleConfirmFixed = async () => {
    if (!issue) return;
    setIsActionLoading(true);
    try {
      const updated = await issuesService.confirmFixed(
        issue.id,
        'Student confirmed that the repair was inspected and solved.'
      );
      setIssue(updated);
      setIsConfirmModalOpen(false);
      addToast({
        type: 'success',
        title: 'Issue Closed & Confirmed',
        message: `Thank you! ${issue.referenceId} is now verified and permanently closed.`,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Action failed',
        message: err.message,
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Student action: Reopen issue (Resolved -> Reopened)
  const handleReopenIssue = async () => {
    if (!issue) return;
    if (!reopenReason.trim()) {
      setReopenError('Please provide a specific description of why the problem still persists.');
      return;
    }
    setIsActionLoading(true);
    setReopenError('');
    try {
      const updated = await issuesService.reopenIssue(issue.id, reopenReason);
      setIssue(updated);
      setIsReopenModalOpen(false);
      setReopenReason('');
      addToast({
        type: 'warning',
        title: 'Issue Reopened',
        message: `${issue.referenceId} was reopened with high priority. Estate maintenance notified.`,
      });
    } catch (err) {
      setReopenError(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Interactive Prototype Simulator: Advance status for demo
  const handleSimulateStatus = async (targetStatus) => {
    if (!issue) return;
    try {
      let note = `Status updated to ${targetStatus} in prototype demonstration.`;
      if (targetStatus === 'Resolved') {
        note = 'Maintenance technician completed valve replacement and water line test.';
      }
      const updated = await issuesService.updateStatus(
        issue.id,
        targetStatus,
        note,
        'Ramesh Kumar (Estate Technician)'
      );
      setIssue(updated);
      setIsSimulateOpen(false);
      addToast({
        type: 'info',
        title: 'Simulated Workflow Step',
        message: `Status transitioned to "${targetStatus}". Stepper and timeline updated.`,
      });
    } catch {
      // Ignore
    }
  };

  if (isLoading) {
    return <IssueDetailSkeleton />;
  }

  if (error || !issue) {
    return (
      <div className="space-y-4">
        <Link
          to="/feed"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft size={16} />
          <span>Back to Feed</span>
        </Link>
        <ErrorState
          title="Issue Not Found"
          message={error || 'The requested issue ID does not exist or has been removed.'}
          onRetry={fetchIssue}
        />
      </div>
    );
  }

  const isResolved = issue.status === 'Resolved';
  const isClosed = issue.status === 'Closed';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/feed"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-brand-600 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Issue Feed</span>
        </Link>

        {/* Prototype Demo Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsSimulateOpen(!isSimulateOpen)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-2.5 py-1 text-xs font-medium text-ink hover:bg-brand-50"
          >
            <Wrench size={13} className="text-brand-600" />
            <span>Simulate Status Advance</span>
          </button>
          {isSimulateOpen && (
            <div className="absolute right-0 mt-1 w-52 rounded-xl border border-line bg-surface p-2 shadow-modal z-20 space-y-1 text-xs">
              <p className="px-2 py-1 font-bold text-muted uppercase text-[10px]">
                Demo Status Transitions
              </p>
              {['Reported', 'Assigned', 'In Progress', 'Resolved', 'Closed'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSimulateStatus(s)}
                  className={`w-full text-left px-2.5 py-1.5 rounded font-medium hover:bg-brand-50 transition-colors ${
                    issue.status === s ? 'text-brand-600 font-bold bg-brand-50/50' : 'text-ink'
                  }`}
                >
                  Set &quot;{s}&quot;
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Header Card */}
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-7 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Category Icon */}
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
                className="text-muted hover:text-brand-600 transition-colors ml-1"
                title="Copy reference ID"
                aria-label="Copy reference ID"
              >
                {copied ? <Check size={14} className="text-teal-700" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-line/60">
          <StatusBadge status={issue.status} />
          <PriorityBadge priority={issue.priority} score={issue.priorityScore} />
          {issue.slaDeadline && <SlaBadge deadline={issue.slaDeadline} created={issue.createdAt} />}
          {issue.isHotspot && <HotspotBadge />}
          {issue.isSafetyRisk && (
            <span className="inline-flex items-center gap-1 rounded-full bg-danger-50 border border-danger/30 px-2.5 py-0.5 text-xs font-medium text-danger">
              <AlertTriangle size={12} />
              Safety Hazard
            </span>
          )}
          {issue.isReporter && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-200 px-2.5 py-0.5 text-xs font-medium text-brand-700">
              Reported by you
            </span>
          )}
        </div>
      </div>

      {/* 2-Column Responsive Layout (DESIGN.md §459: 2/3 main column + 1/3 side column) */}
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
          {/* Action Card when Resolved (Confirm Fixed / Reopen) */}
          {isResolved && (
            <div className="rounded-xl border-2 border-teal-500 bg-teal-50/70 p-5 shadow-card space-y-3.5">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
                <ShieldCheck size={18} className="text-teal-700" />
                <span>Verification Required</span>
              </div>
              <p className="text-xs text-teal-950 leading-relaxed">
                The maintenance technician marked this issue as resolved. Please inspect the location and verify if the issue is solved.
              </p>
              <div className="pt-1 flex flex-col gap-2">
                <Button
                  variant="success"
                  fullWidth
                  onClick={() => setIsConfirmModalOpen(true)}
                  className="bg-teal-700 hover:bg-teal-800 shadow-xs"
                >
                  <CheckCircle2 size={16} className="mr-1.5" />
                  Confirm Fixed
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => setIsReopenModalOpen(true)}
                >
                  <RotateCcw size={15} className="mr-1.5" />
                  Reopen Issue
                </Button>
              </div>
              <p className="text-[11px] text-teal-800 text-center font-medium pt-1">
                Auto-closes in 72 hours if no action is taken
              </p>
            </div>
          )}

          {/* Affected Students Card & Quick Join */}
          <div className="rounded-xl border border-line bg-surface p-5 shadow-card space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-ink uppercase tracking-wider">
                <Users size={16} className="text-orange-500" />
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
              When multiple students flag the same problem, our triage system automatically raises the priority score.
            </p>

            <Button
              variant={issue.hasJoined ? 'secondary' : 'primary'}
              fullWidth
              onClick={handleToggleJoin}
              className={
                issue.hasJoined
                  ? 'border-orange-300 bg-orange-50 text-orange-800 hover:bg-orange-100'
                  : 'bg-brand-500 hover:bg-brand-600'
              }
            >
              <Heart
                size={16}
                className={`mr-1.5 ${issue.hasJoined ? 'fill-orange-600 text-orange-600' : ''}`}
              />
              <span>
                {issue.hasJoined ? 'You marked affected' : 'I am affected too'}
              </span>
            </Button>
          </div>

          {/* Assignment & SLA Countdown Card */}
          <div className="rounded-xl border border-line bg-surface p-5 shadow-card space-y-4 text-xs">
            <h4 className="font-bold text-ink uppercase tracking-wider text-xs flex items-center gap-2">
              <UserCheck size={16} className="text-brand-600" />
              <span>Assignment & Schedule</span>
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
                <span className="text-muted">SLA Deadline:</span>
                <div className="text-right">
                  {issue.slaDeadline ? (
                    <SlaBadge deadline={issue.slaDeadline} created={issue.createdAt} />
                  ) : (
                    <span className="text-muted">N/A</span>
                  )}
                </div>
              </div>

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

          {/* Collapsible Priority Explainer */}
          <PriorityExplainer
            priority={issue.priority}
            priorityScore={issue.priorityScore}
            priorityBreakdown={issue.priorityBreakdown}
          />
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Issue Resolved"
        description="Verify that this maintenance complaint is completely fixed."
      >
        <div className="space-y-4">
          <p className="text-sm text-body leading-relaxed">
            By confirming, status for reference <strong className="font-mono text-ink">{issue.referenceId}</strong> will transition to <strong className="text-teal-700">Closed</strong>.
          </p>
          <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900 leading-snug">
            ✓ Your confirmation assists estate management in tracking technician performance and closing the work order.
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="secondary"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleConfirmFixed}
              loading={isActionLoading}
              className="bg-teal-700 hover:bg-teal-800"
            >
              Yes, Confirm Fixed
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reopen Modal */}
      <Modal
        isOpen={isReopenModalOpen}
        onClose={() => setIsReopenModalOpen(false)}
        title="Reopen Maintenance Issue"
        description="State why the issue is not resolved so technicians can return with correct parts."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="reopen-reason" className="block text-xs font-bold text-ink">
              Reason for Reopening <span className="text-danger">*</span>
            </label>
            <textarea
              id="reopen-reason"
              rows={3}
              value={reopenReason}
              onChange={(e) => {
                setReopenReason(e.target.value);
                setReopenError('');
              }}
              placeholder="e.g. The tap still drips when shut, or the leak has moved to the pipe joint underneath..."
              className="w-full rounded-lg border border-line-strong p-3 text-sm text-ink placeholder:text-muted focus:border-danger focus:ring-2 focus:ring-danger/20"
            />
            {reopenError && <p className="text-xs font-semibold text-danger">{reopenError}</p>}
          </div>

          <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-xs text-orange-950">
            ⚠️ Reopening will increase the priority by +10 points and re-alert the assigned department supervisor.
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="secondary"
              onClick={() => setIsReopenModalOpen(false)}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReopenIssue}
              loading={isActionLoading}
            >
              Reopen Ticket
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
