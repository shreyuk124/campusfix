// components/ui/ErrorState.jsx - Error card matching DESIGN.md §4.14
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

export function ErrorState({
  title = 'Unable to load campus reports',
  message = 'A temporary error occurred while fetching issues. Please check your network connection and try again.',
  onRetry,
  className = '',
}) {
  return (
    <div
      role="alert"
      className={`rounded-xl border border-danger-border bg-danger-50 p-6 sm:p-8 text-center ${className}`}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger mb-3">
        <AlertCircle size={24} strokeWidth={2} />
      </div>
      <h3 className="text-base font-bold text-danger">{title}</h3>
      <p className="mt-1.5 text-sm text-body/80 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <div className="mt-5 flex justify-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetry}
            className="border-danger/30 text-danger hover:bg-danger/10 inline-flex items-center gap-1.5"
          >
            <RefreshCw size={14} />
            <span>Try again</span>
          </Button>
        </div>
      )}
    </div>
  );
}

export default ErrorState;
