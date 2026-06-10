'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Trophy, Medal, Star, TrendingUp } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  auctions: number;
  wins: number;
  winRate: number;
  rating: number;
}

const demoLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'CricketMaster99', auctions: 125, wins: 78, winRate: 62, rating: 2450 },
  { rank: 2, name: 'AuctionKing', auctions: 98, wins: 56, winRate: 57, rating: 2380 },
  { rank: 3, name: 'IPLStrategist', auctions: 110, wins: 61, winRate: 55, rating: 2320 },
  { rank: 4, name: 'BidWarrior', auctions: 87, wins: 44, winRate: 51, rating: 2250 },
  { rank: 5, name: 'SquadBuilder', auctions: 143, wins: 72, winRate: 50, rating: 2200 },
  { rank: 6, name: 'MoneyBaller', auctions: 76, wins: 38, winRate: 50, rating: 2150 },
  { rank: 7, name: 'ValueSeeker', auctions: 92, wins: 44, winRate: 48, rating: 2100 },
  { rank: 8, name: 'CricFan_2024', auctions: 64, wins: 30, winRate: 47, rating: 2050 },
  { rank: 9, name: 'PaddleScoop', auctions: 55, wins: 25, winRate: 45, rating: 2000 },
  { rank: 10, name: 'SixHitter', auctions: 48, wins: 21, winRate: 44, rating: 1950 },
];

const rankIcons = [Trophy, Medal, Star];
const rankColors = ['text-amber-400', 'text-gray-300', 'text-amber-700'];

export default function LeaderboardPage() {
  const [tab, setTab] = useState<'rating' | 'wins' | 'winrate'>('rating');

  const sorted = [...demoLeaderboard].sort((a, b) => {
    if (tab === 'wins') return b.wins - a.wins;
    if (tab === 'winrate') return b.winRate - a.winRate;
    return b.rating - a.rating;
  });

  return (
    <div className="min-h-screen bg-[#030014] p-6 lg:p-10">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">← Back</Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-2">
          <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">Leaderboard</span>
        </h1>
        <p className="text-gray-500 mb-8">Top auction strategists and their records</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-white/[0.03] border border-white/[0.06] p-1 mb-8 max-w-md">
        {[
          { key: 'rating', label: 'Rating' },
          { key: 'wins', label: 'Total Wins' },
          { key: 'winrate', label: 'Win Rate' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key ? 'bg-white/[0.08] text-white' : 'text-gray-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-4 mb-10">
        {[1, 0, 2].map((idx) => {
          const entry = sorted[idx];
          if (!entry) return null;
          const isFirst = idx === 0;
          const Icon = rankIcons[idx] || Star;
          return (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              className={`flex flex-col items-center p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] ${isFirst ? 'pb-10' : 'pb-6'}`}
              style={{ minWidth: isFirst ? 180 : 150 }}
            >
              <Icon size={isFirst ? 32 : 24} className={rankColors[idx]} />
              <div className={`text-lg font-black mt-2 ${isFirst ? 'text-amber-400' : 'text-white'}`}>
                #{idx + 1}
              </div>
              <div className="text-sm font-bold text-white mt-1">{entry.name}</div>
              <div className="text-2xl font-black text-white mt-2">
                {tab === 'rating' ? entry.rating : tab === 'wins' ? entry.wins : `${entry.winRate}%`}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {tab === 'rating' ? 'Rating' : tab === 'wins' ? 'Wins' : 'Win Rate'}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Full Leaderboard */}
      <div className="max-w-3xl mx-auto rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="grid grid-cols-6 text-xs text-gray-500 uppercase tracking-wider px-5 py-3 border-b border-white/[0.04]">
          <span>Rank</span>
          <span className="col-span-2">Player</span>
          <span className="text-center">Auctions</span>
          <span className="text-center">Wins</span>
          <span className="text-right">{tab === 'rating' ? 'Rating' : tab === 'wins' ? 'Wins' : 'Win %'}</span>
        </div>

        {sorted.map((entry, i) => (
          <motion.div
            key={entry.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="grid grid-cols-6 items-center px-5 py-3 text-sm border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
          >
            <span className={`font-bold ${i < 3 ? rankColors[i] : 'text-gray-500'}`}>#{i + 1}</span>
            <span className="col-span-2 font-medium text-white">{entry.name}</span>
            <span className="text-center text-gray-400">{entry.auctions}</span>
            <span className="text-center text-gray-400">{entry.wins}</span>
            <span className="text-right font-bold text-amber-400">
              {tab === 'rating' ? entry.rating : tab === 'wins' ? entry.wins : `${entry.winRate}%`}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
