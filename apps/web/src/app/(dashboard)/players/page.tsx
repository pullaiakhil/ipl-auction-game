'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { PlayerCard } from '@/components/ui/PlayerCard';
import Link from 'next/link';

interface Player {
  id: string;
  name: string;
  role: string;
  country: string;
  nationality: string;
  overallRating: number;
  battingRating: number;
  bowlingRating: number;
  fieldingRating: number;
  basePrice: number;
  isMarquee: boolean;
  matches: number;
  runs: number;
  wickets: number;
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [natFilter, setNatFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('overallRating');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPlayers();
  }, [page, roleFilter, natFilter, sortBy, search]);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '24',
        sortBy,
        sortDir: 'desc',
      });
      if (roleFilter !== 'ALL') params.set('role', roleFilter);
      if (natFilter !== 'ALL') params.set('nationality', natFilter);
      if (search) params.set('search', search);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'}/api/players?${params}`
      );
      const data = await res.json();
      if (data.success) {
        setPlayers(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch {
      // Fallback: empty
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] p-6 lg:p-10">
      {/* Back nav */}
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
          Player <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">Database</span>
        </h1>
        <p className="text-gray-500">Browse and explore 500+ IPL players with comprehensive stats</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search players..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-600
                     focus:outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>

        {/* Role filter */}
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 focus:outline-none appearance-none cursor-pointer
                   hover:bg-white/[0.08] transition-colors min-w-[130px]"
        >
          <option value="ALL">All Roles</option>
          <option value="BATSMAN">Batsmen</option>
          <option value="BOWLER">Bowlers</option>
          <option value="ALL_ROUNDER">All-Rounders</option>
          <option value="WICKET_KEEPER">Wicket-Keepers</option>
        </select>

        {/* Nationality */}
        <select
          value={natFilter}
          onChange={e => { setNatFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 focus:outline-none appearance-none cursor-pointer
                   hover:bg-white/[0.08] transition-colors min-w-[130px]"
        >
          <option value="ALL">All Nations</option>
          <option value="INDIAN">Indian</option>
          <option value="OVERSEAS">Overseas</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 focus:outline-none appearance-none cursor-pointer
                   hover:bg-white/[0.08] transition-colors min-w-[140px]"
        >
          <option value="overallRating">Rating</option>
          <option value="basePrice">Base Price</option>
          <option value="runs">Runs</option>
          <option value="wickets">Wickets</option>
          <option value="matches">Matches</option>
        </select>
      </div>

      {/* Player Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {players.map((player, i) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.4 }}
              >
                <PlayerCard
                  name={player.name}
                  role={player.role}
                  country={player.country}
                  nationality={player.nationality as 'INDIAN' | 'OVERSEAS'}
                  overallRating={player.overallRating}
                  battingRating={player.battingRating}
                  bowlingRating={player.bowlingRating}
                  fieldingRating={player.fieldingRating}
                  basePrice={player.basePrice}
                  isMarquee={player.isMarquee}
                  size="sm"
                />
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-400 disabled:opacity-30 hover:bg-white/10 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500 px-4">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-400 disabled:opacity-30 hover:bg-white/10 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
