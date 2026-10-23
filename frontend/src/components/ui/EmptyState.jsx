import React from 'react';
import { SearchX, Inbox, CheckCircle, PlusCircle } from 'lucide-react';
import Button from './Button';

export function EmptyState({
  icon = 'inbox',
  title = 'No issues found',
  description = 'Try adjusting your filters or search terms to find what you are looking for.',
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  className = '',
}) {
  const renderIllustration = () => {
    switch (icon) {
      case 'search':
        return (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 border border-brand-200">
            <SearchX size={32} strokeWidth={1.75} />
          </div>
        );
      case 'check':
        return (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 border border-teal-200">
            <CheckCircle size={32} strokeWidth={1.75} />
          </div>
        );
      case 'inbox':
      default:
        return (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-200">
            <Inbox size={32} strokeWidth={1.75} />
          </div>
        );
    }
  };

  return (
    <div className={`rounded-2xl border border-line bg-surface p-8 sm:p-12 text-center shadow-card ${className}`}>
      {renderIllustration()}
      <h3 className="mt-4 text-base sm:text-lg font-bold text-ink">{title}</h3>
      <p className="mt-1.5 text-sm text-muted max-w-md mx-auto leading-relaxed">{description}</p>
      {actionLabel && (
        <div className="mt-6 flex justify-center">
          <Button
            onClick={onAction}
            variant="primary"
            className="inline-flex items-center gap-2"
          >
            {ActionIcon ? <ActionIcon size={16} /> : <PlusCircle size={16} />}
            <span>{actionLabel}</span>
          </Button>
        </div>
      )}
    </div>
  );
}

export default EmptyState;
