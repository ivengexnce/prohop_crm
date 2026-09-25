'use client';

import React from 'react';
import { TicketItem, TicketStatus } from '@/types/ticket';
import { getSlaStatus } from '@/lib/date-utils';
import {
  Clock,
  MessageSquare,
  Paperclip,
  Flame,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Copy,
  Check,
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import SpotlightCard from './SpotlightCard';

interface KanbanBoardProps {
  tickets: TicketItem[];
  onSelectTicket: (ticketId: string) => void;
  onQuickStatusChange: (ticketId: string, newStatus: TicketStatus) => void;
  onOpenCreateModal?: () => void;
}

export default function KanbanBoard({
  tickets,
  onSelectTicket,
  onQuickStatusChange,
  onOpenCreateModal: _onOpenCreateModal,
}: KanbanBoardProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ticketId);
    setCopiedId(ticketId);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const columns: {
    status: TicketStatus;
    label: string;
    icon: any;
    dotColor: string;
    badgeStyle: string;
    borderAccent: string;
    spotlight: string;
  }[] = [
    {
      status: 'Open',
      label: 'Open Backlog',
      icon: Clock,
      dotColor: 'bg-amber-400',
      badgeStyle: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      borderAccent: 'border-t-amber-500/80',
      spotlight: 'rgba(245, 158, 11, 0.1)',
    },
    {
      status: 'In Progress',
      label: 'In Progress',
      icon: TrendingUp,
      dotColor: 'bg-sky-400',
      badgeStyle: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      borderAccent: 'border-t-sky-500/80',
      spotlight: 'rgba(14, 165, 233, 0.1)',
    },
    {
      status: 'Closed',
      label: 'Resolved & Closed',
      icon: CheckCircle2,
      dotColor: 'bg-emerald-400',
      badgeStyle: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      borderAccent: 'border-t-emerald-500/80',
      spotlight: 'rgba(16, 185, 129, 0.1)',
    },
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <Flame className="w-2.5 h-2.5 text-rose-400" />
            Urgent
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Medium
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/60">
            Low
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {columns.map((col) => {
        const colTickets = tickets.filter(
          (t) => t.status.toLowerCase() === col.status.toLowerCase()
        );
        const Icon = col.icon;

        return (
          <div
            key={col.status}
            className={`flex flex-col rounded-2xl glass-panel p-3.5 sm:p-4 min-h-[580px] border-t-2 ${col.borderAccent} shadow-xl`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1 py-2 mb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                <h3 className="text-xs sm:text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-zinc-400" />
                  {col.label}
                </h3>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold border ${col.badgeStyle}`}
              >
                {colTickets.length}
              </span>
            </div>

            {/* Ticket Cards List */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-0.5">
              <AnimatePresence mode="popLayout">
                {colTickets.length === 0 ? (
                  <div className="py-20 text-center border border-dashed border-white/[0.08] rounded-xl my-4 text-zinc-500 text-xs">
                    <p className="font-medium text-zinc-400">Empty Lane</p>
                    <p className="text-[11px] mt-1 text-zinc-500">
                      No active tickets in this lifecycle stage
                    </p>
                  </div>
                ) : (
                  colTickets.map((t) => {
                    const sla = getSlaStatus(t.created_at, t.status);

                    return (
                      <SpotlightCard
                        key={t.ticket_id}
                        spotlightColor={col.spotlight}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.94 }}
                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                        onClick={() => onSelectTicket(t.ticket_id)}
                        className="group p-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/90 border border-white/[0.08] hover:border-white/20 shadow-md transition-all cursor-pointer relative overflow-hidden"
                      >
                        {/* Top ID & Priority Row */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-semibold text-zinc-300 group-hover:text-white">
                              {t.ticket_id}
                            </span>
                            <button
                              onClick={(e) => handleCopy(t.ticket_id, e)}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-opacity cursor-pointer"
                              title="Copy ID"
                            >
                              {copiedId === t.ticket_id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <div className="flex items-center gap-1">
                            {getPriorityBadge(t.priority)}
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium">
                              {t.category}
                            </span>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h4 className="text-xs sm:text-sm font-semibold text-zinc-100 group-hover:text-white line-clamp-1 mb-1 transition-colors">
                          {t.subject}
                        </h4>
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                          {t.description}
                        </p>

                        {/* Customer & SLA Row */}
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-white/[0.06]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 font-bold text-[10px] flex items-center justify-center shrink-0 border border-white/[0.08]">
                              {t.customer_name.charAt(0)}
                            </div>
                            <span className="truncate text-zinc-300 font-medium">
                              {t.customer_name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {t.attachment_url && (
                              <Paperclip className="w-3 h-3 text-cyan-400" />
                            )}
                            {(t.notes_count ?? 0) > 0 && (
                              <span className="flex items-center gap-0.5 text-zinc-400 font-mono text-[10px]">
                                <MessageSquare className="w-3 h-3 text-indigo-400" />
                                {t.notes_count}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bottom SLA & Quick Move Action Controls */}
                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/[0.04]">
                          <span
                            className={`text-[10px] font-semibold flex items-center gap-1 ${
                              sla.isBreached
                                ? 'text-rose-400'
                                : col.status === 'Closed'
                                ? 'text-zinc-500'
                                : 'text-zinc-300'
                            }`}
                          >
                            <Clock className="w-2.5 h-2.5" />
                            {sla.text}
                          </span>

                          {/* Quick Lane Transition Buttons */}
                          <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {col.status !== 'Open' && (
                              <button
                                onClick={() =>
                                  onQuickStatusChange(
                                    t.ticket_id,
                                    col.status === 'Closed' ? 'In Progress' : 'Open'
                                  )
                                }
                                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                title="Move to previous status"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            )}

                            {col.status !== 'Closed' && (
                              <button
                                onClick={() =>
                                  onQuickStatusChange(
                                    t.ticket_id,
                                    col.status === 'Open' ? 'In Progress' : 'Closed'
                                  )
                                }
                                className="p-1 rounded bg-zinc-800 hover:bg-indigo-600 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                                title="Move to next status"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </SpotlightCard>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
