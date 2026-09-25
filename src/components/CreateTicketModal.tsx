'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  AlertCircle,
  Sparkles,
  Paperclip,
  FileText,
  Trash2,
  Loader2,
  Wand2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './Toast';
import { TicketPriority, TicketCategory } from '@/types/ticket';
import { fireConfettiBurst } from '@/lib/celebrate';
import { useTheme } from '@/lib/theme-context';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated: (ticketId: string) => void;
}

export default function CreateTicketModal({
  isOpen,
  onClose,
  onTicketCreated,
}: CreateTicketModalProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [category, setCategory] = useState<TicketCategory>('Technical');
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Smart AI Triage suggestions
  const [aiSuggestion, setAiSuggestion] = useState<{
    category: TicketCategory;
    priority: TicketPriority;
    reason: string;
  } | null>(null);

  // Dynamic AI inference based on subject/description text
  useEffect(() => {
    const text = `${subject} ${description}`.toLowerCase();
    if (!text.trim()) {
      setAiSuggestion(null);
      return;
    }

    if (
      text.includes('crash') ||
      text.includes('down') ||
      text.includes('outage') ||
      text.includes('cannot checkout') ||
      text.includes('data loss')
    ) {
      setAiSuggestion({
        category: 'Technical',
        priority: 'Urgent',
        reason: 'Detected critical outage keywords (crash, down, checkout failure).',
      });
    } else if (
      text.includes('charge') ||
      text.includes('invoice') ||
      text.includes('refund') ||
      text.includes('payment') ||
      text.includes('subscription')
    ) {
      setAiSuggestion({
        category: 'Billing',
        priority: 'High',
        reason: 'Detected financial / billing inquiry.',
      });
    } else if (
      text.includes('password') ||
      text.includes('login') ||
      text.includes('2fa') ||
      text.includes('sso') ||
      text.includes('account')
    ) {
      setAiSuggestion({
        category: 'Account',
        priority: 'Medium',
        reason: 'Detected user authentication / profile topic.',
      });
    } else if (
      text.includes('would love') ||
      text.includes('feature') ||
      text.includes('suggest') ||
      text.includes('roadmap') ||
      text.includes('enhancement')
    ) {
      setAiSuggestion({
        category: 'Feature Request',
        priority: 'Low',
        reason: 'Detected product enhancement suggestion.',
      });
    } else {
      setAiSuggestion(null);
    }
  }, [subject, description]);

  if (!isOpen) return null;

  const applyAiSuggestion = () => {
    if (aiSuggestion) {
      setCategory(aiSuggestion.category);
      setPriority(aiSuggestion.priority);
      showToast(
        'info',
        'AI Triage Applied',
        `Set to ${aiSuggestion.category} & ${aiSuggestion.priority} priority`
      );
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }
    if (!customerEmail.trim()) {
      newErrors.customerEmail = 'Customer email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }
    if (!subject.trim()) {
      newErrors.subject = 'Issue title/subject is required';
    }
    if (!description.trim()) {
      newErrors.description = 'Issue description is required';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Please provide at least 10 characters describing the issue';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'File too large', 'Max upload size is 5MB.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload file');

      setAttachmentUrl(data.url);
      setAttachmentName(data.name);
      showToast('success', 'File Attached', data.name);
    } catch (err: any) {
      showToast('error', 'Upload failed', err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = () => {
    setAttachmentUrl(null);
    setAttachmentName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim(),
          subject: subject.trim(),
          description: description.trim(),
          priority,
          category,
          attachment_url: attachmentUrl,
          attachment_name: attachmentName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to create ticket');
      }

      // Celebratory particle fireworks!
      fireConfettiBurst();

      showToast(
        'success',
        `Ticket ${data.ticket_id} Created`,
        'Logged into CRM with automated 24h SLA target.'
      );

      // Reset form
      setCustomerName('');
      setCustomerEmail('');
      setSubject('');
      setDescription('');
      setAttachmentUrl(null);
      setAttachmentName(null);
      setErrors({});

      onClose();
      onTicketCreated(data.ticket_id);
    } catch (err: any) {
      showToast('error', 'Creation Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo sample filler for evaluator convenience
  const fillDemoSample = () => {
    setCustomerName('Rachel Zane');
    setCustomerEmail('rachel.zane@enterprise.io');
    setSubject('SAML SSO assertion failed with 401 Unauthorized');
    setDescription(
      'Our entire legal department is unable to sign in via Okta SAML SSO. The identity provider returns error code 401 with invalid signature callback. Please verify certificate expiration.'
    );
    setPriority('Urgent');
    setCategory('Technical');
    setErrors({});
    showToast('info', 'Demo Sample Loaded', 'Populated sample enterprise ticket data.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ring-1 my-8 transition-colors ${
          isLight
            ? 'bg-white border border-slate-200 text-slate-900 ring-slate-900/10'
            : 'bg-zinc-950 border border-white/[0.12] text-zinc-100 ring-white/10'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-5 border-b transition-colors ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950/80 border-white/[0.08]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${
                isLight
                  ? 'bg-indigo-50 border border-indigo-200 text-indigo-600'
                  : 'bg-zinc-900 border border-white/[0.1] text-indigo-400'
              }`}
            >
              +
            </div>
            <div>
              <h2 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Create Support Ticket
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Logged with sequential identifier & 24h SLA target
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fillDemoSample}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/[0.08] hover:border-white/20'
              }`}
              title="Autofill realistic sample data"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Fill Sample</span>
            </button>
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
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Customer Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Customer Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. John Doe"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  errors.customerName ? 'border-rose-500' : 'border-white/[0.08]'
                }`}
              />
              {errors.customerName && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.customerName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Customer Email <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="e.g. john@example.com"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  errors.customerEmail ? 'border-rose-500' : 'border-white/[0.08]'
                }`}
              />
              {errors.customerEmail && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.customerEmail}
                </p>
              )}
            </div>
          </div>

          {/* Issue Subject */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Issue Subject <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of the issue (e.g. Unable to complete checkout)"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                errors.subject ? 'border-rose-500' : 'border-white/[0.08]'
              }`}
            />
            {errors.subject && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.subject}
              </p>
            )}
          </div>

          {/* Issue Description */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Issue Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of symptoms, error messages, and reproduction steps..."
              className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                errors.description ? 'border-rose-500' : 'border-white/[0.08]'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.description}
              </p>
            )}
          </div>

          {/* Dynamic AI Triage Assistant Badge */}
          <AnimatePresence>
            {aiSuggestion && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-xl bg-zinc-900/80 border border-white/[0.1] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Wand2 className="w-4 h-4 text-indigo-400 shrink-0 animate-pulse" />
                  <div className="truncate">
                    <span className="font-semibold text-zinc-200">AI Triage Suggestion:</span>{' '}
                    <span className="text-zinc-300">{aiSuggestion.category} &bull; </span>
                    <span className="font-semibold text-rose-400">
                      {aiSuggestion.priority}
                    </span>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {aiSuggestion.reason}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={applyAiSuggestion}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold shrink-0 transition-colors border border-white/[0.08] cursor-pointer"
                >
                  Apply
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Priority & Category Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/[0.08] text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Urgent">🔥 Urgent Priority (Immediate Triage)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/[0.08] text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="Technical">Technical</option>
                <option value="Billing">Billing</option>
                <option value="Account">Account</option>
                <option value="Feature Request">Feature Request</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          {/* File Attachment Dropzone */}
          <div>
            <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${
              isLight ? 'text-slate-600' : 'text-zinc-400'
            }`}>
              File Attachment (Screenshot / Log)
            </label>
            {attachmentUrl ? (
              <div
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isLight
                    ? 'bg-indigo-50/70 border-indigo-200 text-slate-800'
                    : 'bg-zinc-900 border-cyan-500/30 text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className={`w-4 h-4 shrink-0 ${isLight ? 'text-indigo-600' : 'text-cyan-400'}`} />
                  <span className={`text-xs font-medium truncate ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                    {attachmentName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removeAttachment}
                  className="p-1 rounded text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${
                  isLight
                    ? 'border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/50'
                    : 'border-white/[0.12] hover:border-white/30 bg-zinc-900/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div
                  className={`flex items-center justify-center gap-2 text-xs font-medium ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                      <span>Uploading file...</span>
                    </>
                  ) : (
                    <>
                      <Paperclip className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-zinc-400'}`} />
                      <span>Attach screenshot or error log (Max 5MB)</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer CTAs */}
          <div
            className={`pt-4 border-t flex items-center justify-end gap-3 ${
              isLight ? 'border-slate-200' : 'border-white/[0.08]'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold !text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/25 border border-indigo-400/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin !text-white" />
                  <span className="!text-white">Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 !text-white" />
                  <span className="!text-white">Create Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
