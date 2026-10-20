import { ClipboardList } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  title = 'Nothing here yet',
  description = 'There are no records to display.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center px-5 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <ClipboardList size={24} aria-hidden="true" />
      </span>

      <h3 className="mt-4 font-semibold text-ink">{title}</h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
