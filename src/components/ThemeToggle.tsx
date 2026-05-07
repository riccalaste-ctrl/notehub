'use client';

import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className={`relative w-14 h-7 rounded-full backdrop-blur-sm overflow-hidden transition-colors duration-300 border ${
        theme === 'dark'
          ? 'bg-white/10 border-white/10'
          : 'bg-black/10 border-black/10'
      }`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 to-neon-blue/20"
        animate={{
          x: theme === 'dark' ? 0 : '100%',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
      <motion.div
        className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full backdrop-blur-sm flex items-center justify-center shadow-lg ${
          theme === 'dark' ? 'bg-white/20' : 'bg-black/15'
        }`}
        animate={{
          x: theme === 'dark' ? 0 : 28,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {theme === 'dark' ? (
          <Moon className="size-3.5 text-white" />
        ) : (
          <Sun className="size-3.5 text-white" />
        )}
      </motion.div>
    </motion.button>
  );
}
