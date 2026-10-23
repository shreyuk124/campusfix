// components/ui/Modal.jsx - Accessible Modal / Mobile Bottom Sheet conforming to DESIGN.md §4.12
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
  showClose = true,
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Scrim Overlay */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card / Mobile Bottom Sheet */}
      <div
        ref={modalRef}
        className={`relative z-10 w-full sm:${maxWidth} max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-line bg-surface p-6 shadow-modal transition-all animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200`}
      >
        {/* Mobile Drag Handle */}
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line-strong sm:hidden" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            {title && (
              <h3 id="modal-title" className="text-lg font-bold text-ink">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1 text-sm text-muted">{description}</p>
            )}
          </div>
          {showClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-brand-50 hover:text-ink transition-colors"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
