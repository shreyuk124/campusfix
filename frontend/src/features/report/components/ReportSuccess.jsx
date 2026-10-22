import { CheckCircle2, ThumbsUp, ArrowLeft, ExternalLink } from 'lucide-react';
import { NavLink } from 'react-router-dom';

/**
 * ReportSuccess Component
 * 
 * Rendered when:
 * 1. The student submits a brand new report (gives them Reference ID #CF-XXXXX).
 * 2. OR the student clicked "I am affected too" on an existing report.
 */
export default function ReportSuccess({
  type = 'new', // 'new' | 'affected'
  referenceId,
  issueTitle,
  onReset,
}) {
  const isUpvoted = type === 'affected';

  return (
    <div className="mx-auto max-w-form rounded-xl border border-line bg-surface p-6 sm:p-8 text-center space-y-6 shadow-card animate-in zoom-in-95 duration-200">
      {/* Icon Circle */}
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
          isUpvoted ? 'bg-teal-50 text-teal' : 'bg-success-bg text-success'
        }`}
      >
        {isUpvoted ? <ThumbsUp size={32} /> : <CheckCircle2 size={36} />}
      </div>

      {/* Main Title & Description */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-ink">
          {isUpvoted ? 'Urgency Upvoted!' : 'Complaint Submitted!'}
        </h2>
        <p className="text-sm text-muted max-w-md mx-auto">
          {isUpvoted
            ? `You have marked yourself as affected by this issue. Campus authorities have been notified of the increased impact.`
            : `Your report has been logged and queued for administrative review. You can track progress using your reference ID.`}
        </p>
      </div>

      {/* Reference ID Card */}
      <div className="mx-auto max-w-sm rounded-lg border border-line bg-canvas p-4 text-center">
        <span className="text-xs uppercase tracking-wider text-muted font-semibold block mb-1">
          Reference Ticket ID
        </span>
        <span className="font-mono text-xl font-bold text-brand-600 tracking-wider">
          #{referenceId}
        </span>
        {issueTitle && (
          <p className="mt-1 text-xs text-ink line-clamp-1 font-medium">
            {issueTitle}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <NavLink
          to={`/issues`}
          className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto rounded-md bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 transition-colors"
        >
          <span>Track in Issues Feed</span>
          <ExternalLink size={16} />
        </NavLink>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto rounded-md border border-line-strong bg-surface px-5 py-2.5 text-sm font-semibold text-ink hover:bg-surface-muted transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Report Another Issue</span>
        </button>
      </div>
    </div>
  );
}