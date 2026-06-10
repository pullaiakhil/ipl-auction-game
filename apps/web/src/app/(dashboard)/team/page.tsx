'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { TeamCard } from '@/components/ui/TeamCard';

interface Team {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  city: string;
  homeGround: string;
  coach: string;
  owner: string;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'}/api/teams`)
      .then(r => r.json())
      .then(d => { if (d.success) { setTeams(d.data); setLoading(false); } })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#030014] p-6 lg:p-10">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">← Back</Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-2">
          IPL <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Teams</span>
        </h1>
        <p className="text-gray-500 mb-8">All 10 IPL franchises — pick your favorite to start an auction</p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {teams.map((team, i) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <TeamCard
                name={team.name}
                shortName={team.shortName}
                primaryColor={team.primaryColor}
                secondaryColor={team.secondaryColor}
                city={team.city}
                homeGround={team.homeGround}
                selected={selectedTeam?.id === team.id}
                onClick={() => setSelectedTeam(team)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Team Detail */}
      {selectedTeam && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 max-w-3xl mx-auto"
        >
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <div className="h-2" style={{ background: `linear-gradient(90deg, ${selectedTeam.primaryColor}, ${selectedTeam.secondaryColor || selectedTeam.primaryColor})` }} />
            <div className="p-8">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
                     style={{ backgroundColor: selectedTeam.primaryColor }}>
                  {selectedTeam.shortName}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedTeam.name}</h2>
                  <p className="text-gray-400">{selectedTeam.city}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Home Ground</div>
                  <div className="text-sm text-white">{selectedTeam.homeGround}</div>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Coach</div>
                  <div className="text-sm text-white">{selectedTeam.coach}</div>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.04] col-span-2">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Owner</div>
                  <div className="text-sm text-white">{selectedTeam.owner}</div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Link
                  href="/lobby"
                  className="flex-1 text-center py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold hover:from-amber-400 hover:to-yellow-400 transition-all"
                >
                  Start Auction with {selectedTeam.shortName}
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
