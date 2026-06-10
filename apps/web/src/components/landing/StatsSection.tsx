'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

function AnimatedCounter({ end, duration = 2, suffix = '', prefix = '' }: { end: number; duration?: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, end, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

const stats = [
  { value: 500, suffix: '+', label: 'Players', description: 'Real cricket players with full stats' },
  { value: 10, suffix: '', label: 'IPL Teams', description: 'All franchise templates included' },
  { value: 8, suffix: '', label: 'Game Modes', description: 'From quick play to career mode' },
  { value: 120, suffix: ' Cr', prefix: '₹', label: 'Auction Purse', description: 'Mega auction budget per team' },
];

export function StatsSection() {
  return (
    <section className="relative py-24 px-4 bg-[#030014]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(251,191,36,0.03),transparent_70%)]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="text-center p-6"
            >
              <div className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent mb-2">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} prefix={stat.prefix || ''} />
              </div>
              <div className="text-lg font-semibold text-white mb-1">{stat.label}</div>
              <div className="text-sm text-gray-500">{stat.description}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
