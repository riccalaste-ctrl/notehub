'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}

export default function CommandBar({ isOpen, onClose, onSearch }: CommandBarProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (query.length > 0) {
      onSearch(query);
    }
  }, [query, onSearch]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
          >
            <div className="glass rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
              <div className="flex items-center px-5 py-4 border-b border-white/10">
                <svg className="w-5 h-5 text-silk-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cerca file, materie, professori..."
                  className="flex-1 bg-transparent text-white placeholder-silk-500 outline-none text-sm"
                  autoFocus
                />
                <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs text-silk-500 bg-white/5 rounded-lg border border-white/10">
                  ESC
                </kbd>
              </div>
              <div className="px-3 py-2 text-xs text-silk-500">
                Digita per cercare tra gli appunti disponibili
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
