// features/issues/components/StatusStepper.jsx - Minimalist 4-stage resolution stepper
import React from 'react';
import { Check, RotateCcw, XCircle, GitMerge } from 'lucide-react';

const STANDARD_STEPS = [
  { key: 'Reported', label: 'Reported' },
  { key: 'Assigned', label: 'Assigned' },
  { key: 'In Progress', label: 'In Progress' },
  { key: 'Resolved', label: 'Resolved' },
];

export function StatusStepper({ currentStatus = 'Reported', className = '' }) {
  // Determine index of current status in standard workflow
  let currentIndex = STANDARD_STEPS.findIndex((s) => s.key === currentStatus);
  const isSpecialStatus = ['Reopened', 'Rejected', 'Merged'].includes(currentStatus);

  if (currentStatus === 'Reopened') {
    currentIndex = 2; // Treat as In Progress index
  } else if (currentStatus === 'Closed') {
    currentIndex = 3; // Treat Closed as Resolved
  }

  const isResolvedOrClosed = currentStatus === 'Resolved' || currentStatus === 'Closed';

  return (
    <div className={`rounded-xl border border-line bg-surface p-4 sm:p-6 shadow-card ${className}`}>
      {/* Special status callout if Reopened/Rejected/Merged */}
      {isSpecialStatus && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-orange-50/80 border border-orange-200 px-3 py-2 text-xs font-medium text-orange-800">
          {currentStatus === 'Reopened' && <RotateCcw size={14} className="text-danger" />}
          {currentStatus === 'Rejected' && <XCircle size={14} className="text-muted" />}
          {currentStatus === 'Merged' && <GitMerge size={14} className="text-purple-600" />}
          <span>
            {currentStatus === 'Reopened' && 'This issue was reopened and is back in the active queue.'}
            {currentStatus === 'Rejected' && 'This report was declined by campus administration.'}
            {currentStatus === 'Merged' && 'This report was consolidated with an existing master ticket.'}
          </span>
        </div>
      )}

      {/* Desktop Horizontal Stepper (≥640px) */}
      <div className="hidden sm:flex items-center justify-between relative">
        {STANDARD_STEPS.map((step, idx) => {
          const isCompleted = currentIndex > idx || (isResolvedOrClosed && idx === 3);
          const isCurrent = currentIndex === idx && !isResolvedOrClosed;

          return (
            <React.Fragment key={step.key}>
              {/* Connector line between steps */}
              {idx > 0 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
                    currentIndex >= idx || isResolvedOrClosed ? 'bg-teal-600' : 'bg-line-strong'
                  }`}
                />
              )}

              {/* Step indicator circle and label */}
              <div className="flex flex-col items-center text-center relative group min-w-[72px]">
                {/* Circle */}
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                    isCompleted
                      ? 'border-teal-600 bg-teal-50 text-teal-700'
                      : isCurrent
                      ? 'border-brand-500 bg-brand-50 text-brand-700 ring-4 ring-brand-100 font-bold'
                      : 'border-line-strong bg-surface text-muted'
                  }`}
                >
                  {isCompleted ? (
                    <Check size={18} strokeWidth={2.5} className="text-teal-700" />
                  ) : isCurrent ? (
                    <div className="h-3 w-3 rounded-full bg-brand-600 animate-pulse" />
                  ) : (
                    <span className="text-xs font-semibold text-muted">{idx + 1}</span>
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`mt-2 text-xs transition-colors ${
                    isCompleted
                      ? 'font-medium text-teal-800'
                      : isCurrent
                      ? 'font-bold text-brand-700'
                      : 'text-muted'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile Vertical Stepper (<640px) */}
      <div className="flex sm:hidden flex-col space-y-3">
        {STANDARD_STEPS.map((step, idx) => {
          const isCompleted = currentIndex > idx || (isResolvedOrClosed && idx === 3);
          const isCurrent = currentIndex === idx && !isResolvedOrClosed;

          return (
            <div key={step.key} className="flex items-center gap-3">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                  isCompleted
                    ? 'border-teal-600 bg-teal-50 text-teal-700'
                    : isCurrent
                    ? 'border-brand-500 bg-brand-500 text-white font-bold ring-2 ring-brand-100'
                    : 'border-line-strong bg-surface text-muted'
                }`}
              >
                {isCompleted ? (
                  <Check size={14} strokeWidth={2.5} />
                ) : (
                  <span className="text-[11px] font-semibold">{idx + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className={`text-xs ${
                    isCompleted
                      ? 'font-medium text-teal-800'
                      : isCurrent
                      ? 'font-bold text-brand-700'
                      : 'text-muted'
                  }`}
                >
                  {step.label}
                </span>
                {isCurrent && (
                  <span className="ml-2 text-[10px] uppercase tracking-wider font-semibold bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded">
                    Current stage
                  </span>
                )}
                {isCompleted && idx === 3 && (
                  <span className="ml-2 text-[10px] uppercase tracking-wider font-semibold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">
                    Resolved
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StatusStepper;
