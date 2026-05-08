import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroAnimationProps {
  /**
   * Callback fired when the intro animation is fully completed and faded out.
   */
  onComplete?: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Total display time before initiating fade-out (3.5 seconds total animation sequence)
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const handleAnimationComplete = () => {
    if (!isVisible && onComplete) {
      onComplete();
    }
  };

  // Generate random particles for the background sparkle effect
  const particles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 2 + 1.5,
      delay: Math.random() * 1,
    }));
  }, []);

  return (
    <AnimatePresence onExitComplete={handleAnimationComplete}>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          {/* Subtle Particle Sparkles Background */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full bg-[#D4AF37]"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: p.size,
                  height: p.size,
                  boxShadow: '0 0 4px 1px rgba(212, 175, 55, 0.4)',
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 0.6, 0], scale: [0, 1.5, 0] }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          <motion.div
            className="relative flex flex-col items-center justify-center px-6"
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            {/* Shimmer Sweep Effect (over the entire text block) */}
            <motion.div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.15), transparent)',
                transform: 'skewX(-20deg)',
                width: '50%',
              }}
              initial={{ left: '-100%' }}
              animate={{ left: '200%' }}
              transition={{ duration: 1.8, delay: 0.8, ease: 'easeInOut' }}
            />

            {/* Main Brand Name */}
            <motion.h1
              className="text-5xl md:text-7xl font-serif text-[#D4AF37] mb-4 text-center tracking-wide"
              style={{ textShadow: '0 0 20px rgba(212, 175, 55, 0.2)' }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
            >
              Snigdha
            </motion.h1>

            {/* Elegant Divider */}
            <motion.div
              className="h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent w-full"
              initial={{ width: '0%', opacity: 0 }}
              animate={{ width: '100%', opacity: 0.5 }}
              transition={{ duration: 1, delay: 1.0, ease: 'easeInOut' }}
            />

            {/* Subtitle / Category */}
            <motion.h2
              className="text-sm md:text-xl font-light tracking-[0.4em] text-white/80 text-center mt-5 uppercase"
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1, delay: 1.4, ease: 'easeOut' }}
            >
              Beauty Parlour
            </motion.h2>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroAnimation;
