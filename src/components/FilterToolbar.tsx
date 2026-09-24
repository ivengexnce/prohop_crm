'use client';

import React from 'react';
import {
  Search,
  X,
  Download,
  RotateCcw,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  Clock,
  TrendingUp,
  Filter,
  Archive,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '@/lib/theme-context';

interface FilterToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  priorityFilter: string;
  onPriorityChange: (priority: string) => void;
  categoryFilter: string;
  onCategoryChange: (category: string) => void;
  sortOrder: string;
  onSortChange: (sort: string) => void;
  onExportCsv: () => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
  isExporting: boolean;
  viewMode: 'table' | 'kanban';
  onViewModeChange: (mode: 'table' | 'kanban') => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

export default function FilterToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  categoryFilter,
  onCategoryChange,
  sortOrder,
  onSortChange,
  onExportCsv,
  onResetFilters,
  totalFilteredCount,
  isExporting,
  viewMode,
  onViewModeChange,
  searchInputRef,
}: FilterToolbarProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Creative Color Psychology:
  // All -> Royal Indigo (Executive vision & clarity)
  // Open -> Solar Amber (Active vigilance & triage alertness)
  // In Progress -> Electric Azure/Sky (Deep focus & velocity)
  // Closed -> Lush Emerald (Operational peace & resolution)
  // Archived -> Slate (Cold archival memory)
  const statusOptions = [
    {
      label: 'All Records',
      value: 'All',
      icon: SlidersHorizontal,
      activeLight: 'bg-indigo-50 border-indigo-200 text-indigo-950 font-bold shadow-xs',
      activeDark: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-200 font-semibold',
      iconColor: 'text-indigo-500',
      pulseDot: null,
    },
    {
      label: 'Open',
      value: 'Open',
      icon: Clock,
      activeLight: 'bg-amber-50 border-amber-300 text-amber-950 font-bold shadow-xs ring-1 ring-amber-400/20',
      activeDark: 'bg-amber-500/20 border-amber-500/40 text-amber-200 font-semibold',
      iconColor: 'text-amber-500',
      pulseDot: 'bg-amber-500',
    },
    {
      label: 'In Progress',
      value: 'In Progress',
      icon: TrendingUp,
      activeLight: 'bg-sky-50 border-sky-300 text-sky-950 font-bold shadow-xs ring-1 ring-sky-400/20',
      activeDark: 'bg-sky-500/20 border-sky-500/40 text-sky-200 font-semibold',
      iconColor: 'text-sky-500',
      pulseDot: 'bg-sky-500',
    },
    {
      label: 'Closed',
      value: 'Closed',
      icon: CheckCircle2,
      activeLight: 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-400/20',
      activeDark: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200 font-semibold',
      iconColor: 'text-emerald-500',
      pulseDot: null,
    },
    {
      label: 'Archived',
      value: 'Archived',
      icon: Archive,
      activeLight: 'bg-slate-100 border-slate-300 text-slate-800 font-bold shadow-xs',
      activeDark: 'bg-zinc-800 border-zinc-700 text-zinc-200 font-semibold',
      iconColor: 'text-slate-500',
      pulseDot: null,
    },
  ];

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    statusFilter !== 'All' ||
    priorityFilter !== 'All' ||
    categoryFilter !== 'All' ||
    sortOrder !== 'newest';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-panel rounded-2xl p-3 sm:p-4 shadow-xl mb-6 space-y-3.5 transition-colors"
    >
      {/* Top search & quick export bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Dynamic Search Input with Linear aesthetic */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            id="search-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tickets by ID (e.g. TKT-001), customer, email, subject, or issue description..."
            className={`w-full pl-10 pr-20 py-2 rounded-xl text-xs sm:text-sm transition-all font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500/30 ${
              isLight
                ? 'bg-white border border-slate-200/90 hover:border-slate-300 text-slate-900 placeholder-slate-400 shadow-2xs'
                : 'bg-zinc-900/90 border border-white/[0.08] hover:border-white/15 text-zinc-100 placeholder-zinc-400 focus:border-indigo-500'
            }`}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="text-zinc-400 hover:text-white transition-colors p-1 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="kbd-badge hidden sm:inline-block">⌘K</kbd>
            )}
          </div>
        </div>

        {/* Action Controls: View Switch & CSV Export */}
        <div className="flex items-center gap-2">
          {/* Table / Kanban View Toggle */}
          <div
            className={`flex items-center p-1 rounded-xl transition-colors ${
              isLight ? 'bg-slate-100/90 border border-slate-200' : 'bg-zinc-900/90 border border-white/[0.08]'
            }`}
          >
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? isLight
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                    : 'bg-zinc-800 text-white shadow-xs border border-white/[0.08]'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
              <kbd className={`hidden lg:inline text-[9px] font-mono ${isLight ? 'text-slate-400' : 'text-zinc-400'}`}>
                T
              </kbd>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? isLight
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                    : 'bg-zinc-800 text-white shadow-xs border border-white/[0.08]'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
              <kbd className={`hidden lg:inline text-[9px] font-mono ${isLight ? 'text-slate-400' : 'text-zinc-400'}`}>
                V
              </kbd>
            </button>
          </div>

          {/* Export CSV Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onExportCsv}
            disabled={isExporting}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all disabled:opacity-50 cursor-pointer ${
              isLight
                ? 'text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-200 shadow-xs'
                : 'text-zinc-200 bg-zinc-900/90 hover:bg-zinc-800 hover:text-white border border-white/[0.08] hover:border-white/20'
            }`}
            title="Export filtered tickets to CSV (E)"
          >
            <Download className={`w-3.5 h-3.5 text-indigo-500 ${isExporting ? 'animate-bounce' : ''}`} />
            <span className="hidden sm:inline">Export</span>
            <kbd className="kbd-badge hidden md:inline">E</kbd>
          </motion.button>
        </div>
      </div>

      {/* Filter Tabs & Dropdowns Row */}
      <div className={`flex flex-wrap items-center justify-between gap-3 pt-2 border-t ${
        isLight ? 'border-slate-200/80' : 'border-white/[0.06]'
      }`}>
        {/* Status Pill Tabs with Animated Indicator */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {statusOptions.map((opt) => {
            const isSelected =
              statusFilter.toLowerCase() === opt.value.toLowerCase();
            const Icon = opt.icon;

            return (
              <button
                key={opt.value}
                onClick={() => onStatusChange(opt.value)}
                className={`relative px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? isLight
                      ? `${opt.activeLight} border`
                      : `${opt.activeDark} border`
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeFilterTab"
                    className={`absolute inset-0 rounded-xl border ${
                      isLight ? opt.activeLight : opt.activeDark
                    }`}
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {opt.pulseDot && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${opt.pulseDot} ${
                        isSelected ? 'animate-pulse' : 'opacity-60'
                      }`}
                    />
                  )}
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isSelected ? opt.iconColor : isLight ? 'text-slate-500' : 'text-zinc-400'
                    }`}
                  />
                  <span>{opt.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Dropdowns: Priority, Category, Sorting */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Priority:
            </span>
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityChange(e.target.value)}
              className={`rounded-lg px-2.5 py-1.2 text-xs focus:outline-none cursor-pointer transition-colors ${
                isLight
                  ? 'bg-white border border-slate-200 text-slate-800 hover:border-slate-300 focus:border-indigo-500 shadow-2xs'
                  : 'bg-zinc-900/90 border border-white/[0.08] text-zinc-200 hover:border-white/20 focus:border-indigo-500'
              }`}
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">🔥 Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Category:
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
              className={`rounded-lg px-2.5 py-1.2 text-xs focus:outline-none cursor-pointer transition-colors ${
                isLight
                  ? 'bg-white border border-slate-200 text-slate-800 hover:border-slate-300 focus:border-indigo-500 shadow-2xs'
                  : 'bg-zinc-900/90 border border-white/[0.08] text-zinc-200 hover:border-white/20 focus:border-indigo-500'
              }`}
            >
              <option value="All">All Categories</option>
              <option value="Technical">Technical</option>
              <option value="Billing">Billing</option>
              <option value="Account">Account</option>
              <option value="Feature Request">Feature Request</option>
              <option value="General">General</option>
            </select>
          </div>

          {/* Sort Order Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Sort:
            </span>
            <select
              value={sortOrder}
              onChange={(e) => onSortChange(e.target.value)}
              className={`rounded-lg px-2.5 py-1.2 text-xs focus:outline-none cursor-pointer transition-colors ${
                isLight
                  ? 'bg-white border border-slate-200 text-slate-800 hover:border-slate-300 focus:border-indigo-500 shadow-2xs'
                  : 'bg-zinc-900/90 border border-white/[0.08] text-zinc-200 hover:border-white/20 focus:border-indigo-500'
              }`}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Highest Priority</option>
            </select>
          </div>

          {/* Reset Filters CTA */}
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onResetFilters}
              className="flex items-center gap-1 px-2.5 py-1.2 text-xs font-semibold text-rose-500 hover:text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-all cursor-pointer"
              title="Reset all search queries and filters (0)"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
