'use client';

import React from 'react';
import { X, Keyboard, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '@/lib/theme-context';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  if (!isOpen) return null;

  const shortcuts = [
    { key: '⌘K / Ctrl+K', description: 'Open Global Command Palette' },
    { key: 'J / ↓', description: 'Navigate down to next ticket row' },
    { key: 'K / ↑', description: 'Navigate up to previous ticket row' },
    { key: 'Enter', description: 'Open highlighted ticket in inspector' },
    { key: 'X', description: 'Toggle selection of highlighted ticket' },
    { key: 'N', description: 'Create New Support Ticket' },
    { key: 'T', description: 'Switch to Paginated Table View' },
    { key: 'V', description: 'Switch to Kanban Board View' },
    { key: '1', description: 'Filter by Open Issues' },
    { key: '2', description: 'Filter by In Progress' },
    { key: '3', description: 'Filter by Resolved / Closed' },
    { key: '4', description: 'Filter by Urgent SLA Priority' },
    { key: '0', description: 'Reset all filters to All Records' },
    { key: 'E', description: 'Quick Export filtered tickets to CSV' },
    { key: 'ESC', description: 'Close any active modal or overlay' },
    { key: '?', description: 'Open this Keyboard Shortcuts cheat sheet' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ring-1 transition-colors ${
          isLight
            ? 'bg-white border border-slate-200 text-slate-900 ring-slate-900/10'
            : 'bg-zinc-950 border border-white/[0.12] text-zinc-100 ring-white/10'
        }`}
      >
        <div
          className={`flex items-center justify-between p-5 border-b transition-colors ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950/80 border-white/[0.08]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl transition-colors ${
                isLight
                  ? 'bg-indigo-50 border border-indigo-200 text-indigo-600'
                  : 'bg-zinc-900 border border-white/[0.1] text-indigo-400'
              }`}
            >
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Keyboard Navigation
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Linear-style power user shortcuts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight
                ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-2">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                isLight
                  ? 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/80'
                  : 'bg-zinc-900/60 border border-white/[0.06] hover:bg-zinc-800/60'
              }`}
            >
              <span
                className={`text-xs sm:text-sm font-medium ${
                  isLight ? 'text-slate-700' : 'text-zinc-300'
                }`}
              >
                {sc.description}
              </span>
              <kbd className="kbd-badge">{sc.key}</kbd>
            </div>
          ))}
        </div>

        <div
          className={`p-4 border-t flex items-center justify-between text-xs transition-colors ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-500'
              : 'bg-zinc-950/80 border-white/[0.08] text-zinc-400'
          }`}
        >
          <span
            className={`flex items-center gap-1.5 font-mono text-[11px] ${
              isLight ? 'text-slate-500' : 'text-zinc-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Sub-millisecond keyboard response
          </span>
          <button
            onClick={onClose}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
            }`}
          >
            Done (Esc)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
