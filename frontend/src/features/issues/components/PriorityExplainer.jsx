// features/issues/components/PriorityExplainer.jsx - Transparency breakdown matching DESIGN.md §471
import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ShieldAlert, Users, Layers, Clock } from 'lucide-react';
import { PRIORITY_BANDS } from '../../../lib/constants';

export function PriorityExplainer({ priority = 'Medium', priorityScore = 40, priorityBreakdown, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);

  const band = PRIORITY_BANDS.find(
    (b) => b.label.toLowerCase() === String(priority).toLowerCase()
  ) || PRIORITY_BANDS[1];

  const breakdown = priorityBreakdown || {
    categoryWeight: 20,
    affectedFactor: 12,
    safetyBonus: 0,
    ageFactor: 8,
    totalScore: priorityScore,
    band: `${band.label} (${band.min}–${band.max === Infinity ? '100+' : band.max} points, ${band.slaHours}h SLA)`,
  };

  return (
    <div className={`rounded-xl border border-line bg-surface p-4 shadow-card ${className}`}>
      {/* Header button to toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <HelpCircle size={16} className="text-brand-600 shrink-0" />
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-ink">Why this priority?</h4>
            <p className="text-[11px] text-muted">
              Score: <strong className="text-ink">{priorityScore} / 100</strong> ({band.label} Band · {band.slaHours}h Target)
            </p>
          </div>
        </div>
        <div className="text-muted hover:text-ink">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Collapsible Factor Breakdown */}
      {isOpen && (
        <div className="mt-3 pt-3 border-t border-line/70 space-y-2 text-xs animate-in fade-in duration-150">
          <p className="text-[11px] text-muted leading-relaxed">
            Priorities are automatically calculated by backend scoring algorithms to ensure objective maintenance response times.
          </p>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between p-1.5 rounded bg-surface-muted border border-line/50">
              <span className="flex items-center gap-1.5 text-body">
                <Layers size={13} className="text-brand-500" />
                Category Impact
              </span>
              <span className="font-mono font-semibold text-ink">+{breakdown.categoryWeight || 20} pts</span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded bg-surface-muted border border-line/50">
              <span className="flex items-center gap-1.5 text-body">
                <Users size={13} className="text-orange-500" />
                Affected Students Multiplier
              </span>
              <span className="font-mono font-semibold text-ink">+{breakdown.affectedFactor || 10} pts</span>
            </div>

            {breakdown.safetyBonus > 0 && (
              <div className="flex items-center justify-between p-1.5 rounded bg-danger-50 border border-danger-border/40 text-danger">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldAlert size={13} />
                  Safety Hazard Penalty
                </span>
                <span className="font-mono font-bold">+{breakdown.safetyBonus} pts</span>
              </div>
            )}

            <div className="flex items-center justify-between p-1.5 rounded bg-surface-muted border border-line/50">
              <span className="flex items-center gap-1.5 text-body">
                <Clock size={13} className="text-muted" />
                Ticket Age & SLA Escalation
              </span>
              <span className="font-mono font-semibold text-ink">+{breakdown.ageFactor || 0} pts</span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-line/60 flex items-center justify-between font-semibold text-ink">
            <span>Calculated Score</span>
            <span className="font-mono text-sm text-brand-600">{priorityScore} pts</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PriorityExplainer;
