'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  index?: number;
}

export default function TiltCard({ children, className = '', index = 0 }: TiltCardProps) {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 8;
    const rotateX = ((centerY - e.clientY) / (rect.height / 2)) * 8;

    setTilt({
      rotateX,
      rotateY,
      x: (e.clientX - centerX) * 0.05,
      y: (e.clientY - centerY) * 0.05,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.08,
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{ scale: 1.02 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '1000px' }}
      className="relative"
    >
      <motion.div
        animate={{
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
          x: tilt.x,
          y: tilt.y,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`relative glass rounded-3xl border border-white/10 overflow-hidden ${className}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cobalt/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />
        <div className="pointer-events-none absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-cobalt/5 blur-3xl rounded-full" />
        {children}
      </motion.div>
    </motion.div>
  );
}
