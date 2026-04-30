import { motion } from 'framer-motion';

export function FileCardSkeleton() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start space-x-4">
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
          className="w-10 h-10 rounded-xl bg-stone-200/50"
        />
        <div className="flex-1">
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
            className="h-4 bg-stone-200/50 rounded-lg w-3/4 mb-3"
          />
          <div className="flex space-x-4">
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
              className="h-3 bg-stone-200/50 rounded-lg w-20"
            />
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
              className="h-3 bg-stone-200/50 rounded-lg w-24"
            />
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
              className="h-3 bg-stone-200/50 rounded-lg w-16"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FileListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <FileCardSkeleton key={i} />
      ))}
    </div>
  );
}
