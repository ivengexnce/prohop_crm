'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TicketItem, TicketStatus } from '@/types/ticket';
import { formatRelativeTime, getSlaStatus } from '@/lib/date-utils';
import {
  MessageSquare,
  Clock,
  ArrowRight,
  Copy,
  Check,
  Inbox,
  Flame,
  Paperclip,
  CheckSquare,
  Square,
  Eye,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TicketListProps {
  tickets: TicketItem[];
  isLoading: boolean;
  onSelectTicket: (ticketId: string) => void;
  onQuickStatusChange: (ticketId: string, newStatus: TicketStatus) => void;
  onResetFilters: () => void;
  onOpenCreateModal: () => void;
}

export default function TicketList({
  tickets,
  isLoading,
  onSelectTicket,
  onQuickStatusChange,
  onResetFilters,
  onOpenCreateModal,
}: TicketListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  // Copy Ticket ID helper
  const handleCopy = (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ticketId);
    setCopiedId(ticketId);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Toggle item selection
  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === tickets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(tickets.map((t) => t.ticket_id));
    }
  };

  // Bulk status update
  const handleBulkStatus = async (status: TicketStatus) => {
    for (const id of selectedIds) {
      await onQuickStatusChange(id, status);
    }
    setSelectedIds([]);
  };

  // Linear-style Keyboard Navigation (J / K / X / Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in form inputs
      const isInputActive = ['input', 'textarea', 'select'].includes(
        (document.activeElement?.tagName || '').toLowerCase()
      );
      if (isInputActive || tickets.length === 0) return;

      // 'J' or Down Arrow: next row
      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < tickets.length - 1 ? prev + 1 : 0
        );
      }
      // 'K' or Up Arrow: previous row
      else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : tickets.length - 1
        );
      }
      // 'Enter': open highlighted ticket
      else if (e.key === 'Enter' && highlightedIndex >= 0 && highlightedIndex < tickets.length) {
        e.preventDefault();
        onSelectTicket(tickets[highlightedIndex].ticket_id);
      }
      // 'X': toggle selection of highlighted ticket
      else if (e.key === 'x' && highlightedIndex >= 0 && highlightedIndex < tickets.length) {
        e.preventDefault();
        const activeId = tickets[highlightedIndex].ticket_id;
        setSelectedIds((prev) =>
          prev.includes(activeId) ? prev.filter((id) => id !== activeId) : [...prev, activeId]
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tickets, highlightedIndex, onSelectTicket]);

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'Open':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Open
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            In Progress
          </span>
        );
      case 'Closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Closed
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <Flame className="w-3 h-3 text-rose-400" />
            Urgent
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Medium
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/60">
            Low
          </span>
        );
      default:
        return null;
    }
  };

  // Skeleton Loading State
  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl p-6 space-y-4">
        <div className="h-6 w-48 bg-zinc-800/80 rounded-lg animate-pulse" />
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-14 w-full bg-zinc-900/60 border border-white/[0.04] rounded-xl animate-pulse flex items-center justify-between px-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-zinc-800 rounded" />
                <div className="w-20 h-4 bg-zinc-800 rounded" />
                <div className="w-44 h-4 bg-zinc-800 rounded" />
              </div>
              <div className="w-24 h-6 bg-zinc-800 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty State
  if (tickets.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel rounded-2xl p-10 sm:p-14 text-center shadow-xl border border-dashed border-white/10"
      >
        <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-white/[0.08] text-zinc-400 flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Inbox className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">No Tickets Match Filter Criteria</h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto mb-6 leading-relaxed">
          Zero records matching the selected status or priority filter. Try resetting filters or create a new ticket.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onResetFilters}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Clear Filters (0)
          </button>
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            + Create Ticket (N)
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
        {/* Navigation keyboard hint toolbar */}
        <div className="hidden lg:flex items-center justify-between px-4 py-2 bg-zinc-950/40 border-b border-white/[0.06] text-[11px] text-zinc-400 font-mono">
          <div className="flex items-center gap-3">
            <span>
              Use <kbd className="kbd-badge">J</kbd> / <kbd className="kbd-badge">K</kbd> to navigate
            </span>
            <span>&bull;</span>
            <span>
              <kbd className="kbd-badge">Enter</kbd> to open
            </span>
            <span>&bull;</span>
            <span>
              <kbd className="kbd-badge">X</kbd> to select
            </span>
          </div>
          {highlightedIndex >= 0 && (
            <span className="text-indigo-400 font-medium">
              Active: {tickets[highlightedIndex]?.ticket_id} ({highlightedIndex + 1}/{tickets.length})
            </span>
          )}
        </div>

        {/* ─── Desktop Table View (>= md) ──────────────────────────────────── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[1020px]">
            <thead>
              <tr className="border-b border-white/[0.08] bg-zinc-950/70 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 pl-4 pr-2 w-10 text-center">
                  <button
                    onClick={toggleSelectAll}
                    className="text-zinc-400 hover:text-white cursor-pointer inline-flex items-center justify-center"
                    title={selectedIds.length === tickets.length ? 'Deselect all' : 'Select all'}
                  >
                    {selectedIds.length === tickets.length && tickets.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <Square className="w-4 h-4 text-zinc-600" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-2.5 w-24">Ticket ID</th>
                <th className="py-3 px-2.5 w-40">Customer</th>
                <th className="py-3 px-3 min-w-[200px]">Subject & Context</th>
                <th className="py-3 px-2.5 w-28">Status</th>
                <th className="py-3 px-2.5 w-24">Priority</th>
                <th className="py-3 px-2.5 w-28">Category</th>
                <th className="py-3 px-2.5 w-28">SLA Health</th>
                <th className="py-3 pr-4 pl-2.5 text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {tickets.map((t, idx) => {
                const sla = getSlaStatus(t.created_at, t.status);
                const isSelected = selectedIds.includes(t.ticket_id);
                const isHighlighted = idx === highlightedIndex;

                return (
                  <motion.tr
                    key={t.ticket_id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: idx * 0.015 }}
                    onClick={() => onSelectTicket(t.ticket_id)}
                    className={`group cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'bg-indigo-950/30'
                        : isHighlighted
                        ? 'bg-zinc-800/80 ring-1 ring-inset ring-indigo-500/50'
                        : 'hover:bg-zinc-800/40'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 pl-4 pr-2 w-10 text-center" onClick={(e) => toggleSelect(t.ticket_id, e)}>
                      <button className="text-zinc-400 hover:text-white cursor-pointer inline-flex items-center justify-center">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
                        )}
                      </button>
                    </td>

                    {/* Ticket ID */}
                    <td className="py-3 px-2.5 whitespace-nowrap w-24">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors">
                          {t.ticket_id}
                        </span>
                        <button
                          onClick={(e) => handleCopy(t.ticket_id, e)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
                          title="Copy ID"
                        >
                          {copiedId === t.ticket_id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="py-3 px-2.5 w-40">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 border border-white/[0.08] text-zinc-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {t.customer_name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-zinc-200 group-hover:text-white transition-colors leading-tight truncate text-xs max-w-[120px]">
                            {t.customer_name}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-mono leading-tight truncate max-w-[120px]">
                            {t.customer_email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Subject & Activity count */}
                    <td className="py-3 px-3 min-w-[200px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium text-zinc-200 truncate group-hover:text-zinc-100 transition-colors text-xs sm:text-sm">
                          {t.subject}
                        </span>
                        {t.attachment_url && (
                          <span
                            className="p-0.5 px-1 rounded bg-zinc-800/80 text-cyan-400 border border-zinc-700/60 shrink-0 text-[10px]"
                            title="Contains attachment"
                          >
                            <Paperclip className="w-3 h-3 inline" />
                          </span>
                        )}
                        {(t.notes_count ?? 0) > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-zinc-400 px-1.5 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/60 shrink-0 font-mono">
                            <MessageSquare className="w-2.5 h-2.5 text-indigo-400" />
                            {t.notes_count}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5 max-w-xs sm:max-w-sm md:max-w-md">
                        {t.description}
                      </p>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-2.5 whitespace-nowrap w-28">
                      <div className="flex items-center gap-1.5">
                        {getStatusBadge(t.status)}
                        {t.is_archived && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            Archived
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-2.5 whitespace-nowrap w-24">
                      {getPriorityBadge(t.priority)}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-2.5 whitespace-nowrap w-28">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
                        {t.category}
                      </span>
                    </td>

                    {/* SLA Health Indicator */}
                    <td className="py-3 px-2.5 whitespace-nowrap w-28">
                      <div className="flex items-center gap-1.5">
                        <Clock className={`w-3.5 h-3.5 shrink-0 ${sla.isBreached ? 'text-rose-400' : 'text-zinc-400'}`} />
                        <span
                          className={`text-xs font-semibold ${
                            sla.isBreached
                              ? 'text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20'
                              : t.status === 'Closed'
                              ? 'text-zinc-400'
                              : 'text-zinc-200'
                          }`}
                        >
                          {sla.text}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                        {formatRelativeTime(t.created_at)}
                      </p>
                    </td>

                    {/* Quick Action Button */}
                    <td className="py-3 pr-4 pl-2.5 text-right whitespace-nowrap w-32">
                      <div className="flex items-center justify-end gap-1.5">
                        <div
                          className="relative inline-block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={t.status}
                            onChange={(e) =>
                              onQuickStatusChange(t.ticket_id, e.target.value as TicketStatus)
                            }
                            className="bg-zinc-900 border border-zinc-700/80 hover:border-white/20 rounded-lg px-2 py-1 text-xs text-zinc-200 focus:outline-none cursor-pointer"
                          >
                            <option value="Open">Set Open</option>
                            <option value="In Progress">Set In Prog</option>
                            <option value="Closed">Set Closed</option>
                          </select>
                        </div>

                        <button
                          onClick={() => onSelectTicket(t.ticket_id)}
                          className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
                          title="Open Ticket Details (Enter)"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ─── Mobile Responsive Cards View (< md) ─────────────────────────── */}
        <div className="block md:hidden divide-y divide-white/[0.06]">
          {tickets.map((t) => {
            const sla = getSlaStatus(t.created_at, t.status);
            const isSelected = selectedIds.includes(t.ticket_id);

            return (
              <div
                key={t.ticket_id}
                onClick={() => onSelectTicket(t.ticket_id)}
                className={`p-4 transition-colors cursor-pointer ${
                  isSelected ? 'bg-indigo-950/30' : 'hover:bg-zinc-800/40'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => toggleSelect(t.ticket_id, e)}
                      className="text-zinc-400 hover:text-white p-0.5"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-600" />
                      )}
                    </button>
                    <span className="font-mono text-xs font-bold text-zinc-300">
                      {t.ticket_id}
                    </span>
                    {getPriorityBadge(t.priority)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {getStatusBadge(t.status)}
                    {t.is_archived && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        Archived
                      </span>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <h4 className="text-sm font-semibold text-zinc-100 line-clamp-1 mb-1">
                  {t.subject}
                </h4>
                <p className="text-xs text-zinc-400 line-clamp-2 mb-2.5 leading-relaxed">
                  {t.description}
                </p>

                {/* Customer & SLA Info */}
                <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-white/[0.04]">
                  <span className="font-medium text-zinc-300 truncate max-w-[150px]">
                    {t.customer_name}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    <span className={sla.isBreached ? 'text-rose-400' : 'text-zinc-300'}>
                      {sla.text}
                    </span>
                  </div>
                </div>

                {/* Quick actions row */}
                <div
                  className="flex items-center justify-between pt-2.5 mt-2 border-t border-white/[0.04]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <select
                    value={t.status}
                    onChange={(e) =>
                      onQuickStatusChange(t.ticket_id, e.target.value as TicketStatus)
                    }
                    className="bg-zinc-900 border border-zinc-700/80 rounded-lg px-2 py-1 text-xs text-zinc-200 focus:outline-none"
                  >
                    <option value="Open">Set Open</option>
                    <option value="In Progress">Set In Progress</option>
                    <option value="Closed">Set Closed</option>
                  </select>

                  <button
                    onClick={() => onSelectTicket(t.ticket_id)}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Bulk Action Dock when items are checked */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 25 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 rounded-2xl bg-zinc-950/95 border border-white/[0.16] shadow-2xl backdrop-blur-2xl flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-zinc-100 max-w-[95vw]"
          >
            <span className="font-semibold text-white pr-2 border-r border-zinc-700 font-mono">
              {selectedIds.length} selected
            </span>

            <button
              onClick={() => handleBulkStatus('In Progress')}
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold cursor-pointer"
            >
              Set In Progress
            </button>
            <button
              onClick={() => handleBulkStatus('Closed')}
              className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 font-semibold cursor-pointer"
            >
              Set Closed
            </button>
            <button
              onClick={() => handleBulkStatus('Open')}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold cursor-pointer"
            >
              Set Open
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="text-zinc-400 hover:text-white pl-2 border-l border-zinc-700 cursor-pointer"
            >
              Cancel (Esc)
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
