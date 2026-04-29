import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="border-t border-white/10 py-6 mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-silk-500">
            NoteHub - The Digital Agora
          </p>
          <p className="text-sm text-silk-600 mt-2 md:mt-0">
            Premium knowledge sharing platform
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
