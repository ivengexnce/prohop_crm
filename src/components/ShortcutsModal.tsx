'use client';

import React from 'react';
import { X, Keyboard, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
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
        className="w-full max-w-lg bg-zinc-950 border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/[0.08] bg-zinc-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-indigo-400">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Keyboard Navigation</h2>
              <p className="text-xs text-zinc-400">Linear-style power user shortcuts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-2">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-white/[0.06] hover:bg-zinc-800/60 transition-colors"
            >
              <span className="text-xs sm:text-sm text-zinc-300 font-medium">
                {sc.description}
              </span>
              <kbd className="kbd-badge">{sc.key}</kbd>
            </div>
          ))}
        </div>

        <div className="p-4 bg-zinc-950/80 border-t border-white/[0.08] flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Sub-millisecond keyboard response
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold transition-colors cursor-pointer"
          >
            Done (Esc)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
