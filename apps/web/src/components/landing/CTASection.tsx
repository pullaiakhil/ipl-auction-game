'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="relative py-32 px-4 bg-[#030014] overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-sm tracking-[0.3em] uppercase text-amber-400/80 font-medium mb-6">
            Ready?
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Build Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Dream Team
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Join thousands of cricket fans in the most immersive IPL auction
            experience ever created. Your stadium awaits.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="group relative px-10 py-5 rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 bg-[length:200%_100%] animate-shimmer rounded-2xl" />
              <div className="absolute inset-[2px] bg-[#0a0a1a] rounded-[14px] group-hover:bg-transparent transition-colors duration-300" />
              <span className="relative z-10 bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent group-hover:text-black transition-all duration-300">
                START PLAYING FREE →
              </span>
            </Link>
          </div>

          <p className="mt-6 text-sm text-gray-600">
            No credit card required • Free forever • Play as guest
          </p>
        </motion.div>
      </div>
    </section>
  );
}
