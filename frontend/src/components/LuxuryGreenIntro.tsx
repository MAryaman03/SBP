import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LuxuryGreenIntroProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

const LuxuryGreenIntro: React.FC<LuxuryGreenIntroProps> = ({ onComplete, forceShow = false }) => {
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

    // 0.0s to 2.0s: Ambient start (step -1)
    const t0 = setTimeout(() => setStep(0), 2000);  // Trigger Line 1 at 2.0s
    
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

  const greenColor = "#00FF9C";

  return (
    <AnimatePresence onExitComplete={handleAnimationComplete}>
      {isVisible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black z-[9999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, transition: { duration: 1.5, ease: "easeInOut" } }}
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
            transition={{ duration: 2, ease: "easeInOut" }}
            style={{ 
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              pointerEvents: 'none',
              background: `radial-gradient(circle at center, rgba(0, 255, 156, 0.08) 0%, rgba(0,0,0,1) 50%)` 
            }} 
          />

          {/* Faint floating particles (dust/smoke feel) */}
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 0.15, y: -50 }}
            transition={{ duration: 10, ease: "linear" }}
            style={{
              position: 'absolute',
              width: '100%',
              height: '200%',
              backgroundImage: 'radial-gradient(circle, #00FF9C 1px, transparent 1px)',
              backgroundSize: '100px 100px',
              pointerEvents: 'none',
              mixBlendMode: 'screen',
              filter: 'blur(1px)'
            }}
          />

          <AnimatePresence mode="wait">
            
            {/* Line 1: Snigdha Beauty Parlour */}
            {step === 0 && (
              <motion.h1
                key="line0"
                initial={{ opacity: 0, scale: 0.9, filter: 'blur(12px)' }}
                animate={{ 
                  opacity: 1, 
                  scale: [0.9, 1, 1.03, 1],
                  filter: ['blur(12px)', 'blur(0px)', 'blur(0px)', 'blur(0px)'],
                  textShadow: [`0 0 0px #000`, `0 0 15px ${greenColor}`, `0 0 35px ${greenColor}`, `0 0 15px ${greenColor}`] 
                }}
                exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.95, transition: { duration: 0.8, ease: "easeOut" } }}
                transition={{ duration: 2, ease: "easeInOut" }}
                style={{ 
                  fontFamily: '"Bodoni Moda", serif', 
                  color: greenColor, 
                  textAlign: 'center', 
                  margin: 0,
                  padding: '0 24px',
                  fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}
              >
                Snigdha Beauty Parlour
              </motion.h1>
            )}

            {/* Line 2: Where Every Glow */}
            {step === 1 && (
              <motion.h2
                key="line1"
                initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: [0.98, 1, 1.02, 1],
                  filter: ['blur(8px)', 'blur(0px)', 'blur(0px)', 'blur(0px)'],
                  textShadow: [`0 0 0px #000`, `0 0 15px ${greenColor}`, `0 0 30px ${greenColor}`, `0 0 15px ${greenColor}`]
                }}
                exit={{ opacity: 0, filter: 'blur(8px)', y: -10, transition: { duration: 0.7, ease: "easeOut" } }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                style={{ 
                  fontFamily: '"Bodoni Moda", serif', 
                  fontStyle: 'italic',
                  color: greenColor, 
                  textAlign: 'center', 
                  margin: 0,
                  padding: '0 24px',
                  fontSize: 'clamp(2rem, 5vw, 4.5rem)',
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
                  textShadow: [`0 0 0px #000`, `0 0 10px ${greenColor}`, `0 0 50px ${greenColor}`] // Final heavy pulse
                }}
                exit={{ opacity: 0, transition: { duration: 0.5 } }} // Master container exits right after anyway
                transition={{ duration: 2.5, ease: "easeInOut" }}
                style={{ 
                  position: 'relative',
                  fontFamily: '"Montserrat", sans-serif', 
                  fontWeight: 300,
                  textTransform: 'uppercase',
                  color: greenColor, 
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

export default LuxuryGreenIntro;
