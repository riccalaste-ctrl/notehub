'use client';

import { motion } from 'framer-motion';

export default function Footer() {
  return (
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
  );
}
