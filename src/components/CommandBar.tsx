'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
          >
            <div className="neu-modal overflow-hidden shadow-neu-xl">
              <div className="flex items-center px-5 py-4">
                <Search className="size-5 text-foreground-light mr-3" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cerca file, materie, professori..."
                  className="flex-1 bg-transparent text-foreground placeholder-foreground-muted outline-none text-sm"
                  autoFocus
                />
                <button onClick={onClose} className="ml-2 p-1 rounded-xl neu-button">
                  <X className="size-4 text-foreground-light" />
                </button>
              </div>
              <div className="px-3 py-2 text-xs text-foreground-light">
                Digita per cercare tra gli appunti disponibili
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
