'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

export interface ToastState {
  /** Changes on every show, so a replacing toast animates in again. */
  id: number;
  message: string;
  undo?: () => void;
  error?: boolean;
}

interface ToastApi {
  toast: ToastState | null;
  showToast(message: string, options?: Omit<ToastState, 'id' | 'message'>): void;
  dismiss(): void;
}

const ToastContext = createContext<ToastApi | null>(null);
const DURATION_MS = 5000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const dismiss = useCallback(() => {
    clearTimeout(timer.current);
    setToast(null);
  }, []);

  const showToast = useCallback((message: string, options?: Omit<ToastState, 'id' | 'message'>) => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), message, ...options });
    timer.current = setTimeout(() => setToast(null), DURATION_MS);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const api = useMemo(() => ({ toast, showToast, dismiss }), [toast, showToast, dismiss]);
  return <ToastContext.Provider value={api}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast precisa estar dentro de <ToastProvider>');
  return api;
}
