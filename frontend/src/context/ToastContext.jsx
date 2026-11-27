import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../components/ui/Icon';

const ToastContext = createContext(null);

const styles = {
  success: 'border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100',
  error: 'border-rose-300 bg-rose-50 text-rose-950 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-100',
  warning: 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100',
  info: 'border-sky-300 bg-sky-50 text-sky-950 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-100',
};

const icons = { success: 'check', error: 'alert', warning: 'alert', info: 'chart' };

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    if (toast.duration === 0) return undefined;
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      className={`pointer-events-auto flex w-full gap-3 rounded-xl border p-4 shadow-lg ${styles[toast.type] || styles.info}`}
    >
      <Icon name={icons[toast.type] || icons.info} className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        {toast.title && <p className="text-sm font-semibold">{toast.title}</p>}
        {toast.message && <p className="mt-0.5 break-words text-sm opacity-90">{toast.message}</p>}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="-mr-1 -mt-1 rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/10"
      >
        <Icon name="close" className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (type, title, message, options = {}) => {
      counter.current += 1;
      const toast = {
        id: `toast-${counter.current}`,
        type,
        title,
        message,
        duration: options.duration ?? 5000,
      };
      setToasts((current) => [...current.slice(-3), toast]);
      return toast.id;
    },
    [],
  );

  const api = useMemo(
    () => ({
      toast: push,
      success: (title, message, options) => push('success', title, message, options),
      error: (title, message, options) => push('error', title, message, options),
      warning: (title, message, options) => push('warning', title, message, options),
      info: (title, message, options) => push('info', title, message, options),
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex max-w-full flex-col gap-2 p-3 pt-[calc(0.75rem+env(safe-area-inset-top))] sm:left-auto sm:right-0 sm:w-96 sm:p-5 sm:pt-5"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider.');
  return context;
}
