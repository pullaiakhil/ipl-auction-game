'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface BatterInnings {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  dismissal?: string;
}

interface BowlerFigures {
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
}

interface InningsResult {
  battingTeam: string;
  bowlingTeam: string;
  totalRuns: number;
  wickets: number;
  overs: number;
  runRate: number;
  fours: number;
  sixes: number;
  batters: BatterInnings[];
  bowlers: BowlerFigures[];
  overByOver: { over: number; runs: number; wickets: number; cumulative: number }[];
}

interface MatchResult {
  team1: string;
  team2: string;
  venue: string;
  tossWinner: string;
  tossDecision: string;
  innings1: InningsResult;
  innings2: InningsResult;
  winner: string | null;
  resultText: string;
  playerOfMatch: { name: string; performance: string };
}

export default function MatchPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeInnings, setActiveInnings] = useState<1 | 2>(1);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'}/api/teams`)
      .then(r => r.json())
      .then(d => { if (d.success) setTeams(d.data); })
      .catch(() => {});
  }, []);

  const simulateMatch = async () => {
    if (!team1Id || !team2Id || team1Id === team2Id) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'}/api/matches/simulate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ team1Id, team2Id, venue: 'Wankhede Stadium', pitchType: 'BALANCED' }),
        }
      );
      const data = await res.json();
      if (data.success) setResult(data.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  const innings = result ? (activeInnings === 1 ? result.innings1 : result.innings2) : null;

  return (
    <div className="min-h-screen bg-[#030014] p-6 lg:p-10">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">← Back</Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-2">
          Match <span className="bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">Center</span>
        </h1>
        <p className="text-gray-500 mb-8">Simulate T20 matches with ball-by-ball action</p>
      </motion.div>

      {/* Team Selection */}
      {!result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Team 1</label>
                <select
                  value={team1Id}
                  onChange={e => setTeam1Id(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="">Select Team</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id} disabled={t.id === team2Id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Team 2</label>
                <select
                  value={team2Id}
                  onChange={e => setTeam2Id(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="">Select Team</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id} disabled={t.id === team1Id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-center text-5xl font-black text-gray-700 mb-8">VS</div>

            <button
              onClick={simulateMatch}
              disabled={loading || !team1Id || !team2Id || team1Id === team2Id}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-lg
                       hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 transition-all"
            >
              {loading ? 'Simulating...' : '⚡ Simulate Match'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Match Result */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          {/* Scoreboard */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-center flex-1">
                <h3 className="text-xl font-bold text-white">{result.innings1.battingTeam}</h3>
                <div className="text-3xl font-black text-white mt-1">
                  {result.innings1.totalRuns}/{result.innings1.wickets}
                  <span className="text-lg text-gray-500 ml-2">({result.innings1.overs.toFixed(1)})</span>
                </div>
              </div>
              <div className="text-2xl text-gray-600 px-6">VS</div>
              <div className="text-center flex-1">
                <h3 className="text-xl font-bold text-white">{result.innings2.battingTeam}</h3>
                <div className="text-3xl font-black text-white mt-1">
                  {result.innings2.totalRuns}/{result.innings2.wickets}
                  <span className="text-lg text-gray-500 ml-2">({result.innings2.overs.toFixed(1)})</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-amber-400 font-bold text-lg">{result.resultText}</p>
              <p className="text-sm text-gray-500 mt-1">
                🏅 Player of the Match: {result.playerOfMatch.name} ({result.playerOfMatch.performance})
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Toss: {result.tossWinner} chose to {result.tossDecision} • {result.venue}
              </p>
            </div>
          </div>

          {/* Innings Toggle */}
          <div className="flex rounded-xl bg-white/[0.03] border border-white/[0.06] p-1 mb-6">
            {[1, 2].map(n => (
              <button
                key={n}
                onClick={() => setActiveInnings(n as 1 | 2)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeInnings === n ? 'bg-white/[0.08] text-white' : 'text-gray-500'
                }`}
              >
                {n === 1 ? result.innings1.battingTeam : result.innings2.battingTeam} Innings
              </button>
            ))}
          </div>

          {innings && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Batting */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-3">Batting</h3>
                <div className="space-y-1">
                  <div className="grid grid-cols-6 text-[10px] text-gray-600 uppercase tracking-wider px-2 py-1">
                    <span className="col-span-2">Batter</span><span>R</span><span>B</span><span>4s</span><span>SR</span>
                  </div>
                  {innings.batters.filter(b => b.balls > 0).map((b, i) => (
                    <div key={i} className={`grid grid-cols-6 text-sm px-2 py-1.5 rounded-lg ${b.isOut ? '' : 'bg-emerald-500/5'}`}>
                      <span className="col-span-2 text-white truncate">
                        {b.name}
                        {!b.isOut && <span className="text-emerald-400 ml-1 text-xs">*</span>}
                      </span>
                      <span className={`font-bold ${b.runs >= 50 ? 'text-amber-400' : 'text-white'}`}>{b.runs}</span>
                      <span className="text-gray-400">{b.balls}</span>
                      <span className="text-gray-400">{b.fours}/{b.sixes}</span>
                      <span className={`${b.strikeRate > 150 ? 'text-emerald-400' : 'text-gray-400'}`}>{b.strikeRate.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-gray-500">
                  <span>Extras: —</span>
                  <span>RR: {innings.runRate.toFixed(2)}</span>
                  <span>4s: {innings.fours} | 6s: {innings.sixes}</span>
                </div>
              </div>

              {/* Bowling */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-3">Bowling</h3>
                <div className="space-y-1">
                  <div className="grid grid-cols-6 text-[10px] text-gray-600 uppercase tracking-wider px-2 py-1">
                    <span className="col-span-2">Bowler</span><span>O</span><span>R</span><span>W</span><span>ER</span>
                  </div>
                  {innings.bowlers.filter(b => b.overs > 0).map((b, i) => (
                    <div key={i} className="grid grid-cols-6 text-sm px-2 py-1.5 rounded-lg">
                      <span className="col-span-2 text-white truncate">{b.name}</span>
                      <span className="text-gray-400">{b.overs}</span>
                      <span className="text-gray-400">{b.runs}</span>
                      <span className={`font-bold ${b.wickets >= 3 ? 'text-amber-400' : 'text-white'}`}>{b.wickets}</span>
                      <span className={`${b.economy < 7 ? 'text-emerald-400' : b.economy > 10 ? 'text-red-400' : 'text-gray-400'}`}>
                        {b.economy.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Manhattan / Over by Over */}
          {innings && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 mt-6">
              <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-4">Manhattan Chart</h3>
              <div className="flex items-end gap-1 h-32">
                {innings.overByOver.map((o, i) => {
                  const maxRuns = Math.max(...innings.overByOver.map(x => x.runs), 1);
                  const height = (o.runs / maxRuns) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <motion.div
                        className={`w-full rounded-t-sm ${o.wickets > 0 ? 'bg-red-500' : 'bg-indigo-500'}`}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                      />
                      <span className="text-[8px] text-gray-600">{o.over}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* New Match */}
          <div className="text-center mt-8">
            <button
              onClick={() => setResult(null)}
              className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
            >
              Simulate Another Match
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
