'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, LayoutGrid, BookOpen, FileText, Share2, Plus, Menu, X, Search, Compass, ChevronRight } from 'lucide-react';

interface HeaderProps {
  onOpenUpload?: () => void;
  currentSection?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function Header({ onOpenUpload, currentSection, breadcrumbs }: HeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');

  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 z-40 flex-col items-center gap-8 w-56 h-full p-6 glass-sidebar">
        <div className="flex items-center gap-2 w-full">
          <div className="size-9 transition-all duration-300 rounded-xl flex justify-center items-center gradient-logo shadow-lavender">
            <GraduationCap className="size-5 text-white" />
          </div>
          <span className="font-extrabold text-lg leading-7 tracking-tight gradient-text">
            SKAKK-UP
          </span>
        </div>

        <nav className="flex flex-col gap-2 w-full">
          <Link href="/" className="flex items-center gap-2 w-full px-3 py-2 rounded-xl transition-all duration-300 ease-out text-sm font-medium text-stone-600 hover:text-stone-800 hover:bg-white/40">
            <LayoutGrid className="size-4" />
            Dashboard
          </Link>
          <button
            onClick={() => setActiveNav('materie')}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl transition-all duration-300 ease-out text-sm font-medium ${
              activeNav === 'materie'
                ? 'bg-sage/20 border border-white/90 shadow-sage text-stone-800'
                : 'text-stone-600 hover:text-stone-800 hover:bg-white/40'
            }`}
          >
            <BookOpen className="size-4 text-sage-dark" />
            Materie
          </button>
          <button className="flex items-center gap-2 w-full px-3 py-2 rounded-xl transition-all duration-300 ease-out text-sm font-medium text-stone-600 hover:text-stone-800 hover:bg-white/40">
            <FileText className="size-4" />
            Appunti
          </button>
          <button className="flex items-center gap-2 w-full px-3 py-2 rounded-xl transition-all duration-300 ease-out text-sm font-medium text-stone-600 hover:text-stone-800 hover:bg-white/40">
            <Share2 className="size-4" />
            Condivisi
          </button>
        </nav>
      </aside>

      <header className="fixed top-0 left-0 right-0 z-50 glass-header lg:left-56">
        <div className="flex justify-between items-center h-16 px-4 lg:px-8">
          <div className="flex lg:hidden items-center gap-2">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-white/50 premium-transition">
              <Menu className="size-5 text-stone-600" />
            </button>
            <div className="size-8 rounded-xl flex justify-center items-center gradient-logo shadow-lavender">
              <GraduationCap className="size-4 text-white" />
            </div>
            <span className="font-extrabold text-base tracking-tight gradient-text">
              SKAKK-UP
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <Compass className="size-5 text-lavender" />
            <span className="font-medium text-sm text-stone-500">Esplora</span>
            {breadcrumbs && breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                <ChevronRight className="size-4 text-stone-400" />
                {crumb.href ? (
                  <Link href={crumb.href} className="font-medium text-sm text-stone-500 hover:text-stone-700 transition">{crumb.label}</Link>
                ) : (
                  <span className="font-semibold text-sm text-stone-800">{crumb.label}</span>
                )}
              </span>
            ))}
            {!breadcrumbs && currentSection && (
              <>
                <ChevronRight className="size-4 text-stone-400" />
                <span className="font-semibold text-sm text-stone-800">{currentSection}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:relative sm:flex">
              <Search className="top-1/2 -translate-y-1/2 size-4 absolute left-3 text-lavender" />
              <input
                type="text"
                placeholder="Cerca..."
                className="text-sm pl-9 pr-4 h-10 w-48 lg:w-64 rounded-xl glass-input text-stone-800 placeholder-stone-400 outline-none focus:ring-2 focus:ring-lavender/30 premium-transition"
              />
            </div>

            {onOpenUpload && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenUpload}
                className="hidden sm:inline-flex items-center px-5 py-2 font-medium rounded-full text-white text-sm gradient-primary border border-white/60 shadow-lavender premium-transition relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full premium-transition" />
                <Plus className="size-4 mr-1.5 relative z-10" />
                <span className="relative z-10">Carica</span>
              </motion.button>
            )}

            <Link href="/admin" className="px-3 py-2 text-sm text-stone-600 hover:text-stone-800 rounded-xl hover:bg-white/50 premium-transition">
              Admin
            </Link>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 glass-sidebar p-6 lg:hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <div className="size-9 rounded-xl flex justify-center items-center gradient-logo shadow-lavender">
                    <GraduationCap className="size-5 text-white" />
                  </div>
                  <span className="font-extrabold text-lg gradient-text">SKAKK-UP</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl hover:bg-white/50">
                  <X className="size-5 text-stone-600" />
                </button>
              </div>

              <nav className="flex flex-col gap-2">
                <Link href="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:text-stone-800 hover:bg-white/40 premium-transition">
                  <LayoutGrid className="size-4" />
                  Dashboard
                </Link>
                <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-sage/20 border border-white/90 shadow-sage text-stone-800">
                  <BookOpen className="size-4 text-sage-dark" />
                  Materie
                </button>
                <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:text-stone-800 hover:bg-white/40 premium-transition">
                  <FileText className="size-4" />
                  Appunti
                </button>
                <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:text-stone-800 hover:bg-white/40 premium-transition">
                  <Share2 className="size-4" />
                  Condivisi
                </button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
