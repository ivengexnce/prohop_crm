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
import { motion } from 'motion/react';
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] ring-1 transition-colors ${
          theme === 'light'
            ? 'bg-white border border-slate-200 text-slate-900 ring-slate-900/10 shadow-slate-900/15'
            : 'bg-zinc-950 border border-white/[0.12] text-zinc-100 ring-white/10'
        }`}
      >
        {/* Search Input Bar */}
        <div
          className={`relative border-b p-4 flex items-center gap-3 transition-colors ${
            theme === 'light'
              ? 'bg-slate-50/90 border-slate-200/80'
              : 'bg-zinc-950/80 border-white/[0.08]'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              theme === 'light'
                ? 'bg-indigo-50 border border-indigo-200 text-indigo-600'
                : 'bg-zinc-900 border border-white/[0.1] text-zinc-400'
            }`}
          >
            <CommandIcon className="w-4 h-4 text-indigo-500" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search tickets (e.g. 'TKT-001', 'export', 'open')..."
            className={`flex-1 bg-transparent text-xs sm:text-sm focus:outline-none font-sans ${
              theme === 'light'
                ? 'text-slate-900 placeholder-slate-400'
                : 'text-white placeholder-zinc-500'
            }`}
          />
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
            <kbd className="kbd-badge">ESC</kbd>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-zinc-400">
              <Search className="w-8 h-8 mx-auto text-zinc-400 mb-2 opacity-60" />
              <p className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-zinc-300'}`}>
                No matching commands or tickets found
              </p>
              <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-400' : 'text-zinc-500'}`}>
                Try searching for &quot;create&quot;, &quot;filter&quot;, or a customer name
              </p>
            </div>
          ) : (
            filteredCommands.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              const isLight = theme === 'light';

              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? isLight
                        ? 'bg-indigo-50/90 border border-indigo-200/90 shadow-xs ring-1 ring-indigo-500/20'
                        : 'bg-zinc-800/90 text-white shadow-xs border border-white/[0.1]'
                      : isLight
                      ? 'hover:bg-slate-50 text-slate-700 border border-transparent'
                      : 'hover:bg-zinc-900/60 text-zinc-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        isSelected
                          ? isLight
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-zinc-700 text-white'
                          : isLight
                          ? 'bg-slate-100 text-slate-600 border border-slate-200/70'
                          : 'bg-zinc-900 text-zinc-400 border border-white/[0.06]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs sm:text-sm font-semibold truncate ${
                            isSelected
                              ? isLight
                                ? 'text-indigo-950 font-bold'
                                : 'text-white'
                              : isLight
                              ? 'text-slate-900'
                              : 'text-zinc-200'
                          }`}
                        >
                          {item.title}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${
                            isSelected
                              ? isLight
                                ? 'bg-indigo-200/60 text-indigo-900 font-semibold'
                                : 'bg-zinc-700 text-zinc-200'
                              : isLight
                              ? 'bg-slate-100 text-slate-600 border border-slate-200/60'
                              : 'bg-zinc-900 text-zinc-400'
                          }`}
                        >
                          {item.category}
                        </span>
                      </div>
                      <p
                        className={`text-[11px] truncate mt-0.5 ${
                          isSelected
                            ? isLight
                              ? 'text-indigo-700/90 font-medium'
                              : 'text-zinc-300'
                            : isLight
                            ? 'text-slate-500'
                            : 'text-zinc-500'
                        }`}
                      >
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-3 shrink-0">
                    {item.shortcut ? (
                      <kbd className="kbd-badge">{item.shortcut}</kbd>
                    ) : null}
                    <ArrowRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isSelected
                          ? isLight
                            ? 'translate-x-0.5 text-indigo-600'
                            : 'translate-x-0.5 text-zinc-300'
                          : 'opacity-0'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div
          className={`border-t px-4 py-2.5 flex items-center justify-between text-xs font-mono transition-colors ${
            theme === 'light'
              ? 'bg-slate-50/90 border-slate-200/80 text-slate-500'
              : 'bg-zinc-950/80 border-white/[0.08] text-zinc-400'
          }`}
        >
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <kbd className="kbd-badge">↑</kbd>
              <kbd className="kbd-badge">↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="kbd-badge">↵</kbd> Select
            </span>
          </div>
          <span className={`text-[11px] ${theme === 'light' ? 'text-slate-400' : 'text-zinc-500'}`}>
            ProHop Command Hub
          </span>
        </div>
      </motion.div>
    </div>
  );
}
