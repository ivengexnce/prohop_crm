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
  const statusOptions = [
    { label: 'All Records', value: 'All', icon: SlidersHorizontal, countKey: 'all' },
    { label: 'Open', value: 'Open', icon: Clock, countKey: 'open' },
    { label: 'In Progress', value: 'In Progress', icon: TrendingUp, countKey: 'prog' },
    { label: 'Closed', value: 'Closed', icon: CheckCircle2, countKey: 'closed' },
    { label: 'Archived', value: 'Archived', icon: Archive, countKey: 'archived' },
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
            className="w-full pl-10 pr-20 py-2 bg-zinc-900/90 border border-white/[0.08] hover:border-white/15 focus:border-indigo-500 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all font-sans"
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
          <div className="flex items-center p-1 rounded-xl bg-zinc-900/90 border border-white/[0.08]">
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-zinc-800 text-white shadow-xs border border-white/[0.08]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
              <kbd className="hidden lg:inline text-[9px] text-zinc-400 font-mono">T</kbd>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-zinc-800 text-white shadow-xs border border-white/[0.08]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
              <kbd className="hidden lg:inline text-[9px] text-zinc-400 font-mono">V</kbd>
            </button>
          </div>

          {/* Export CSV Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onExportCsv}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-900/90 hover:bg-zinc-800 hover:text-white border border-white/[0.08] hover:border-white/20 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            title="Export filtered tickets to CSV (E)"
          >
            <Download className={`w-3.5 h-3.5 text-indigo-400 ${isExporting ? 'animate-bounce' : ''}`} />
            <span className="hidden sm:inline">Export</span>
            <kbd className="kbd-badge hidden md:inline">E</kbd>
          </motion.button>
        </div>
      </div>

      {/* Filter Tabs & Dropdowns Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
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
                className={`relative px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeFilterTab"
                    className="absolute inset-0 bg-zinc-800/90 border border-white/[0.12] rounded-xl shadow-xs"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className="w-3 h-3 text-zinc-400" />
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dropdowns: Priority, Category, Sorting */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="text-[11px] font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityChange(e.target.value)}
              className="bg-zinc-900/90 border border-white/[0.08] hover:border-white/20 rounded-lg px-2.5 py-1.2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">🔥 Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="text-[11px] font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="bg-zinc-900/90 border border-white/[0.08] hover:border-white/20 rounded-lg px-2.5 py-1.2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
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
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="text-[11px] font-medium">Sort:</span>
            <select
              value={sortOrder}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-zinc-900/90 border border-white/[0.08] hover:border-white/20 rounded-lg px-2.5 py-1.2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
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
              className="flex items-center gap-1 px-2.5 py-1.2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-all cursor-pointer"
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
