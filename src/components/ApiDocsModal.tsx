'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Copy, Check, Terminal, RefreshCw, Database, Zap, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './Toast';
import type { EndpointDoc } from '@/app/api/docs/route';

// ─── Types & Constants ────────────────────────────────────────────────────────

interface ApiDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const METHOD_BADGE: Record<string, string> = {
  GET: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  POST: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  PUT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  DELETE: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/[0.06] space-y-3 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-12 h-5 rounded bg-zinc-800" />
        <div className="w-52 h-5 rounded bg-zinc-800" />
        <div className="w-10 h-4 rounded-full bg-zinc-800" />
      </div>
      <div className="w-full h-3 rounded bg-zinc-800/60" />
      <div className="w-4/5 h-3 rounded bg-zinc-800/60" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        <div className="h-24 rounded-xl bg-zinc-950" />
        <div className="h-24 rounded-xl bg-zinc-950" />
      </div>
    </div>
  );
}

interface LiveBadgeProps { isLive: boolean }
function LiveBadge({ isLive }: LiveBadgeProps) {
  return isLive ? (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
      <Database className="w-2.5 h-2.5" />
      Live DB
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-semibold">
      <Zap className="w-2.5 h-2.5" />
      Example
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ApiDocsModal({ isOpen, onClose }: ApiDocsModalProps) {
  const { showToast } = useToast();

  const [endpoints, setEndpoints] = useState<EndpointDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/docs', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data: EndpointDoc[] = await res.json();
      setEndpoints(data);
      setLastFetched(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchDocs();
  }, [isOpen, fetchDocs]);

  // ── Clipboard ──────────────────────────────────────────────────────────────

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => { });
    setCopiedId(id);
    showToast('info', 'cURL command copied to clipboard');
    setTimeout(() => setCopiedId(null), 1800);
  };

  // ── Derived stats ──────────────────────────────────────────────────────────

  const liveCount = endpoints.filter(e => e.isLive).length;

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 450, damping: 28 }}
        className="relative w-full max-w-4xl bg-zinc-950 border border-white/[0.12] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ring-1 ring-white/10"
        onClick={e => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-zinc-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-indigo-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                REST API Reference
              </h3>
              <p className="text-xs text-zinc-400">
                {loading && endpoints.length === 0
                  ? 'Fetching live responses from database…'
                  : lastFetched
                    ? `${liveCount} of ${endpoints.length} responses live &bull; refreshed ${lastFetched.toLocaleTimeString()}`
                    : 'Live responses fetched from the database on every open'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!loading && liveCount > 0 && (
              <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {liveCount} live
              </span>
            )}

            <button
              onClick={fetchDocs}
              disabled={loading}
              title="Refresh live responses from database"
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4 bg-zinc-950/40">

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold">Could not load API docs:</span> {error}
                  <button
                    onClick={fetchDocs}
                    className="ml-2 underline font-medium hover:no-underline cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading skeleton */}
          {loading && endpoints.length === 0 && (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Endpoint cards */}
          {endpoints.map((ep, idx) => (
            <motion.div
              key={ep.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.045, duration: 0.25 }}
              className="p-4 rounded-xl bg-zinc-900/60 border border-white/[0.08] shadow-sm space-y-3"
            >
              {/* Row 1: method + path + live badge + copy button */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono border ${
                      METHOD_BADGE[ep.method] ?? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <code className="text-xs sm:text-sm font-mono font-bold text-zinc-100">
                    {ep.path}
                  </code>
                  <LiveBadge isLive={ep.isLive} />
                </div>

                <button
                  onClick={() => copy(ep.curl, ep.id)}
                  className="flex items-center gap-1 text-xs text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-white/[0.08] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  {copiedId === ep.id ? (
                    <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400 font-medium">Copied</span></>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /><span>Copy cURL</span></>
                  )}
                </button>
              </div>

              {/* Row 2: description */}
              <p className="text-xs text-zinc-400 leading-relaxed">{ep.description}</p>

              {/* Row 3: code panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                {/* cURL panel */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-1">
                    Terminal cURL
                  </span>
                  <pre className="p-3 rounded-xl bg-zinc-950 text-cyan-300 border border-white/[0.06] overflow-x-auto whitespace-pre-wrap shadow-inner text-[11px] leading-relaxed">
                    {ep.curl}
                  </pre>
                </div>

                {/* Response panel */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1 flex items-center gap-1">
                    {ep.isLive
                      ? <><Database className="w-2.5 h-2.5 text-emerald-400" />Live Response from Database</>
                      : 'Example Response'
                    }
                  </span>
                  <pre
                    className={`p-3 rounded-xl bg-zinc-950 border border-white/[0.06] overflow-x-auto whitespace-pre-wrap shadow-inner text-[11px] leading-relaxed ${
                      ep.isLive ? 'text-emerald-400' : 'text-zinc-400'
                    }`}
                  >
                    <span className={loading ? 'opacity-40 transition-opacity' : 'transition-opacity'}>
                      {ep.response}
                    </span>
                  </pre>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-3 border-t border-white/[0.08] bg-zinc-950/80 flex items-center justify-between shrink-0">
          <span className="text-xs text-zinc-400 font-mono">
            {lastFetched
              ? `Live responses fetched at ${lastFetched.toLocaleTimeString()}`
              : ''}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-white/[0.08] rounded-xl transition-all cursor-pointer"
          >
            Close (Esc)
          </button>
        </div>
      </motion.div>
    </div>
  );
}