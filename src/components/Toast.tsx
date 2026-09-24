'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '@/lib/theme-context';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const showToast = useCallback(
    (type: ToastType, message: string, description?: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message, description }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all ${
                isLight
                  ? toast.type === 'success'
                    ? 'bg-white/95 border-emerald-300 text-slate-900 shadow-emerald-500/10'
                    : toast.type === 'error'
                    ? 'bg-white/95 border-rose-300 text-slate-900 shadow-rose-500/10'
                    : toast.type === 'warning'
                    ? 'bg-white/95 border-amber-300 text-slate-900 shadow-amber-500/10'
                    : 'bg-white/95 border-indigo-300 text-slate-900 shadow-indigo-500/10'
                  : toast.type === 'success'
                  ? 'bg-slate-900/95 border-emerald-500/30 text-slate-100 shadow-emerald-500/10'
                  : toast.type === 'error'
                  ? 'bg-slate-900/95 border-rose-500/30 text-slate-100 shadow-rose-500/10'
                  : toast.type === 'warning'
                  ? 'bg-slate-900/95 border-amber-500/30 text-slate-100 shadow-amber-500/10'
                  : 'bg-slate-900/95 border-indigo-500/30 text-slate-100 shadow-indigo-500/10'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {toast.type === 'success' && (
                  <CheckCircle2 className={`w-5 h-5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                )}
                {toast.type === 'error' && (
                  <AlertCircle className={`w-5 h-5 ${isLight ? 'text-rose-600' : 'text-rose-400'}`} />
                )}
                {toast.type === 'warning' && (
                  <AlertTriangle className={`w-5 h-5 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                )}
                {toast.type === 'info' && (
                  <Info className={`w-5 h-5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {toast.message}
                </p>
                {toast.description && (
                  <p className={`text-xs mt-1 leading-relaxed font-normal ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className={`shrink-0 transition-colors p-1 -mr-1 -mt-1 rounded-lg cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-800' : 'text-slate-400 hover:text-white'
                }`}
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
