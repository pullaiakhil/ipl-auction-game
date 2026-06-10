'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#game-modes', label: 'Game Modes' },
    { href: '#players', label: 'Players' },
  ];

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#030014]/80 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center
                           group-hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-shadow duration-300">
              <span className="text-black font-black text-sm">IPL</span>
            </div>
            <span className="text-white font-bold text-lg tracking-wide hidden sm:inline">
              AUCTION<span className="text-amber-400">.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200 tracking-wide"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-300 hover:text-white px-4 py-2 transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold text-black bg-gradient-to-r from-amber-400 to-yellow-500 px-5 py-2 rounded-lg
                        hover:from-amber-300 hover:to-yellow-400 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all duration-300"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-[#030014]/95 backdrop-blur-xl pt-20 px-6 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col gap-6">
              {navLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-2xl text-white font-semibold"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-3 mt-6">
                <Link href="/login" className="text-lg text-gray-300 py-3">Sign In</Link>
                <Link
                  href="/register"
                  className="text-lg font-bold text-black bg-amber-400 py-3 px-6 rounded-xl text-center"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
