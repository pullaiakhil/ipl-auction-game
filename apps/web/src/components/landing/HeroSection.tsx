'use client';

import { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

const Scene = dynamic(() => import('@/components/three/Scene').then(mod => ({ default: mod.Scene })), {
  ssr: false,
  loading: () => null,
});

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Minimize artificial delays for faster loading and page entry
    const t1 = setTimeout(() => setLoaded(true), 100);
    const t2 = setTimeout(() => setShowContent(true), 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <section ref={containerRef} className="relative w-full h-screen overflow-hidden bg-[#030014]">
      {/* 3D Scene Background */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence>
          {loaded && (
            <motion.div
              className="w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2, ease: 'easeOut' }}
            >
              <Scene />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#030014] to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-[#030014]/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-end h-full pb-20 px-4">
        <AnimatePresence>
          {showContent && (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Overline */}
              <motion.p
                className="text-sm md:text-base tracking-[0.4em] uppercase text-amber-400/80 font-medium mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                The Ultimate Cricket Experience
              </motion.p>

              {/* Main Headline */}
              <motion.h1
                className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                  THE AUCTION
                </span>
                <br />
                <span className="bg-gradient-to-r from-indigo-300 via-purple-400 to-indigo-500 bg-clip-text text-transparent">
                  BEGINS
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                Build your dream IPL team. Outsmart rival owners. Compete in real-time
                auctions with players worldwide. Experience cricket like never before.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-md mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <a
                  href="/dashboard"
                  className="group relative px-8 py-4 rounded-xl font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(251,191,36,0.3)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl" />
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 text-black tracking-wide">
                    ENTER THE ARENA
                  </span>
                </a>
                <a
                  href="#features"
                  className="px-8 py-4 rounded-xl font-semibold text-lg border border-white/20 text-white/80 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all duration-300"
                >
                  Explore Features
                </a>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-gray-500 tracking-widest uppercase">Scroll</span>
            <motion.div
              className="w-5 h-8 border-2 border-gray-500/30 rounded-full flex justify-center"
              animate={{ borderColor: ['rgba(156,163,175,0.3)', 'rgba(251,191,36,0.5)', 'rgba(156,163,175,0.3)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="w-1 h-2 bg-amber-400/60 rounded-full mt-1.5"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Cinematic letterbox bars */}
      <motion.div
        className="absolute top-0 left-0 right-0 bg-black z-30"
        initial={{ height: '100%' }}
        animate={{ height: 0 }}
        transition={{ delay: 0.3, duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
      />
    </section>
  );
}
