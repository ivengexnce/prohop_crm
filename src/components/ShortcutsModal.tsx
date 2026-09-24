'use client';

import React from 'react';
import { X, Keyboard, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '⌘K / Ctrl+K', description: 'Open Command Palette & Global Search' },
    { key: 'N', description: 'Create New Support Ticket' },
    { key: 'ESC', description: 'Close any active modal or dialog' },
    { key: 'T', description: 'Switch to Paginated Table View' },
    { key: 'V', description: 'Switch to Kanban Board View' },
    { key: '1', description: 'Filter by Open Issues' },
    { key: '2', description: 'Filter by In Progress' },
    { key: '3', description: 'Filter by Resolved / Closed' },
    { key: '4', description: 'Filter by Urgent SLA Priority' },
    { key: '0', description: 'Reset all filters to All' },
    { key: 'E', description: 'Quick Export filtered tickets to CSV' },
    { key: '?', description: 'Open this Keyboard Shortcuts cheat sheet' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Keyboard Shortcuts</h2>
              <p className="text-xs text-slate-400">Power-user efficiency navigation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-2.5">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors"
            >
              <span className="text-xs sm:text-sm text-slate-300 font-medium">
                {sc.description}
              </span>
              <kbd className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono font-semibold text-indigo-400 shadow-inner">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            Designed for 60fps workflow speed
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </div>
  );
}
