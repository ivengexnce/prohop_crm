'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TicketItem, TicketStats, TicketStatus } from '@/types/ticket';
import Navbar from '@/components/Navbar';
import StatsCards from '@/components/StatsCards';
import FilterToolbar from '@/components/FilterToolbar';
import TicketList from '@/components/TicketList';
import KanbanBoard from '@/components/KanbanBoard';
import CreateTicketModal from '@/components/CreateTicketModal';
import TicketDetailModal from '@/components/TicketDetailModal';
import ApiDocsModal from '@/components/ApiDocsModal';
import CommandPalette from '@/components/CommandPalette';
import ShortcutsModal from '@/components/ShortcutsModal';
import { ToastProvider, useToast } from '@/components/Toast';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Command,
  Activity,
  Layers,
  Shield,
  LifeBuoy,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function DashboardContent() {
  const { showToast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // State
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Modals
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isApiDocsOpen, setIsApiDocsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Power Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette: ⌘K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Ignore single-key shortcuts when typing in inputs/textareas
      const isInputActive = ['input', 'textarea', 'select'].includes(
        (document.activeElement?.tagName || '').toLowerCase()
      );

      // Escape closes modals
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) setIsCommandPaletteOpen(false);
        if (isShortcutsOpen) setIsShortcutsOpen(false);
        if (isCreateModalOpen) setIsCreateModalOpen(false);
        if (selectedTicketId) setSelectedTicketId(null);
        if (isApiDocsOpen) setIsApiDocsOpen(false);
        return;
      }

      if (isInputActive) return;

      // N: New Ticket
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsCreateModalOpen(true);
      }
      // ?: Open Shortcuts
      else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
      // T: Table View
      else if (e.key.toLowerCase() === 't') {
        setViewMode('table');
      }
      // V: Kanban View
      else if (e.key.toLowerCase() === 'v') {
        setViewMode('kanban');
      }
      // 1: Open filter
      else if (e.key === '1') {
        setStatusFilter('Open');
        setPriorityFilter('All');
        setCurrentPage(1);
      }
      // 2: In Progress filter
      else if (e.key === '2') {
        setStatusFilter('In Progress');
        setPriorityFilter('All');
        setCurrentPage(1);
      }
      // 3: Closed filter
      else if (e.key === '3') {
        setStatusFilter('Closed');
        setPriorityFilter('All');
        setCurrentPage(1);
      }
      // 4: Urgent filter
      else if (e.key === '4') {
        setPriorityFilter('Urgent');
        setStatusFilter('All');
        setCurrentPage(1);
      }
      // 0: Reset filter
      else if (e.key === '0') {
        setStatusFilter('All');
        setPriorityFilter('All');
        setCurrentPage(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isCreateModalOpen,
    selectedTicketId,
    isApiDocsOpen,
    isCommandPaletteOpen,
    isShortcutsOpen,
  ]);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch KPI Stats
  const fetchStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Fetch Tickets with Pagination & Filters
  const fetchTickets = useCallback(async () => {
    try {
      setIsLoadingTickets(true);
      const params = new URLSearchParams();

      if (statusFilter && statusFilter !== 'All') {
        params.append('status', statusFilter);
      }
      if (priorityFilter && priorityFilter !== 'All') {
        params.append('priority', priorityFilter);
      }
      if (categoryFilter && categoryFilter !== 'All') {
        params.append('category', categoryFilter);
      }
      if (debouncedSearch.trim()) {
        params.append('search', debouncedSearch.trim());
      }
      if (sortOrder) {
        params.append('sort', sortOrder);
      }

      // In Kanban view, fetch entire active working set
      if (viewMode === 'table') {
        params.append('page', String(currentPage));
        params.append('limit', String(pageSize));
      }

      const res = await fetch(`/api/tickets?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch tickets');
      }
      const data = await res.json();

      if (data && data.pagination) {
        setTickets(data.data);
        setTotalPages(data.pagination.totalPages || 1);
        setTotalCount(data.pagination.total || 0);
      } else if (Array.isArray(data)) {
        setTickets(data);
        setTotalCount(data.length);
        setTotalPages(1);
      }
    } catch (err: any) {
      showToast('error', 'Error loading tickets', err.message);
    } finally {
      setIsLoadingTickets(false);
    }
  }, [
    statusFilter,
    priorityFilter,
    categoryFilter,
    debouncedSearch,
    sortOrder,
    currentPage,
    pageSize,
    viewMode,
    showToast,
  ]);

  // Initial load & when dependencies change
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handle Quick Status Change from row or kanban card
  const handleQuickStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      showToast(
        'success',
        `Ticket ${ticketId} Updated`,
        `Status set to ${newStatus}`
      );

      // Refresh list & stats
      fetchTickets();
      fetchStats();
    } catch (err: any) {
      showToast('error', 'Failed to update ticket status', err.message);
    }
  };

  // Handle Export CSV
  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);
      if (debouncedSearch.trim()) params.append('search', debouncedSearch.trim());

      const res = await fetch(`/api/export?${params.toString()}`);
      if (!res.ok) throw new Error('Export request failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crm_tickets_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showToast('success', 'Export Complete', 'Downloaded filtered tickets as CSV');
    } catch (err: any) {
      showToast('error', 'CSV Export Failed', err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Reset demo seed data
  const handleResetSeed = async () => {
    if (
      !window.confirm(
        'Reset demo dataset? This will restore realistic sample tickets and activity notes.'
      )
    ) {
      return;
    }

    try {
      setIsSeeding(true);
      const res = await fetch('/api/seed', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reset demo data');

      showToast('success', 'Demo Dataset Restored', 'Database reseeded with 8 sample tickets & notes.');
      setCurrentPage(1);
      fetchTickets();
      fetchStats();
    } catch (err: any) {
      showToast('error', 'Seed Reset Failed', err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setCategoryFilter('All');
    setSortOrder('newest');
    setCurrentPage(1);
    showToast('info', 'Filters Reset', 'Showing all tickets ordered by newest.');
  };

  // When clicking on a stat card
  const handleCardStatusSelect = (filterName: string) => {
    setCurrentPage(1);
    if (filterName === 'Urgent') {
      setPriorityFilter('Urgent');
      setStatusFilter('All');
    } else {
      setStatusFilter(filterName);
      setPriorityFilter('All');
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors relative selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenApiDocs={() => setIsApiDocsOpen(true)}
        onResetSeed={handleResetSeed}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        isSeeding={isSeeding}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Support Command Center
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                24h Target SLA
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Orchestrate customer tickets, coordinate team investigation notes, enforce SLAs, and monitor resolution workflows in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Command Palette Trigger */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl glass-panel text-xs font-semibold text-slate-300 hover:text-white hover:border-indigo-500/40 shadow-xs cursor-pointer"
            >
              <Command className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Commands</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
                ⌘K
              </kbd>
            </motion.button>

            {/* New Ticket CTA */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-lg shadow-indigo-600/30 border border-indigo-400/30 transition-all cursor-pointer"
            >
              <span>+ New Ticket</span>
              <span className="hidden sm:inline text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono font-normal">
                N
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Executive KPI Stats Cards with Real-Time Distribution Bar */}
        <StatsCards
          stats={stats}
          currentStatus={priorityFilter === 'Urgent' ? 'Urgent' : statusFilter}
          onSelectStatus={handleCardStatusSelect}
          isLoading={isLoadingStats}
        />

        {/* Filter and Search Bar */}
        <FilterToolbar
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          statusFilter={statusFilter}
          onStatusChange={(s) => {
            setStatusFilter(s);
            setCurrentPage(1);
          }}
          priorityFilter={priorityFilter}
          onPriorityChange={(p) => {
            setPriorityFilter(p);
            setCurrentPage(1);
          }}
          categoryFilter={categoryFilter}
          onCategoryChange={(c) => {
            setCategoryFilter(c);
            setCurrentPage(1);
          }}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
          onExportCsv={handleExportCsv}
          onResetFilters={handleResetFilters}
          totalFilteredCount={totalCount}
          isExporting={isExporting}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchInputRef={searchInputRef}
        />

        {/* View Switch: Table vs Kanban */}
        <AnimatePresence mode="wait">
          {viewMode === 'table' ? (
            <motion.div
              key="table-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TicketList
                tickets={tickets}
                isLoading={isLoadingTickets}
                onSelectTicket={(id) => setSelectedTicketId(id)}
                onQuickStatusChange={handleQuickStatusChange}
                onResetFilters={handleResetFilters}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
              />

              {/* Server-Side Pagination Bar */}
              {totalCount > 0 && (
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-panel shadow-md text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>
                      Showing{' '}
                      <strong className="text-white font-semibold">
                        {(currentPage - 1) * pageSize + 1}
                      </strong>{' '}
                      to{' '}
                      <strong className="text-white font-semibold">
                        {Math.min(currentPage * pageSize, totalCount)}
                      </strong>{' '}
                      of <strong className="text-white font-semibold">{totalCount}</strong> tickets
                    </span>
                    <span className="text-slate-600">|</span>
                    <div className="flex items-center gap-1.5">
                      <span>Per page:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="bg-slate-900 border border-white/[0.08] rounded-lg px-2 py-0.5 text-slate-300 focus:outline-none cursor-pointer"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">
                      Page <strong className="text-white">{currentPage}</strong> of{' '}
                      <strong className="text-white">{totalPages}</strong>
                    </span>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage <= 1 || isLoadingTickets}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        title="Previous Page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages || isLoadingTickets}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        title="Next Page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="kanban-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <KanbanBoard
                tickets={tickets}
                onSelectTicket={(id) => setSelectedTicketId(id)}
                onQuickStatusChange={handleQuickStatusChange}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals & Command Overlays */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTicketCreated={(id) => {
          fetchTickets();
          fetchStats();
          setSelectedTicketId(id);
        }}
      />

      <TicketDetailModal
        ticketId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
        onTicketUpdated={() => {
          fetchTickets();
          fetchStats();
        }}
      />

      <ApiDocsModal
        isOpen={isApiDocsOpen}
        onClose={() => setIsApiDocsOpen(false)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenCreateTicket={() => setIsCreateModalOpen(true)}
        onOpenApiDocs={() => setIsApiDocsOpen(true)}
        onResetSeed={handleResetSeed}
        onExportCsv={handleExportCsv}
        onSelectStatus={(s) => {
          setStatusFilter(s);
          setCurrentPage(1);
        }}
        onSetViewMode={setViewMode}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onSelectTicket={(id) => setSelectedTicketId(id)}
        tickets={tickets}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-slate-950/60 py-6 text-center text-xs text-slate-500 mt-16 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium text-slate-400">
            NexusCRM Enterprise Ops Platform &bull; Production Architecture
          </p>
          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1 text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Next.js 16 + React 19 + Tailwind v4 + Motion
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}
