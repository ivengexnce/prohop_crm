'use client';

import React, { useState, useEffect } from 'react';
import { TicketDetail, TicketStatus, NoteItem } from '@/types/ticket';
import { formatRelativeTime, formatFullDate, getSlaStatus } from '@/lib/date-utils';
import {
  X,
  Clock,
  User,
  Mail,
  Send,
  Lock,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  RefreshCw,
  Paperclip,
  ExternalLink,
  Activity,
  Flame,
  Sparkles,
  Zap,
  Archive,
  ArchiveRestore,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './Toast';
import { fireConfettiBurst } from '@/lib/celebrate';

interface TicketDetailModalProps {
  ticketId: string | null;
  onClose: () => void;
  onTicketUpdated: () => void;
}

export default function TicketDetailModal({
  ticketId,
  onClose,
  onTicketUpdated,
}: TicketDetailModalProps) {
  const { showToast } = useToast();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [authorName, setAuthorName] = useState('Support Agent');
  const [copiedId, setCopiedId] = useState(false);

  // Quick reply snippet templates
  const quickSnippets = [
    'Investigating backend error logs; credentials verified.',
    'Issue reproduced on staging environment. Engineering deploying hotfix.',
    'Customer informed of resolution. Awaiting final confirmation.',
    'Payment gateway webhooks reconciled. Account balance restored.',
  ];

  const fetchTicketDetails = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tickets/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch ticket');
      }
      const data = await res.json();
      setTicket(data);
    } catch (err: any) {
      showToast('error', 'Error loading ticket details', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails(ticketId);
    } else {
      setTicket(null);
    }
  }, [ticketId]);

  if (!ticketId) return null;

  // Change Ticket Status
  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket || ticket.status === newStatus) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.ticket_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          author: authorName || 'Support Agent',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      showToast(
        'success',
        `Ticket marked as ${newStatus}`,
        `Audit record updated for ${ticket.ticket_id}`
      );

      // Trigger Confetti celebration if resolved to Closed!
      if (newStatus === 'Closed') {
        fireConfettiBurst();
      }

      await fetchTicketDetails(ticket.ticket_id);
      onTicketUpdated();
    } catch (err: any) {
      showToast('error', 'Status update failed', err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Soft Delete / Archive Ticket Toggle
  const handleArchiveToggle = async () => {
    if (!ticket) return;
    setIsArchiving(true);
    try {
      if (ticket.is_archived) {
        const res = await fetch(`/api/tickets/${ticket.ticket_id}/restore`, {
          method: 'POST',
        });
        if (!res.ok) throw new Error('Failed to restore ticket');
        showToast('success', 'Ticket Restored', 'Ticket restored to active queue.');
      } else {
        const res = await fetch(`/api/tickets/${ticket.ticket_id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to archive ticket');
        showToast('info', 'Ticket Archived', 'Ticket soft-deleted and archived.');
      }
      await fetchTicketDetails(ticket.ticket_id);
      onTicketUpdated();
    } catch (err: any) {
      showToast('error', 'Archival action failed', err.message);
    } finally {
      setIsArchiving(false);
    }
  };

  // Add Comment / Investigation Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !ticket) return;

    setIsSubmittingNote(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.ticket_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: noteText.trim(),
          is_internal: isInternal,
          author: authorName.trim() || 'Support Agent',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to add note');
      }

      setNoteText('');
      showToast(
        'success',
        isInternal ? 'Internal Note Posted' : 'Public Reply Added',
        'Saved to ticket activity timeline.'
      );

      await fetchTicketDetails(ticket.ticket_id);
      onTicketUpdated();
    } catch (err: any) {
      showToast('error', 'Failed to add note', err.message);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleCopyId = () => {
    if (!ticket) return;
    navigator.clipboard.writeText(ticket.ticket_id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const sla = ticket ? getSlaStatus(ticket.created_at, ticket.status) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl bg-zinc-950 border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10 my-8 flex flex-col max-h-[90vh]"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] bg-zinc-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-sm sm:text-base font-bold text-zinc-100">
                {ticket?.ticket_id || ticketId}
              </span>
              <button
                onClick={handleCopyId}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Copy ticket ID"
              >
                {copiedId ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            {ticket && (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/80">
                {ticket.category}
              </span>
            )}
            {ticket?.is_archived && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                <Archive className="w-3 h-3" />
                Archived
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {ticket && sla && (
              <span
                className={`hidden md:flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  sla.isBreached
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    : ticket.status === 'Closed'
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                <Clock className="w-3 h-3" />
                {sla.text}
              </span>
            )}

            {/* Archive / Restore Button */}
            {ticket && (
              <button
                onClick={handleArchiveToggle}
                disabled={isArchiving}
                className="p-1.5 rounded-lg border border-white/[0.08] hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs flex items-center gap-1 transition-all cursor-pointer"
                title={ticket.is_archived ? 'Restore Ticket' : 'Archive Ticket'}
              >
                {ticket.is_archived ? (
                  <>
                    <ArchiveRestore className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Restore</span>
                  </>
                ) : (
                  <>
                    <Archive className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="hidden sm:inline">Archive</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-white/[0.08] hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
            <p className="text-xs text-zinc-400">Loading incident data...</p>
          </div>
        ) : !ticket ? (
          <div className="p-8 text-center text-zinc-400">Unable to load ticket details.</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Quick Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-medium">Status Transition:</span>
                <div className="flex items-center gap-1.5">
                  {(['Open', 'In Progress', 'Closed'] as TicketStatus[]).map((s) => {
                    const isActive = ticket.status === s;
                    return (
                      <button
                        key={s}
                        disabled={isUpdatingStatus}
                        onClick={() => handleStatusChange(s)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                          isActive
                            ? s === 'Open'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                              : s === 'In Progress'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                            : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700/80 border border-white/[0.04]'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <span>
                  Priority:{' '}
                  <strong className="text-zinc-200 font-semibold">{ticket.priority}</strong>
                </span>
                <span>&bull;</span>
                <span>
                  Org:{' '}
                  <strong className="text-zinc-200 font-semibold">
                    {ticket.organization_id || 'org_default'}
                  </strong>
                </span>
              </div>
            </div>

            {/* Ticket Subject & Description Card */}
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {ticket.subject}
              </h2>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-zinc-400 border-b border-white/[0.06] pb-3">
                <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  {ticket.customer_name}
                </span>
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  {ticket.customer_email}
                </span>
                <span className="text-zinc-500">
                  Created {formatFullDate(ticket.created_at)}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/[0.06] text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </div>

              {/* Attachment Preview if present */}
              {ticket.attachment_url && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-900/60 border border-white/[0.08] text-xs">
                  <Paperclip className="w-4 h-4 text-indigo-400" />
                  <span className="text-zinc-300 font-medium truncate flex-1">
                    {ticket.attachment_name || 'Attached file'}
                  </span>
                  <a
                    href={ticket.attachment_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Incident Activity Timeline */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Activity & Audit Timeline ({ticket.notes.length})
                  </h3>
                </div>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {ticket.notes.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-3 text-center italic">
                    No notes or activity recorded yet.
                  </p>
                ) : (
                  ticket.notes.map((note) => {
                    const isAudit = note.activity_type === 'status_change';
                    const isSlaEscalation = note.activity_type === 'sla_escalation';

                    return (
                      <div
                        key={note.id}
                        className={`p-3.5 rounded-xl border text-xs leading-relaxed transition-all ${
                          isSlaEscalation
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                            : isAudit
                            ? 'bg-zinc-900/60 border-white/[0.08] text-zinc-300'
                            : note.is_internal
                            ? 'bg-amber-500/5 border-amber-500/20 text-zinc-200'
                            : 'bg-zinc-900/80 border-white/[0.08] text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{note.author}</span>
                            {isSlaEscalation ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                                <Zap className="w-2.5 h-2.5 text-amber-400" />
                                SLA Daemon
                              </span>
                            ) : isAudit ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                                <Activity className="w-2.5 h-2.5" />
                                Audit Log
                              </span>
                            ) : note.is_internal ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                Internal Note
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                                Public Reply
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {formatRelativeTime(note.created_at)}
                          </span>
                        </div>
                        <p className="text-zinc-300 whitespace-pre-wrap">{note.note_text}</p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add Note Form with Quick Snippets */}
              <form
                onSubmit={handleAddNote}
                className="p-4 rounded-xl bg-zinc-900/80 border border-white/[0.08] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300">
                    Add Activity or Internal Note
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="rounded border-zinc-700 text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>Internal team note</span>
                    </label>
                  </div>
                </div>

                {/* Quick Response Snippets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-zinc-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    Snippets:
                  </span>
                  {quickSnippets.map((snip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNoteText(snip)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-white/[0.06] transition-colors cursor-pointer truncate max-w-xs"
                      title={snip}
                    >
                      {snip}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder={
                    isInternal
                      ? 'Type confidential engineering investigation notes (visible only to team)...'
                      : 'Type response to customer or general update...'
                  }
                  className="w-full p-3 rounded-xl bg-zinc-950 border border-white/[0.08] text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />

                <div className="flex items-center justify-between pt-1">
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Author name"
                    className="px-2.5 py-1 text-xs rounded-lg bg-zinc-950 border border-white/[0.08] text-zinc-300 w-36 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingNote || !noteText.trim()}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingNote ? 'Posting...' : 'Post Note'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
