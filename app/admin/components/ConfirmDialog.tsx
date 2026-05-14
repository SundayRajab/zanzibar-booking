import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  isDestructive?: boolean;
};

export default function ConfirmDialog({
  isOpen, title, description, confirmText = 'Confirm', cancelText = 'Cancel',
  onConfirm, onCancel, isLoading = false, isDestructive = false
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            onClick={!isLoading ? onCancel : undefined}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl"
          >
            <h2 className="text-xl font-bold text-black dark:text-white mb-2">{title}</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 leading-relaxed">{description}</p>
            <div className="flex justify-end gap-3">
              <button onClick={onCancel} disabled={isLoading} className="px-4 py-2 rounded-lg font-semibold text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50">
                {cancelText}
              </button>
              <button onClick={onConfirm} disabled={isLoading} className={`px-4 py-2 rounded-lg font-semibold text-sm text-white shadow-sm transition-opacity disabled:opacity-50 ${isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-black dark:bg-white dark:text-black hover:opacity-90'}`}>
                {isLoading ? 'Processing...' : confirmText}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
