import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CinematicLuxuryIntroProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

const CinematicLuxuryIntro: React.FC<CinematicLuxuryIntroProps> = ({ onComplete, forceShow = false }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('snigdhaLuxuryIntroSeen');
    if (!hasSeenIntro || forceShow) {
      setIsVisible(true);
      if (!forceShow) {
        sessionStorage.setItem('snigdhaLuxuryIntroSeen', 'true');
      }
    } else {
      if (onComplete) onComplete();
    }
  }, [onComplete, forceShow]);

  // Master Timeline Controller
  useEffect(() => {
    if (!isVisible) return;
    
    // Dissolve into homepage at 8 seconds for a premium, non-tiring duration
    const tExit = setTimeout(() => setIsVisible(false), 8000); 

    return () => clearTimeout(tExit);
  }, [isVisible]);

  const handleAnimationComplete = () => {
    if (!isVisible && onComplete) {
      onComplete();
    }
  };

  const easePremium = [0.25, 0.1, 0.25, 1] as const; // Apple-like smooth cubic bezier

  return (
    <AnimatePresence onExitComplete={handleAnimationComplete}>
      {isVisible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-[9999]"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.05, 
            filter: 'blur(10px)', 
            transition: { duration: 1.5, ease: easePremium } 
          }}
          style={{ 
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: '#050505', // Deep luxury black
            willChange: 'opacity, transform, filter',
            overflow: 'hidden'
          }}
        >
          {/* Subtle Film Grain */}
          <div 
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
              opacity: 0.04,
              pointerEvents: 'none',
              mixBlendMode: 'overlay',
              zIndex: 1
            }}
          />

          {/* Vignette */}
          <div 
            style={{
              position: 'absolute', inset: 0,
              boxShadow: 'inset 0 0 150px rgba(0,0,0,1)',
              pointerEvents: 'none',
              zIndex: 2
            }}
          />

          {/* Ambient Breathing Background Gradients */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 4, ease: "linear" }}
            style={{ position: 'absolute', inset: 0, zIndex: 0 }}
          >
            {/* Emerald Accent */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.15, 0.25, 0.15],
              }}
              transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
              style={{
                position: 'absolute',
                top: '20%', left: '30%',
                width: '60vw', height: '60vw',
                background: 'radial-gradient(circle, rgba(0, 200, 83, 0.1) 0%, transparent 60%)',
                filter: 'blur(60px)',
              }}
            />
            {/* Gold Accent */}
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{ duration: 6, ease: "easeInOut", repeat: Infinity, delay: 1 }}
              style={{
                position: 'absolute',
                bottom: '10%', right: '20%',
                width: '50vw', height: '50vw',
                background: 'radial-gradient(circle, rgba(204, 169, 110, 0.15) 0%, transparent 70%)',
                filter: 'blur(80px)',
              }}
            />
          </motion.div>

          {/* Floating Particles */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.3, y: -40 }}
            transition={{ duration: 8, ease: "linear" }}
            style={{
              position: 'absolute', inset: -100,
              backgroundImage: 'radial-gradient(circle, rgba(204,169,110,0.8) 1px, transparent 1px)',
              backgroundSize: '120px 120px',
              pointerEvents: 'none',
              filter: 'blur(2px)',
              zIndex: 1
            }}
          />

          {/* Main Content Container */}
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, filter: 'blur(10px)', y: 10, scale: 0.98 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
              transition={{ duration: 2.5, ease: easePremium, delay: 0.5 }}
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 'clamp(2rem, 6vw, 4rem)',
                fontWeight: 300,
                color: '#ffffff',
                margin: 0,
                letterSpacing: '0.08em',
                textAlign: 'center',
                position: 'relative'
              }}
            >
              <motion.span
                animate={{ opacity: [0.85, 1, 0.85], textShadow: ['0 0 10px rgba(204,169,110,0)', '0 0 30px rgba(204,169,110,0.3)', '0 0 10px rgba(204,169,110,0)'] }}
                transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
                style={{ display: 'inline-block' }}
              >
                snigdha beauty parlour
              </motion.span>

              {/* Shimmer Effect */}
              <motion.div
                initial={{ left: '-100%' }}
                animate={{ left: '200%' }}
                transition={{ duration: 3, delay: 2, ease: "easeInOut" }}
                style={{
                  position: 'absolute', top: 0, bottom: 0,
                  width: '50%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  transform: 'skewX(-20deg)',
                  mixBlendMode: 'overlay',
                  pointerEvents: 'none'
                }}
              />
            </motion.h1>

            {/* Subtitle */}
            <motion.h2
              initial={{ opacity: 0, filter: 'blur(10px)', y: 5 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              transition={{ duration: 2, ease: easePremium, delay: 2.2 }}
              style={{
                fontFamily: '"Jost", sans-serif',
                fontSize: 'clamp(0.9rem, 3vw, 1.2rem)',
                fontWeight: 300,
                color: 'rgba(255, 255, 255, 0.65)',
                marginTop: '1.5rem',
                letterSpacing: '0.25em',
                textAlign: 'center',
                textTransform: 'lowercase'
              }}
            >
              <motion.span
                animate={{ opacity: [0.6, 0.9, 0.6] }}
                transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, delay: 1 }}
              >
                where every glow tells a story
              </motion.span>
            </motion.h2>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CinematicLuxuryIntro;
