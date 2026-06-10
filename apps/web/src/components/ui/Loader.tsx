'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_MESSAGES = [
  'Preparing Auction Arena...',
  'Connecting to Lobby...',
  'Generating Guest Credentials...',
  'Synchronizing Real-time Engine...',
  'Polishing the Gavel...',
];

export function Loader() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Rotate messages
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);

    // Fake progress bar loading
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        const remaining = 100 - prev;
        // Slow down as it approaches 100%
        const increment = Math.max(1, Math.floor(Math.random() * remaining * 0.15));
        return prev + increment;
      });
    }, 300);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030014] overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

      {/* Loading Card */}
      <div className="relative w-full max-w-sm p-8 text-center bg-[#0a0a1c]/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-[0_0_50px_rgba(251,191,36,0.05)] mx-4 flex flex-col items-center">
        
        {/* Animated Trophy and Gavel Area */}
        <div className="relative w-40 h-40 flex items-center justify-center mb-6">
          {/* Glowing Pulse Trophy Background */}
          <motion.div
            className="absolute"
            animate={{
              scale: [0.95, 1.05, 0.95],
              opacity: [0.2, 0.35, 0.2],
              filter: ['drop-shadow(0 0 8px rgba(251,191,36,0.2))', 'drop-shadow(0 0 20px rgba(251,191,36,0.4))', 'drop-shadow(0 0 8px rgba(251,191,36,0.2))']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <svg
              width="96"
              height="96"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="trophy-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE259" />
                  <stop offset="100%" stopColor="#FFA751" />
                </linearGradient>
              </defs>
              {/* Custom IPL-style Trophy Silhouette */}
              <path
                d="M30 35H24C21.79 35 20 33.21 20 31V25C20 22.79 21.79 21 24 21H30V35ZM70 35H76C78.21 35 80 33.21 80 31V25C80 22.79 78.21 21 76 21H70V35ZM32 15H68V50C68 59.94 59.94 68 50 68C40.06 68 32 59.94 32 50V15ZM50 68V80H36V85H64V80H50V68ZM50 5C41.72 5 35 11.72 35 20H65C65 11.72 58.28 5 50 5Z"
                fill="url(#trophy-gold)"
              />
            </svg>
          </motion.div>

          {/* Gavel Strike Animation */}
          <div className="absolute bottom-6 right-2 w-16 h-16 z-10 origin-bottom-left">
            <motion.div
              animate={{
                rotate: [0, -35, 10, -5, 0],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                repeatDelay: 0.5,
                ease: 'easeInOut',
              }}
              style={{ originX: 0.15, originY: 0.85 }}
            >
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="gavel-metallic" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a1a1aa" />
                    <stop offset="50%" stopColor="#e4e4e7" />
                    <stop offset="100%" stopColor="#52525b" />
                  </linearGradient>
                  <linearGradient id="gavel-wood" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#78350f" />
                    <stop offset="100%" stopColor="#451a03" />
                  </linearGradient>
                </defs>
                {/* Gavel Head */}
                <rect x="8" y="10" width="16" height="24" rx="3" transform="rotate(-45 8 10)" fill="url(#gavel-metallic)" stroke="#3f3f46" strokeWidth="1" />
                <rect x="14" y="6" width="4" height="28" rx="1" transform="rotate(-45 14 6)" fill="url(#gavel-wood)" />
                {/* Gavel Handle */}
                <rect x="23" y="23" width="6" height="34" rx="2" transform="rotate(-45 23 23)" fill="url(#gavel-wood)" stroke="#1c1917" strokeWidth="0.5" />
                {/* Gavel Band */}
                <rect x="24" y="24" width="6" height="4" transform="rotate(-45 24 24)" fill="url(#trophy-gold)" />
              </svg>
            </motion.div>
          </div>

          {/* Sound wave/shockwave from gavel base */}
          <motion.div
            className="absolute bottom-6 left-12 w-12 h-1 bg-amber-500/80 rounded-full"
            animate={{
              scaleX: [0, 1.4, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              repeatDelay: 0.5,
              ease: 'easeOut',
            }}
          />
        </div>

        {/* Bidding Title Text */}
        <h3 className="text-lg font-bold text-white mb-1 tracking-wide">IPL Auction Simulator</h3>

        {/* Text Transition */}
        <div className="h-6 flex items-center justify-center mb-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="text-xs font-semibold text-amber-400/90 tracking-wide"
            >
              {LOADING_MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.03] mb-2">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut' }}
          />
        </div>

        {/* Progress Percentage */}
        <span className="text-[10px] font-mono text-gray-500 tracking-wider uppercase">
          Initializing... {progress}%
        </span>
      </div>
    </div>
  );
}
