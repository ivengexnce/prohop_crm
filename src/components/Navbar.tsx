'use client';

import React from 'react';
import {
  LifeBuoy,
  Plus,
  RefreshCw,
  Code2,
  Database,
  Command,
  Sun,
  Moon,
  Keyboard,
  Sliders,
  Layers,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '@/lib/theme-context';

interface NavbarProps {
  onOpenCreateModal: () => void;
  onOpenApiDocs: () => void;
  onResetSeed: () => void;
  onOpenCommandPalette: () => void;
  onOpenShortcuts: () => void;
  isSeeding: boolean;
  isLiveConnected?: boolean;
}

export default function Navbar({
  onOpenCreateModal,
  onOpenApiDocs,
  onResetSeed,
  onOpenCommandPalette,
  onOpenShortcuts,
  isSeeding,
  isLiveConnected = true,
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#090a0f]/80 backdrop-blur-2xl transition-colors"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Brand */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md relative overflow-hidden group ${
                isLight ? 'bg-white border border-slate-200' : 'bg-zinc-900 border border-white/[0.12]'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <LifeBuoy className="w-4 h-4 text-indigo-500 relative z-10" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-base font-bold tracking-tight font-sans ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  ProHop
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded-full flex items-center gap-1 ${
                  isLight ? 'bg-slate-100 text-slate-700 border border-slate-300' : 'bg-zinc-800 text-zinc-300 border border-zinc-700/80'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>v2.5.0</span>
                </span>
              </div>
              <p className={`text-[11px] hidden sm:block tracking-normal ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Enterprise Incident Management &bull; 24h SLA Core
              </p>
            </div>
          </div>

          {/* Quick Search / Command Palette Bar */}
          <div className="hidden lg:flex items-center">
            <button
              onClick={onOpenCommandPalette}
              className={`flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs transition-all group cursor-pointer ${
                isLight
                  ? 'bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs'
                  : 'bg-zinc-900/90 border border-white/[0.08] hover:border-white/20 text-zinc-400 hover:text-zinc-200 shadow-inner'
              }`}
            >
              <Command className={`w-3.5 h-3.5 transition-colors ${
                isLight ? 'text-indigo-600' : 'text-zinc-400 group-hover:text-indigo-400'
              }`} />
              <span className={`font-normal ${isLight ? 'text-slate-600' : ''}`}>Quick jump, filter, or command...</span>
              <kbd className="kbd-badge">⌘K</kbd>
            </button>
          </div>

          {/* Real-Time Live Sync & SQLite WAL Status Beacon */}
          <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs ${
            isLight ? 'bg-slate-100/90 border border-slate-200 text-slate-700' : 'bg-zinc-900/60 border border-white/[0.08] text-zinc-300'
          }`}>
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isLiveConnected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isLiveConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            <Database className="w-3.5 h-3.5 text-emerald-500 ml-0.5" />
            <span className={`font-mono text-[11px] ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-300'}`}>
              {isLiveConnected ? 'SSE Live & WAL Active' : 'Connecting Sync...'}
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-2xs'
                  : 'bg-zinc-900/80 border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20'
              }`}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </motion.button>

            {/* Shortcuts Help */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenShortcuts}
              className={`hidden sm:flex p-2 rounded-xl transition-all cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-2xs'
                  : 'bg-zinc-900/80 border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20'
              }`}
              title="Keyboard Shortcuts (?)"
            >
              <Keyboard className="w-4 h-4" />
            </motion.button>

            {/* API Reference */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenApiDocs}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-950 border border-slate-200/90 hover:border-slate-300 shadow-2xs'
                  : 'text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] hover:border-white/20'
              }`}
              title="Inspect REST API endpoints & cURL tests"
            >
              <Code2 className={`w-3.5 h-3.5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
              <span className={isLight ? 'text-slate-800 font-semibold' : ''}>API Explorer</span>
            </motion.button>

            {/* Reset Seed Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onResetSeed}
              disabled={isSeeding}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all disabled:opacity-50 cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-950 border border-slate-200/90 hover:border-slate-300 shadow-2xs'
                  : 'text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] hover:border-white/20'
              }`}
              title="Reset sample tickets & demo data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLight ? 'text-cyan-600' : 'text-cyan-400'} ${isSeeding ? 'animate-spin' : ''}`} />
              <span className={isLight ? 'text-slate-800 font-semibold' : ''}>{isSeeding ? 'Seeding...' : 'Reset'}</span>
            </motion.button>

            {/* Create Ticket Primary CTA */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenCreateModal}
              id="btn-create-ticket-header"
              className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold !text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/25 border border-indigo-400/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 !text-white" />
              <span className="!text-white font-semibold">New Ticket</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.2 rounded bg-white/20 !text-white text-[10px] font-mono font-medium border border-white/30 ml-1">
                N
              </kbd>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
