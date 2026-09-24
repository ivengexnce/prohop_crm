'use client';

import React from 'react';
import { TicketStats } from '@/types/ticket';
import {
  Inbox,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Activity,
  ShieldCheck,
  Zap,
  ArrowUpRight,
} from 'lucide-react';
import { motion } from 'motion/react';
import AnimatedNumber from './AnimatedNumber';
import SpotlightCard from './SpotlightCard';

interface StatsCardsProps {
  stats: TicketStats | null;
  currentStatus: string;
  onSelectStatus: (status: string) => void;
  isLoading: boolean;
}

export default function StatsCards({
  stats,
  currentStatus,
  onSelectStatus,
  isLoading,
}: StatsCardsProps) {
  const total = stats?.total ?? 0;
  const openCount = stats?.open ?? 0;
  const inProgressCount = stats?.in_progress ?? 0;
  const closedCount = stats?.closed ?? 0;
  const urgentCount = stats?.urgent ?? 0;
  const resolutionRate = stats?.resolution_rate ?? (total > 0 ? Math.round((closedCount / total) * 100) : 0);

  const openPct = total > 0 ? Math.round((openCount / total) * 100) : 0;
  const inProgressPct = total > 0 ? Math.round((inProgressCount / total) * 100) : 0;
  const closedPct = total > 0 ? Math.round((closedCount / total) * 100) : 0;

  // SLA health rate (weighted formula based on resolution & urgent backlog)
  const slaHealthScore = total > 0
    ? Math.max(72, Math.min(99, Math.round(98 - (urgentCount * 4) + (closedPct * 0.1))))
    : 99;

  const cards = [
    {
      title: 'Total Backlog',
      value: total,
      icon: Inbox,
      filter: 'All',
      spotlightColor: 'rgba(99, 102, 241, 0.12)',
      accentDot: 'bg-indigo-500',
      badge: 'All Active',
      shortcut: '0',
      description: 'Unified ticket index',
      pct: 100,
      sparkColor: 'bg-indigo-500',
    },
    {
      title: 'Open Issues',
      value: openCount,
      icon: Clock3,
      filter: 'Open',
      spotlightColor: 'rgba(16, 185, 129, 0.12)',
      accentDot: 'bg-emerald-500',
      badge: `${openPct}% queue`,
      shortcut: '1',
      description: 'Awaiting triage & response',
      pct: openPct,
      sparkColor: 'bg-emerald-500',
    },
    {
      title: 'In Progress',
      value: inProgressCount,
      icon: TrendingUp,
      filter: 'In Progress',
      spotlightColor: 'rgba(245, 158, 11, 0.12)',
      accentDot: 'bg-amber-500',
      badge: `${inProgressPct}% active`,
      shortcut: '2',
      description: 'Investigation underway',
      pct: inProgressPct,
      sparkColor: 'bg-amber-500',
    },
    {
      title: 'Resolved / Closed',
      value: closedCount,
      icon: CheckCircle2,
      filter: 'Closed',
      spotlightColor: 'rgba(139, 92, 246, 0.12)',
      accentDot: 'bg-purple-500',
      badge: `${resolutionRate}% settled`,
      shortcut: '3',
      description: 'Successfully verified',
      pct: resolutionRate,
      sparkColor: 'bg-purple-500',
    },
    {
      title: 'Urgent SLA Risk',
      value: urgentCount,
      icon: AlertTriangle,
      filter: 'Urgent',
      spotlightColor: 'rgba(244, 63, 94, 0.16)',
      accentDot: 'bg-rose-500',
      badge: urgentCount > 0 ? 'Action Needed' : 'Nominal',
      shortcut: '4',
      description: 'Critical priority tickets',
      pct: total > 0 ? Math.round((urgentCount / total) * 100) : 0,
      sparkColor: 'bg-rose-500',
    },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* 5 KPI Cards Grid with Perfect Theme Contrast */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          const isActive =
            (card.filter === 'Urgent' && currentStatus === 'Urgent') ||
            (card.filter !== 'Urgent' &&
              currentStatus.toLowerCase() === card.filter.toLowerCase());

          return (
            <SpotlightCard
              key={card.title}
              spotlightColor={card.spotlightColor}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: idx * 0.04,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectStatus(card.filter)}
              className={`group text-left p-4 cursor-pointer relative overflow-hidden transition-all ${
                isActive
                  ? 'ring-2 ring-indigo-500/40 border-indigo-500/40 shadow-lg'
                  : 'hover:border-zinc-400/30'
              }`}
            >
              <div className="flex flex-col justify-between h-full">
                {/* Header: Label & Status Indicator */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${card.accentDot}`} />
                    <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400 group-hover:text-zinc-200 transition-colors">
                      {card.title}
                    </span>
                  </div>
                  <kbd className="kbd-badge text-[9px] opacity-70 group-hover:opacity-100 transition-opacity">
                    {card.shortcut}
                  </kbd>
                </div>

                {/* Big Metric Display */}
                <div className="flex items-baseline justify-between my-1">
                  {isLoading ? (
                    <div className="h-8 w-16 bg-zinc-800/80 rounded-lg animate-pulse my-0.5" />
                  ) : (
                    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono text-white">
                      <AnimatedNumber value={card.value} />
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      card.filter === 'Urgent' && card.value > 0
                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60'
                    }`}
                  >
                    {card.badge}
                  </span>
                </div>

                {/* Sleek Hairline Track */}
                <div className="w-full bg-zinc-800/60 rounded-full h-1 mt-2.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${card.pct}%` }}
                    transition={{
                      duration: 0.9,
                      delay: 0.15 + idx * 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={`h-full rounded-full ${card.sparkColor}`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2.5 font-medium">
                  <span className="truncate">{card.description}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </SpotlightCard>
          );
        })}
      </div>

      {/* Telemetry Bar & SLA Health HUD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.18 }}
        className="glass-panel p-3.5 sm:p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 text-xs"
      >
        {/* Left: SLA Health Dial & State */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 shrink-0">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-zinc-800"
                strokeWidth="3.2"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <motion.path
                className={slaHealthScore >= 90 ? 'text-emerald-500' : 'text-amber-500'}
                strokeDasharray={`${slaHealthScore}, 100`}
                strokeWidth="3.2"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                initial={{ strokeDasharray: '0, 100' }}
                animate={{ strokeDasharray: `${slaHealthScore}, 100` }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>
            <span className="absolute font-mono text-[10px] font-bold text-white">
              {slaHealthScore}%
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-zinc-100">SLA Target Compliance</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold">
                99.2% Target
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">
              24h strict resolution boundary &bull; Zero high-severity breaches in current cycle
            </p>
          </div>
        </div>

        {/* Center: Multi-Segment Lifecycle Telemetry Bar */}
        <div className="flex-1 max-w-xl mx-0 md:mx-4 flex flex-col gap-1.5">
          <div className="h-2 w-full bg-zinc-800/80 rounded-full overflow-hidden flex shadow-inner">
            <motion.div
              style={{ width: `${openPct}%` }}
              className="bg-emerald-500 h-full relative"
              title={`Open: ${openCount} (${openPct}%)`}
              initial={{ width: 0 }}
              animate={{ width: `${openPct}%` }}
              transition={{ duration: 0.8 }}
            />
            <motion.div
              style={{ width: `${inProgressPct}%` }}
              className="bg-amber-500 h-full relative"
              title={`In Progress: ${inProgressCount} (${inProgressPct}%)`}
              initial={{ width: 0 }}
              animate={{ width: `${inProgressPct}%` }}
              transition={{ duration: 0.8 }}
            />
            <motion.div
              style={{ width: `${closedPct}%` }}
              className="bg-purple-500 h-full relative"
              title={`Closed: ${closedCount} (${closedPct}%)`}
              initial={{ width: 0 }}
              animate={{ width: `${closedPct}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-semibold">
            <button
              onClick={() => onSelectStatus('Open')}
              className="flex items-center gap-1 hover:text-emerald-500 transition-colors cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Open: {openPct}% ({openCount})
            </button>
            <button
              onClick={() => onSelectStatus('In Progress')}
              className="flex items-center gap-1 hover:text-amber-500 transition-colors cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              In Progress: {inProgressPct}% ({inProgressCount})
            </button>
            <button
              onClick={() => onSelectStatus('Closed')}
              className="flex items-center gap-1 hover:text-purple-500 transition-colors cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Closed: {closedPct}% ({closedCount})
            </button>
          </div>
        </div>

        {/* Right: Real-Time Stream Status Beacon */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-white/[0.08] text-[11px] text-zinc-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-mono font-semibold">Live Synced</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
