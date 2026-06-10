'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Gavel, Users, TrendingUp, Trophy, Gamepad2, BarChart3,
  Plus, ArrowRight, Star, Clock
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  totalAuctions: number;
  totalWins: number;
  rating: number;
}

const quickActions = [
  { title: 'New Auction', description: 'Start a solo or multiplayer auction', icon: Plus, href: '/lobby', gradient: 'from-amber-500 to-yellow-600' },
  { title: 'Join Room', description: 'Enter a room code to join friends', icon: Users, href: '/lobby', gradient: 'from-indigo-500 to-purple-600' },
  { title: 'My Teams', description: 'View and manage your squads', icon: Trophy, href: '/team', gradient: 'from-emerald-500 to-teal-600' },
  { title: 'Match Center', description: 'Simulate matches with your teams', icon: Gamepad2, href: '/match', gradient: 'from-pink-500 to-rose-600' },
];

const gameModeCards = [
  { title: 'Quick Auction', icon: '⚡', time: '~15 min', players: 80, description: 'Fast-paced. Perfect for a quick game.' },
  { title: 'Mega Auction', icon: '🏆', time: '~60 min', players: 500, description: 'Full IPL experience with 500+ players.' },
  { title: 'Career Mode', icon: '👑', time: 'Ongoing', players: 500, description: 'Multi-season dynasty building.' },
  { title: 'Multiplayer', icon: '🌐', time: 'Variable', players: 500, description: 'Compete with friends in real-time.' },
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return (
    <div className="min-h-screen bg-[#030014]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0a0a1a]/80 backdrop-blur-xl border-r border-white/[0.04] z-40 hidden lg:block">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center">
              <span className="text-black font-black text-xs">IPL</span>
            </div>
            <span className="text-white font-bold">AUCTION<span className="text-amber-400">.</span></span>
          </Link>

          <nav className="space-y-1">
            {[
              { label: 'Dashboard', icon: BarChart3, href: '/dashboard', active: true },
              { label: 'New Auction', icon: Gavel, href: '/lobby' },
              { label: 'Join Room', icon: Users, href: '/lobby' },
              { label: 'My Teams', icon: Trophy, href: '/team' },
              { label: 'Match Center', icon: Gamepad2, href: '/match' },
              { label: 'Analytics', icon: TrendingUp, href: '/analytics' },
            ].map(item => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  item.active
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-6 lg:p-10">
        {/* Welcome Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
            Welcome back, <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">
              {user?.name || 'Player'}
            </span>
          </h1>
          <p className="text-gray-500">Ready to dominate the auction?</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Auctions Played', value: user?.totalAuctions || 0, icon: Gavel, color: 'amber' },
            { label: 'Victories', value: user?.totalWins || 0, icon: Trophy, color: 'emerald' },
            { label: 'Win Rate', value: user?.totalAuctions ? Math.round((user.totalWins / user.totalAuctions) * 100) : 0, suffix: '%', icon: TrendingUp, color: 'blue' },
            { label: 'Rating', value: user?.rating || 1000, icon: Star, color: 'purple' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
            >
              <div className="flex items-center gap-3 mb-3">
                <stat.icon size={18} className="text-gray-500" />
                <span className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}{stat.suffix || ''}</div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
            >
              <Link
                href={action.href}
                className="group block p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]
                         hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} p-0.5 mb-4
                               group-hover:scale-110 transition-transform duration-300`}>
                  <div className="w-full h-full rounded-[10px] bg-[#0a0a1a] flex items-center justify-center">
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-white mb-1">{action.title}</h3>
                <p className="text-sm text-gray-500">{action.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Game Modes */}
        <h2 className="text-xl font-bold text-white mb-4">Start Playing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gameModeCards.map((mode, i) => (
            <motion.div
              key={mode.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
            >
              <Link
                href="/lobby"
                className="group flex items-center gap-5 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]
                         hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300"
              >
                <div className="text-4xl">{mode.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-1">{mode.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{mode.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1"><Clock size={12} />{mode.time}</span>
                    <span>{mode.players} players</span>
                  </div>
                </div>
                <ArrowRight size={20} className="text-gray-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
