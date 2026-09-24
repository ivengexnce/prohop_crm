'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  RefreshCw,
  Download,
  Code2,
  Sun,
  Moon,
  LayoutGrid,
  List,
  Flame,
  Clock,
  CheckCircle2,
  TrendingUp,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Command as CommandIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TicketItem } from '@/types/ticket';
import { useTheme } from '@/lib/theme-context';

export interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateTicket: () => void;
  onOpenApiDocs: () => void;
  onResetSeed: () => void;
  onExportCsv: () => void;
  onSelectStatus: (status: string) => void;
  onSetViewMode: (mode: 'table' | 'kanban') => void;
  onOpenShortcuts: () => void;
  onSelectTicket: (ticketId: string) => void;
  tickets: TicketItem[];
}

export default function CommandPalette({
  isOpen,
  onClose,
  onOpenCreateTicket,
  onOpenApiDocs,
  onResetSeed,
  onExportCsv,
  onSelectStatus,
  onSetViewMode,
  onOpenShortcuts,
  onSelectTicket,
  tickets,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme, toggleTheme } = useTheme();

  // Reset index on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Core system commands
  const defaultCommands: CommandItem[] = [
    {
      id: 'create-ticket',
      title: 'Create New Support Ticket',
      subtitle: 'Open the ticket creation modal with auto-ID and SLA timer',
      icon: Plus,
      category: 'Actions',
      shortcut: 'N',
      action: () => {
        onClose();
        onOpenCreateTicket();
      },
    },
    {
      id: 'toggle-theme',
      title: theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme',
      subtitle: 'Toggle dashboard appearance',
      icon: theme === 'dark' ? Sun : Moon,
      category: 'Actions',
      shortcut: 'T',
      action: () => {
        toggleTheme();
        onClose();
      },
    },
    {
      id: 'export-csv',
      title: 'Export Tickets to CSV',
      subtitle: 'Download RFC 4180 compliant CSV of currently filtered tickets',
      icon: Download,
      category: 'Actions',
      shortcut: 'E',
      action: () => {
        onClose();
        onExportCsv();
      },
    },
    {
      id: 'api-reference',
      title: 'Open REST API Explorer',
      subtitle: 'Inspect live endpoints, cURL commands, and request schemas',
      icon: Code2,
      category: 'Developer',
      shortcut: 'A',
      action: () => {
        onClose();
        onOpenApiDocs();
      },
    },
    {
      id: 'reset-seed',
      title: 'Reset Demo Seed Dataset',
      subtitle: 'Re-populate 8 comprehensive enterprise sample tickets',
      icon: RefreshCw,
      category: 'Developer',
      shortcut: 'R',
      action: () => {
        onClose();
        onResetSeed();
      },
    },
    {
      id: 'shortcuts-modal',
      title: 'Keyboard Shortcuts Cheat Sheet',
      subtitle: 'View all keyboard navigation shortcuts',
      icon: HelpCircle,
      category: 'Help',
      shortcut: '?',
      action: () => {
        onClose();
        onOpenShortcuts();
      },
    },
    {
      id: 'view-table',
      title: 'Switch to Table View',
      subtitle: 'Display high-density paginated data table',
      icon: List,
      category: 'Views',
      action: () => {
        onClose();
        onSetViewMode('table');
      },
    },
    {
      id: 'view-kanban',
      title: 'Switch to Kanban Board',
      subtitle: 'Display visual workflow columns for Open, In Progress, Closed',
      icon: LayoutGrid,
      category: 'Views',
      action: () => {
        onClose();
        onSetViewMode('kanban');
      },
    },
    {
      id: 'filter-all',
      title: 'Filter: All Tickets',
      subtitle: 'Reset status filters to show every ticket in system',
      icon: List,
      category: 'Filters',
      action: () => {
        onClose();
        onSelectStatus('All');
      },
    },
    {
      id: 'filter-open',
      title: 'Filter: Open Issues',
      subtitle: 'Display only tickets awaiting agent triage',
      icon: Clock,
      category: 'Filters',
      action: () => {
        onClose();
        onSelectStatus('Open');
      },
    },
    {
      id: 'filter-inprogress',
      title: 'Filter: In Progress',
      subtitle: 'Display tickets currently being investigated',
      icon: TrendingUp,
      category: 'Filters',
      action: () => {
        onClose();
        onSelectStatus('In Progress');
      },
    },
    {
      id: 'filter-closed',
      title: 'Filter: Resolved / Closed',
      subtitle: 'Display completed customer tickets',
      icon: CheckCircle2,
      category: 'Filters',
      action: () => {
        onClose();
        onSelectStatus('Closed');
      },
    },
    {
      id: 'filter-urgent',
      title: 'Filter: Urgent SLA Attention',
      subtitle: 'Display critical high-priority tickets',
      icon: Flame,
      category: 'Filters',
      action: () => {
        onClose();
        onSelectStatus('Urgent');
      },
    },
  ];

  // Dynamic ticket search results
  const matchingTickets: CommandItem[] = query.trim()
    ? tickets
        .filter(
          (t) =>
            t.ticket_id.toLowerCase().includes(query.toLowerCase()) ||
            t.subject.toLowerCase().includes(query.toLowerCase()) ||
            t.customer_name.toLowerCase().includes(query.toLowerCase()) ||
            t.customer_email.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 6)
        .map((t) => ({
          id: `ticket-${t.ticket_id}`,
          title: `${t.ticket_id}: ${t.subject}`,
          subtitle: `${t.customer_name} (${t.customer_email}) • ${t.status} • ${t.priority}`,
          icon: Sparkles,
          category: 'Matching Tickets',
          action: () => {
            onClose();
            onSelectTicket(t.ticket_id);
          },
        }))
    : [];

  const filteredCommands: CommandItem[] = query.trim()
    ? [
        ...matchingTickets,
        ...defaultCommands.filter(
          (cmd) =>
            cmd.title.toLowerCase().includes(query.toLowerCase()) ||
            cmd.subtitle.toLowerCase().includes(query.toLowerCase()) ||
            cmd.category.toLowerCase().includes(query.toLowerCase())
        ),
      ]
    : defaultCommands;

  // Handle keyboard events inside command palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev <= 0 ? Math.max(0, filteredCommands.length - 1) : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredCommands[selectedIndex];
      if (selected) {
        selected.action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[80vh] ring-1 ring-white/10"
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-800 p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <CommandIcon className="w-4 h-4" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search tickets (e.g. 'TKT-001', 'export', 'open')..."
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-400 text-sm sm:text-base focus:outline-none"
          />
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">ESC</span>
            <span>to close</span>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-medium">No matching commands or tickets found</p>
              <p className="text-xs text-slate-500 mt-1">
                Try searching for "create", "filter", or a customer name
              </p>
            </div>
          ) : (
            filteredCommands.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'hover:bg-slate-800/80 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate">{item.title}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.category}
                        </span>
                      </div>
                      <p
                        className={`text-xs truncate mt-0.5 ${
                          isSelected ? 'text-indigo-100' : 'text-slate-400'
                        }`}
                      >
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-3 shrink-0">
                    {item.shortcut ? (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-800 border border-slate-700 text-slate-400'
                        }`}
                      >
                        {item.shortcut}
                      </span>
                    ) : null}
                    <ArrowRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected ? 'translate-x-0.5 text-white' : 'opacity-0'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="border-t border-slate-800 px-4 py-2.5 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="px-1 bg-slate-800 rounded">↑</span>
              <span className="px-1 bg-slate-800 rounded">↓</span> Navigate
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1 bg-slate-800 rounded">↵</span> Select
            </span>
          </div>
          <span className="text-slate-500">NexusCRM Command Hub</span>
        </div>
      </motion.div>
    </div>
  );
}
