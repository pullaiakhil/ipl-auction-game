'use client';

import { motion } from 'framer-motion';
import { Zap, Users, BarChart3, Trophy, Gamepad2, Brain } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Real-Time Auctions',
    description: 'Experience the thrill of live IPL auctions with real-time bidding, countdowns, and instant updates.',
    gradient: 'from-amber-500 to-orange-600',
    delay: 0,
  },
  {
    icon: Brain,
    title: 'Smart AI Opponents',
    description: '5 unique AI personalities compete strategically — from aggressive bidders to value seekers.',
    gradient: 'from-purple-500 to-indigo-600',
    delay: 0.1,
  },
  {
    icon: Gamepad2,
    title: 'Match Simulation',
    description: 'Watch your team play! Ball-by-ball T20 simulation with dynamic commentary and realistic outcomes.',
    gradient: 'from-emerald-500 to-teal-600',
    delay: 0.2,
  },
  {
    icon: Users,
    title: 'Multiplayer Battles',
    description: 'Create or join rooms with up to 10 players. Compete with friends in heated auction showdowns.',
    gradient: 'from-blue-500 to-cyan-600',
    delay: 0.3,
  },
  {
    icon: Trophy,
    title: 'Career Mode',
    description: 'Build a dynasty across multiple seasons. Manage retentions, trade players, and chase championships.',
    gradient: 'from-yellow-500 to-amber-600',
    delay: 0.4,
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    description: 'Track spending patterns, player valuations, team balance, and auction trends with rich visualizations.',
    gradient: 'from-pink-500 to-rose-600',
    delay: 0.5,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-32 px-4 bg-[#030014]">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030014] via-[#0a0a2e] to-[#030014]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-sm tracking-[0.3em] uppercase text-indigo-400 font-medium mb-4">
            Why Choose Us
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Everything You Need
            </span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            The most comprehensive IPL auction simulator ever built. Every feature designed
            for an unparalleled cricket gaming experience.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm
                         hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-500
                         hover:shadow-[0_0_60px_-12px_rgba(99,102,241,0.15)]"
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} p-0.5 mb-6
                              group-hover:scale-110 transition-transform duration-300`}>
                <div className="w-full h-full rounded-[10px] bg-[#0a0a1a] flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-200 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors duration-300">
                {feature.description}
              </p>

              {/* Hover glow */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 
                              group-hover:opacity-[0.03] transition-opacity duration-500`} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
