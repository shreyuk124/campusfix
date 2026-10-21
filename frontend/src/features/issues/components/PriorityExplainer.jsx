// features/issues/components/PriorityExplainer.jsx - Transparency breakdown matching DESIGN.md §471
import { useState } from 'react';
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
          <HelpCircle size={15} className="text-brand-600 shrink-0" />
          <span className="text-xs font-bold text-ink">How was this priority calculated?</span>
        </div>
        {isOpen ? (
          <ChevronUp size={15} className="text-muted shrink-0" />
        ) : (
          <ChevronDown size={15} className="text-muted shrink-0" />
        )}
      </button>

      {/* Expandable Breakdown Drawer */}
      {isOpen && (
        <div className="mt-3 pt-3 border-t border-line/60 space-y-3 animate-in fade-in duration-150 text-xs">
          <div className="flex items-center justify-between font-semibold">
            <span className="text-muted">Calculated Band:</span>
            <span className="text-ink font-mono">{breakdown.band}</span>
          </div>

          <p className="text-muted text-[11px] leading-relaxed">
            CampusFix utilizes an objective formula weighting Category Severity, Student Affected Count, Safety Risk and Age.
          </p>

          <div className="space-y-2 bg-surface-muted p-2.5 rounded-lg border border-line/60">
            {/* Category */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-muted">
                <Layers size={13} className="text-brand-600" />
                <span>Category Base Weight</span>
              </span>
              <span className="font-mono font-medium text-ink">+{breakdown.categoryWeight} pts</span>
            </div>

            {/* Affected */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-muted">
                <Users size={13} className="text-orange-500" />
                <span>Affected Count Factor</span>
              </span>
              <span className="font-mono font-medium text-ink">+{breakdown.affectedFactor} pts</span>
            </div>

            {/* Safety */}
            {breakdown.safetyBonus > 0 && (
              <div className="flex items-center justify-between text-danger">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <ShieldAlert size={13} />
                  <span>Safety Hazard Bonus</span>
                </span>
                <span className="font-mono font-bold">+{breakdown.safetyBonus} pts</span>
              </div>
            )}

            {/* Age */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-muted">
                <Clock size={13} className="text-indigo-500" />
                <span>Age Aging Factor</span>
              </span>
              <span className="font-mono font-medium text-ink">+{breakdown.ageFactor} pts</span>
            </div>

            <hr className="border-line/60 my-1" />

            {/* Total */}
            <div className="flex items-center justify-between font-bold text-ink">
              <span>Total Priority Score:</span>
              <span className="font-mono text-sm text-brand-700">{breakdown.totalScore} / 100</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PriorityExplainer;
