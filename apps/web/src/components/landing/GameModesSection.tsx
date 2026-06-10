'use client';

import { motion } from 'framer-motion';

const gameModes = [
  {
    title: 'Quick Auction',
    description: 'Fast-paced auction with 80 players. Perfect for a 15-minute session.',
    icon: '⚡',
    color: 'from-amber-500 to-orange-600',
    players: '80 Players',
    duration: '~15 min',
  },
  {
    title: 'Mini Auction',
    description: 'Includes retentions and RTM cards. Strategic squad building.',
    icon: '🎯',
    color: 'from-indigo-500 to-purple-600',
    players: '200 Players',
    duration: '~30 min',
  },
  {
    title: 'Mega Auction',
    description: 'The full IPL experience. 500+ players, complete auction simulation.',
    icon: '🏆',
    color: 'from-yellow-500 to-amber-600',
    players: '500+ Players',
    duration: '~60 min',
  },
  {
    title: 'Career Mode',
    description: 'Multi-season journey. Build a dynasty with retentions, trades, and drafts.',
    icon: '👑',
    color: 'from-emerald-500 to-teal-600',
    players: 'Unlimited',
    duration: 'Ongoing',
  },
  {
    title: 'Multiplayer',
    description: 'Compete with friends in real-time. Up to 10 players per room.',
    icon: '🌐',
    color: 'from-blue-500 to-cyan-600',
    players: '500+ Players',
    duration: 'Variable',
  },
  {
    title: 'AI Challenge',
    description: 'Face off against expert AI teams with unique bidding strategies.',
    icon: '🤖',
    color: 'from-pink-500 to-rose-600',
    players: '500+ Players',
    duration: '~45 min',
  },
];

export function GameModesSection() {
  return (
    <section className="relative py-32 px-4 bg-[#030014] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05),transparent_70%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-sm tracking-[0.3em] uppercase text-amber-400 font-medium mb-4">
            Choose Your Battle
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Game Modes
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gameModes.map((mode, index) => (
            <motion.div
              key={mode.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative rounded-2xl overflow-hidden cursor-pointer"
            >
              {/* Gradient border */}
              <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />

              <div className="relative bg-[#0a0a1a]/90 backdrop-blur-xl m-[1px] rounded-2xl p-8 h-full">
                <div className="text-5xl mb-6">{mode.icon}</div>

                <h3 className="text-2xl font-bold text-white mb-3">{mode.title}</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">{mode.description}</p>

                <div className="flex items-center gap-4 text-sm">
                  <span className="px-3 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10">
                    {mode.players}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10">
                    {mode.duration}
                  </span>
                </div>

                {/* Arrow */}
                <div className="absolute top-8 right-8 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center
                               group-hover:border-amber-400/50 group-hover:bg-amber-400/10 transition-all duration-300">
                  <svg className="w-4 h-4 text-gray-500 group-hover:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
