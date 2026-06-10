'use client';

import { useState, useEffect, useRef } from 'react';

export function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down'>('down');
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = docHeight > 0 ? currentScrollY / docHeight : 0;

      setScrollY(currentScrollY);
      setProgress(Math.min(1, Math.max(0, currentProgress)));
      setDirection(currentScrollY > lastScrollY.current ? 'down' : 'up');
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { progress, scrollY, direction };
}
