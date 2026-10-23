// components/ui/Toast.jsx - Toast notification provider conforming to DESIGN.md §4.13
import { useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastContext } from './useToast';

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 5000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    if (duration > 0 && type !== 'error') {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Container: Top-right on desktop, top-center on mobile */}
      <div
        className="fixed top-4 right-4 sm:top-5 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const { type, title, message } = toast;

  const typeConfig = {
    success: {
      border: 'border-l-teal-600',
      icon: <CheckCircle2 size={18} className="text-teal-600" />,
      role: 'status',
    },
    error: {
      border: 'border-l-danger',
      icon: <AlertCircle size={18} className="text-danger" />,
      role: 'alert',
    },
    warning: {
      border: 'border-l-orange-500',
      icon: <AlertTriangle size={18} className="text-orange-500" />,
      role: 'status',
    },
    info: {
      border: 'border-l-brand-500',
      icon: <Info size={18} className="text-brand-500" />,
      role: 'status',
    },
  }[type] || {
    border: 'border-l-brand-500',
    icon: <Info size={18} className="text-brand-500" />,
    role: 'status',
  };

  return (
    <div
      role={typeConfig.role}
      className={`pointer-events-auto flex items-start gap-3 rounded-lg border border-line bg-surface p-3.5 shadow-modal border-l-4 ${typeConfig.border} animate-in slide-in-from-top-2 duration-200`}
    >
      <div className="mt-0.5 shrink-0">{typeConfig.icon}</div>
      <div className="flex-1 min-w-0">
        {title && <h4 className="text-xs font-bold text-ink leading-tight">{title}</h4>}
        {message && <p className="text-xs text-muted mt-0.5 leading-snug">{message}</p>}
      </div>
      <button
        onClick={onClose}
        className="shrink-0 text-muted hover:text-ink transition-colors p-0.5"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default ToastProvider;
