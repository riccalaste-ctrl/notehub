'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export default function Footer() {
  const handleUpload = () => {
    window.dispatchEvent(new Event('open-upload'));
  };

  return (
    <>
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="py-6 mt-8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-foreground-light">
              SKAKK-UP - The Digital Agora
            </p>
            <p className="text-sm text-foreground-muted mt-2 md:mt-0">
              Premium knowledge sharing platform
            </p>
          </div>
        </div>
      </motion.footer>

      {/* Global Floating Upload Button */}
      <div className="fixed right-6 bottom-6 z-30">
        <motion.button
          whileHover={{ scale: 1.05, rotate: 2 }}
          whileTap={{ scale: 0.95, rotate: -2 }}
          onClick={handleUpload}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#5B8DB8] to-[#9B72B0] text-white shadow-xl premium-transition"
        >
          <Plus className="size-7" />
        </motion.button>
      </div>
    </>
  );
}
