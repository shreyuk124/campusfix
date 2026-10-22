import { useState } from 'react';
import { ShieldAlert, Info, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { useAuth } from './useAuth';

export default function AuthNotice({ onQuickFill, isRegister = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const { simulateFailure, toggleSimulateFailure, isBackendConnected } = useAuth();


  return (
    <div className="mb-6 overflow-hidden rounded-lg border border-line-strong bg-surface-muted text-xs shadow-sm">
      {/* Banner Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Info size={13} aria-hidden="true" />
          </span>
          <span className="font-semibold text-ink">
            Prototype UI — Backend Integration Notice
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700"
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Collapse prototype info' : 'Expand prototype info'}
        >
          <span>{isOpen ? 'Hide info' : 'View API details'}</span>
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expanded Details & Simulator Tools */}
      {isOpen && (
        <div className="border-t border-line px-3.5 py-3 space-y-3 bg-surface">
          <div className="flex items-start gap-2 text-muted">
            <ShieldAlert size={15} className="mt-0.5 shrink-0 text-orange-700" />
            <p className="leading-relaxed">
              <strong className="text-ink">Security Disclosure:</strong> This interface is a frontend
              client ready to connect to the CampusFix authentication endpoints (
              <code className="rounded bg-brand-50 px-1 py-0.5 font-mono text-[11px] text-brand-700">
                {isRegister ? 'POST /api/auth/register' : 'POST /api/auth/login'}
              </code>
              ). Local client authentication is simulated for testing. True cryptographic
              security and session tokens are enforced once the Express REST backend is running.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-2.5">
            <div className="flex items-center gap-2">
              <span className="text-muted">Connection Status:</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${
                  isBackendConnected
                    ? 'bg-success-bg text-success'
                    : 'bg-orange-50 text-orange-700'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isBackendConnected ? 'bg-success' : 'bg-orange'
                  }`}
                />
                {isBackendConnected ? 'Live Backend Connected' : 'Mock Prototype Mode'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Simulator toggle for failed-login testing */}
              <button
                type="button"
                onClick={toggleSimulateFailure}
                className={`inline-flex items-center gap-1 rounded px-2.5 py-1 font-medium transition-colors ${
                  simulateFailure
                    ? 'bg-danger-50 text-danger border border-danger/30'
                    : 'bg-surface-muted border border-line text-muted hover:text-ink'
                }`}
                title="Toggle simulated 401 error to test the Failed Login UI state"
              >
                <span>Simulate 401 Error:</span>
                <strong className={simulateFailure ? 'text-danger' : 'text-ink'}>
                  {simulateFailure ? 'ON (Fails)' : 'OFF (Succeeds)'}
                </strong>
              </button>

              {/* Quick Fill Button */}
              {onQuickFill && (
                <button
                  type="button"
                  onClick={onQuickFill}
                  className="inline-flex items-center gap-1 rounded border border-brand-200 bg-brand-50 px-2.5 py-1 font-medium text-brand-600 hover:bg-brand-100"
                >
                  <Zap size={12} />
                  <span>Demo Autofill</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
