"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000); // Auto dismiss after 4s
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-center gap-3 min-w-[300px] p-4 rounded-xl shadow-xl border backdrop-blur-md text-sm font-medium
                ${t.type === 'success' ? 'bg-green-50/90 border-green-200 text-green-800 dark:bg-green-950/90 dark:border-green-900 dark:text-green-300' :
                  t.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-800 dark:bg-red-950/90 dark:border-red-900 dark:text-red-300' :
                  'bg-white/90 border-zinc-200 text-zinc-800 dark:bg-zinc-900/90 dark:border-zinc-800 dark:text-zinc-200'}`}
              role="alert"
              aria-live="assertive"
            >
              {t.type === 'success' && <CheckCircle size={20} className="text-green-500" />}
              {t.type === 'error' && <AlertCircle size={20} className="text-red-500" />}
              {t.type === 'info' && <Info size={20} className="text-blue-500" />}
              <span className="flex-1">{t.message}</span>
              <button onClick={() => removeToast(t.id)} className="opacity-50 hover:opacity-100 transition-opacity" aria-label="Close notification">
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
