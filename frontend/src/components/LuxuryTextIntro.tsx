import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LuxuryTextIntroProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

const LuxuryTextIntro: React.FC<LuxuryTextIntroProps> = ({ onComplete, forceShow = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(-1);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('snigdhaTextIntroSeen');
    if (!hasSeenIntro || forceShow) {
      setIsVisible(true);
      if (!forceShow) {
        sessionStorage.setItem('snigdhaTextIntroSeen', 'true');
      }
    } else {
      if (onComplete) onComplete();
    }
  }, [onComplete, forceShow]);

  // Master Timeline Controller (10s total)
  useEffect(() => {
    if (!isVisible) return;

    // 0.0s to 1.5s: Ambient start (step -1)
    const t0 = setTimeout(() => setStep(0), 1500);  // Trigger Line 1 at 1.5s
    
    // 4.0s: Trigger Line 1 exit. 
    const t1 = setTimeout(() => setStep(1), 4000); 
    
    // 6.5s: Trigger Line 2 exit.
    const t2 = setTimeout(() => setStep(2), 6500); 
    
    // 9.0s: Trigger entire overlay container exit (cinematic zoom out)
    const t3 = setTimeout(() => setIsVisible(false), 9000); 

    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isVisible]);

  const handleAnimationComplete = () => {
    if (!isVisible && onComplete) {
      onComplete();
    }
  };

  const goldColor = "#D4AF37";

  return (
    <AnimatePresence onExitComplete={handleAnimationComplete}>
      {isVisible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black z-[9999]"
          initial={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.03, transition: { duration: 1.5, ease: "easeInOut" } }}
          style={{ 
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            zIndex: 99999,
            willChange: 'opacity, transform',
            overflow: 'hidden'
          }}
        >
          {/* Ambient Start: Subtle Radial Glow */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            style={{ 
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              pointerEvents: 'none',
              background: `radial-gradient(circle at center, rgba(212, 175, 55, 0.12) 0%, rgba(0,0,0,1) 45%)` 
            }} 
          />

          <AnimatePresence mode="wait">
            
            {/* Line 1: Snigdha Beauty Parlour */}
            {step === 0 && (
              <motion.h1
                key="line0"
                initial={{ opacity: 0, scale: 0.92, filter: 'blur(16px)' }}
                animate={{ 
                  opacity: 1, 
                  scale: [0.92, 1, 1.025, 1],
                  filter: ['blur(16px)', 'blur(0px)', 'blur(0px)', 'blur(0px)'],
                  textShadow: [`0 0 0px #000`, `0 0 20px ${goldColor}`, `0 0 45px ${goldColor}`, `0 0 20px ${goldColor}`] 
                }}
                exit={{ opacity: 0, filter: 'blur(12px)', scale: 0.95, transition: { duration: 0.8, ease: "easeOut" } }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                style={{ 
                  fontFamily: '"Lasthen", "Abril Fatface", serif', 
                  color: goldColor, 
                  textAlign: 'center', 
                  margin: 0,
                  padding: '0 24px',
                  fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Snigdha Beauty Parlour
              </motion.h1>
            )}

            {/* Line 2: Where Every Glow */}
            {step === 1 && (
              <motion.h2
                key="line1"
                initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: [0.98, 1, 1.02, 1],
                  filter: ['blur(8px)', 'blur(0px)', 'blur(0px)', 'blur(0px)'],
                  textShadow: [`0 0 0px #000`, `0 0 20px ${goldColor}`, `0 0 35px ${goldColor}`, `0 0 20px ${goldColor}`]
                }}
                exit={{ opacity: 0, filter: 'blur(10px)', y: -10, transition: { duration: 0.7, ease: "easeOut" } }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                style={{ 
                  fontFamily: '"Lasthen", "Abril Fatface", serif', 
                  color: goldColor, 
                  textAlign: 'center', 
                  margin: 0,
                  padding: '0 24px',
                  fontSize: 'clamp(2rem, 5vw, 4rem)',
                  fontWeight: 400,
                  textTransform: 'none',
                  letterSpacing: '0.05em'
                }}
              >
                Where Every Glow
              </motion.h2>
            )}

            {/* Line 3: Tells a Story */}
            {step === 2 && (
              <motion.h3
                key="line2"
                initial={{ opacity: 0, letterSpacing: '0.05em', filter: 'blur(8px)' }}
                animate={{ 
                  opacity: 1, 
                  letterSpacing: '0.35em',
                  filter: ['blur(8px)', 'blur(0px)', 'blur(0px)'],
                  textShadow: [`0 0 0px #000`, `0 0 15px ${goldColor}`, `0 0 60px ${goldColor}`] // Final heavy pulse
                }}
                exit={{ opacity: 0, transition: { duration: 0.5 } }} // Master container exits right after anyway
                transition={{ duration: 2.5, ease: "easeInOut" }}
                style={{ 
                  position: 'relative',
                  fontFamily: '"Poppins", sans-serif', 
                  fontWeight: 300,
                  textTransform: 'uppercase',
                  color: goldColor, 
                  textAlign: 'center', 
                  margin: 0,
                  padding: '0 24px',
                  fontSize: 'clamp(1.2rem, 3.5vw, 2.5rem)',
                }}
              >
                Tells a Story

                {/* Premium Shimmer sweep inside the text container */}
                <motion.div
                  initial={{ left: '-100%' }}
                  animate={{ left: '200%' }}
                  transition={{ duration: 1.5, delay: 0.6, ease: "easeInOut" }}
                  style={{
                    position: 'absolute',
                    top: 0, bottom: 0,
                    zIndex: 20,
                    pointerEvents: 'none',
                    mixBlendMode: 'overlay',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9), transparent)',
                    transform: 'skewX(-25deg)',
                    width: '60%'
                  }}
                />
              </motion.h3>
            )}

          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LuxuryTextIntro;
