'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  onOpenUpload?: () => void;
}

export default function Header({ onOpenUpload }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="glass sticky top-0 z-50 border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 bg-cobalt rounded-2xl flex items-center justify-center shadow-lg shadow-cobalt/25 group-hover:scale-105 premium-transition">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">NoteHub</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {onOpenUpload && (
              <button
                onClick={onOpenUpload}
                className="inline-flex items-center px-5 py-2 bg-cobalt hover:bg-cobalt-light text-white rounded-2xl font-medium premium-transition shadow-lg shadow-cobalt/25 hover:shadow-cobalt/40 hover:scale-[1.02]"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Carica
              </button>
            )}
            <Link
              href="/admin"
              className="px-4 py-2 text-silk-400 hover:text-white rounded-2xl premium-transition hover:bg-white/10"
            >
              Admin
            </Link>
          </nav>

          <button
            className="md:hidden p-2 rounded-2xl hover:bg-white/10 premium-transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6 text-silk-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {onOpenUpload && (
                <button
                  onClick={() => {
                    onOpenUpload();
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-cobalt font-medium rounded-xl hover:bg-cobalt/10"
                >
                  Carica file
                </button>
              )}
              <Link
                href="/admin"
                className="block px-4 py-2 text-silk-300 rounded-xl hover:bg-white/10"
                onClick={() => setMenuOpen(false)}
              >
                Admin
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
