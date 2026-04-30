'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MagneticElement from './MagneticElement';

interface HeaderProps {
  onOpenUpload?: () => void;
}

export default function Header({ onOpenUpload }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-cobalt to-cobalt-light rounded-2xl flex items-center justify-center shadow-lg shadow-cobalt/25 group-hover:scale-105 premium-transition">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="absolute -inset-1 bg-cobalt/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 premium-transition" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white tracking-tight leading-none">
                SKAKK-UP
              </span>
              <span className="text-[10px] text-silk-500 tracking-widest uppercase leading-none">
                Digital Agora
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-2">
            {onOpenUpload && (
              <MagneticElement strength={0.4}>
                <button
                  onClick={onOpenUpload}
                  className="inline-flex items-center px-5 py-2 bg-cobalt hover:bg-cobalt-light text-white rounded-2xl font-medium premium-transition shadow-lg shadow-cobalt/25 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full premium-transition" />
                  <svg className="w-4 h-4 mr-2 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="relative z-10">Carica</span>
                </button>
              </MagneticElement>
            )}
            <MagneticElement strength={0.3}>
              <Link
                href="/admin"
                className="px-4 py-2 text-silk-400 hover:text-white rounded-2xl premium-transition hover:bg-white/5"
              >
                Admin
              </Link>
            </MagneticElement>
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
            className="md:hidden border-t border-white/5 overflow-hidden"
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
                className="block px-4 py-2 text-silk-300 rounded-xl hover:bg-white/5"
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
