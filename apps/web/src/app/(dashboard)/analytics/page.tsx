'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface TeamAnalytics {
  teamName: string;
  teamColor: string;
  totalSpent: number;
  remainingBudget: number;
  playerCount: number;
  overseasCount: number;
  highestBid: number;
  avgPrice: number;
  spendingByRole: Record<string, number>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<TeamAnalytics[]>([]);

  // Demo data for display
  useEffect(() => {
    setAnalytics([
      { teamName: 'Chennai Super Kings', teamColor: '#FDB913', totalSpent: 8500, remainingBudget: 3500, playerCount: 22, overseasCount: 7, highestBid: 1600, avgPrice: 386, spendingByRole: { BATSMAN: 3200, BOWLER: 2400, ALL_ROUNDER: 1800, WICKET_KEEPER: 1100 } },
      { teamName: 'Mumbai Indians', teamColor: '#004BA0', totalSpent: 9200, remainingBudget: 2800, playerCount: 23, overseasCount: 8, highestBid: 1850, avgPrice: 400, spendingByRole: { BATSMAN: 3800, BOWLER: 2600, ALL_ROUNDER: 1500, WICKET_KEEPER: 1300 } },
      { teamName: 'Royal Challengers Bengaluru', teamColor: '#EC1C24', totalSpent: 9800, remainingBudget: 2200, playerCount: 21, overseasCount: 7, highestBid: 2000, avgPrice: 466, spendingByRole: { BATSMAN: 4200, BOWLER: 2800, ALL_ROUNDER: 1600, WICKET_KEEPER: 1200 } },
      { teamName: 'Kolkata Knight Riders', teamColor: '#3A225D', totalSpent: 8800, remainingBudget: 3200, playerCount: 24, overseasCount: 8, highestBid: 1500, avgPrice: 366, spendingByRole: { BATSMAN: 3000, BOWLER: 2800, ALL_ROUNDER: 2000, WICKET_KEEPER: 1000 } },
      { teamName: 'Gujarat Titans', teamColor: '#1C1C1C', totalSpent: 7600, remainingBudget: 4400, playerCount: 20, overseasCount: 6, highestBid: 1400, avgPrice: 380, spendingByRole: { BATSMAN: 2800, BOWLER: 2200, ALL_ROUNDER: 1800, WICKET_KEEPER: 800 } },
    ]);
  }, []);

  const formatPrice = (lakhs: number) => {
    if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(1)}Cr`;
    return `₹${lakhs}L`;
  };

  return (
    <div className="min-h-screen bg-[#030014] p-6 lg:p-10">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">← Back</Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-2">
          Auction <span className="bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-transparent">Analytics</span>
        </h1>
        <p className="text-gray-500 mb-8">Deep dive into auction spending patterns and team strategies</p>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Spent', value: formatPrice(analytics.reduce((s, a) => s + a.totalSpent, 0)), color: 'amber' },
          { label: 'Avg Per Player', value: formatPrice(Math.round(analytics.reduce((s, a) => s + a.avgPrice, 0) / Math.max(1, analytics.length))), color: 'blue' },
          { label: 'Highest Bid', value: formatPrice(Math.max(...analytics.map(a => a.highestBid), 0)), color: 'pink' },
          { label: 'Teams', value: String(analytics.length), color: 'emerald' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
          >
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">{stat.label}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Team Breakdown */}
      <h2 className="text-xl font-bold text-white mb-4">Team Spending Breakdown</h2>
      <div className="space-y-4">
        {analytics.map((team, i) => {
          const budgetUsed = (team.totalSpent / (team.totalSpent + team.remainingBudget)) * 100;
          return (
            <motion.div
              key={team.teamName}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                       style={{ backgroundColor: team.teamColor }}>
                    {team.teamName.split(' ').map(w => w[0]).join('').slice(0, 3)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{team.teamName}</h3>
                    <p className="text-xs text-gray-500">{team.playerCount} players • {team.overseasCount} overseas</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-amber-400">{formatPrice(team.totalSpent)}</div>
                  <div className="text-xs text-gray-500">Remaining: {formatPrice(team.remainingBudget)}</div>
                </div>
              </div>

              {/* Budget bar */}
              <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden mb-4">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: team.teamColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${budgetUsed}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                />
              </div>

              {/* Role spending */}
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(team.spendingByRole).map(([role, amount]) => (
                  <div key={role} className="p-2 rounded-lg bg-white/[0.02]">
                    <div className="text-[10px] text-gray-500 uppercase">{role.replace('_', ' ')}</div>
                    <div className="text-sm font-bold text-white">{formatPrice(amount)}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
