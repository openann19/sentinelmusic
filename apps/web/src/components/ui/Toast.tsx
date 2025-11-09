'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Toast = {
  id: number;
  title: string;
  description?: string;
  status?: 'info' | 'success' | 'warn' | 'error';
  timeout?: number;
};

type ToastContextValue = {
  push: (t: Omit<Toast, 'id'>) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('ToastProvider missing');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  function push(t: Omit<Toast, 'id'>) {
    const id = Date.now();
    setItems((prev) => [...prev, { id, status: 'info', timeout: 3500, ...t }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }, t.timeout ?? 3500);
  }

  const getStatusStyles = (status?: string) => {
    switch (status) {
      case 'success':
        return 'border-success/50 bg-success/10';
      case 'warn':
        return 'border-warn/50 bg-warn/10';
      case 'error':
        return 'border-error/50 bg-error/10';
      default:
        return 'border-border bg-surface/95';
    }
  };

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-20 right-4 z-[60] space-y-2"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className={`rounded-2xl border px-4 py-3 shadow-lg ${getStatusStyles(
              t.status,
            )}`}
          >
            <div className="font-medium text-text">{t.title}</div>
            {t.description && (
              <div className="text-sm text-muted mt-1">{t.description}</div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

