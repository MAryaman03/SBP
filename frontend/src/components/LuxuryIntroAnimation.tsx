import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// IMPORTING LOGO AS REQUESTED
// I've pointed this to sbp.png as it exists in your folder, 
// but you can change it back to tabBarLogo.png if you add that file later!
// @ts-ignore
import logo from '../assets/sbp.png';

interface LuxuryIntroAnimationProps {
  /**
   * Callback fired when the intro animation is fully completed and faded out.
   */
  onComplete?: () => void;
  /**
   * For development: Force the animation to run ignoring sessionStorage.
   */
  forceShow?: boolean;
}

const LuxuryIntroAnimation: React.FC<LuxuryIntroAnimationProps> = ({ onComplete, forceShow = false }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Handle sessionStorage to ensure it only runs once per session
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('snigdhaIntroSeen');
    
    if (!hasSeenIntro || forceShow) {
      setIsVisible(true);
      if (!forceShow) {
        sessionStorage.setItem('snigdhaIntroSeen', 'true');
      }
    } else {
      if (onComplete) onComplete();
    }
  }, [onComplete, forceShow]);

  // Handle unmounting strictly after animation
  useEffect(() => {
    if (isVisible) {
      // Trigger Exit at 6.5s (1.5s fade out = 8s total)
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 6500);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleAnimationComplete = () => {
    if (!isVisible && onComplete) {
      onComplete();
    }
  };

  // Phase 1: Minimal floating particles
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      duration: Math.random() * 5 + 4,
      delay: Math.random() * 2,
    }));
  }, []);

  // --- Animation Variants --- //

  // Background ambient glow
  const bgGlowVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 1.5, ease: "easeOut" }
    }
  };

  // Cinematic Camera Zoom Wrapper
  const cameraZoomVariants: Variants = {
    hidden: { scale: 1 },
    visible: { 
      scale: 1.1,
      transition: { duration: 8, ease: "linear" }
    }
  };

  // Logo animation (0.85 -> 1)
  const logoVariants: Variants = {
    hidden: { opacity: 0, scale: 0.85, filter: 'blur(16px)' },
    visible: { 
      opacity: 1, 
      scale: 1, 
      filter: 'blur(0px)',
      transition: { duration: 2, delay: 1.2, ease: [0.25, 1, 0.5, 1] }
    }
  };

  // Main Title: "Snigdha Beauty Parlour"
  const titleVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.9, filter: 'blur(12px)' },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      textShadow: ['0 0 0px rgba(212, 175, 55, 0)', '0 0 40px rgba(212, 175, 55, 0.6)', '0 0 15px rgba(212, 175, 55, 0.2)'],
      transition: { 
        duration: 2, delay: 1.5, ease: [0.25, 1, 0.5, 1],
        textShadow: { duration: 2, delay: 5.5, ease: "easeInOut" } // Pulse effect
      }
    }
  };

  // Tagline Line 1
  const tagline1Variants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 1.5, delay: 3.5, ease: "easeOut" }
    }
  };

  // Tagline Line 2
  const tagline2Variants: Variants = {
    hidden: { opacity: 0, y: 15, letterSpacing: '0.1em' },
    visible: { 
      opacity: 1, 
      y: 0, 
      letterSpacing: '0.4em',
      transition: { duration: 1.5, delay: 4.5, ease: "easeOut" }
    }
  };

  // Gold Shimmer Sweep
  const shimmerVariants: Variants = {
    hidden: { left: '-100%', opacity: 0 },
    visible: { 
      left: '200%', 
      opacity: [0, 0.5, 0],
      transition: { duration: 2.5, delay: 4.8, ease: "easeInOut", times: [0, 0.5, 1] }
    }
  };

  // Thin Gold Line
  const lineVariants: Variants = {
    hidden: { width: "0%", opacity: 0 },
    visible: { 
      width: "100%", 
      opacity: 0.6,
      transition: { duration: 1.5, delay: 5.5, ease: [0.65, 0, 0.35, 1] }
    }
  };

  return (
    <AnimatePresence onExitComplete={handleAnimationComplete}>
      {isVisible && (
        <motion.div
          // Use high z-index to stay above everything
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden pointer-events-none"
          initial="hidden"
          animate="visible"
          exit={{ 
            opacity: 0, 
            scale: 1.15, // Cinematic zoom in on exit
            transition: { duration: 1.5, ease: [0.25, 1, 0.5, 1] } 
          }}
          style={{ willChange: 'opacity, transform' }}
        >
          {/* Ambient Background & Radial Glow */}
          <motion.div
            className="absolute inset-0"
            style={{ 
              background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.12) 0%, rgba(0,0,0,1) 50%)',
              willChange: 'opacity'
            }}
            variants={bgGlowVariants}
          />
          <div 
            className="absolute inset-0 pointer-events-none z-10" 
            style={{ background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.9) 100%)' }} 
          />

          {/* Minimal Dust Effect */}
          <div className="absolute inset-0 opacity-25">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full bg-[#D4AF37]"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: p.size,
                  height: p.size,
                  boxShadow: '0 0 6px 1px rgba(212, 175, 55, 0.4)',
                  willChange: 'transform, opacity'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0], y: [0, -30] }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Main Content Wrapper (Cinematic Zoom) */}
          <motion.div
            className="relative flex flex-col items-center justify-center px-6 z-20"
            variants={cameraZoomVariants}
            style={{ willChange: 'transform' }}
          >
            {/* Logo */}
            <motion.div className="relative mb-6" variants={logoVariants}>
              <img 
                src={logo} 
                alt="Snigdha Beauty Parlour Logo" 
                className="w-20 h-20 md:w-28 md:h-28 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]" 
                style={{ willChange: 'transform, opacity, filter' }}
              />
            </motion.div>

            {/* Title & Tagline Container */}
            <div className="relative flex flex-col items-center w-full max-w-3xl">
              
              {/* Main Title */}
              <motion.h1
                className="text-4xl md:text-6xl lg:text-7xl font-serif text-[#D4AF37] text-center mb-6"
                variants={titleVariants}
                style={{ willChange: 'transform, opacity, text-shadow, filter' }}
              >
                Snigdha Beauty Parlour
              </motion.h1>

              {/* Tagline Container */}
              <div className="flex flex-col items-center space-y-3 mt-4">
                <motion.p
                  className="text-lg md:text-2xl font-serif italic text-white/90"
                  variants={tagline1Variants}
                  style={{ willChange: 'transform, opacity' }}
                >
                  "Where Every Glow
                </motion.p>
                <motion.p
                  className="text-sm md:text-lg font-light text-white/70 uppercase tracking-widest"
                  variants={tagline2Variants}
                  style={{ willChange: 'transform, opacity, letter-spacing' }}
                >
                  Tells a Story"
                </motion.p>
              </div>

              {/* Gold Shimmer Sweep over text */}
              <motion.div
                className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
                  transform: 'skewX(-25deg)',
                  width: '30%',
                  willChange: 'left, opacity'
                }}
                variants={shimmerVariants}
              />

              {/* Thin Gold Line underneath everything */}
              <motion.div
                className="h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mt-8"
                variants={lineVariants}
                style={{ willChange: 'width, opacity' }}
              />

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LuxuryIntroAnimation;
