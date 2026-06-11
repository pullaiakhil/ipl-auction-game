'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { Search, Filter, X, Trophy, TrendingUp, Star, Award, HelpCircle } from 'lucide-react';
import { Loader } from '@/components/ui/Loader';

interface AuctionPlayer {
  id: string;
  name: string;
  role: string;
  country: string;
  nationality: string;
  basePrice: number;
  overallRating: number;
  battingRating: number;
  bowlingRating: number;
  stats: Record<string, number>;
}

interface Bid {
  teamName: string;
  amount: number;
  timestamp: number;
  isRTM: boolean;
}

interface TeamBudget {
  id: string;
  teamName: string;
  teamShortName: string;
  teamColor: string;
  budget: number;
  initialBudget: number;
  playerCount: number;
  overseasCount: number;
  isAI: boolean;
  players?: AuctionPlayer[];
}

type Phase = 'WAITING' | 'PLAYER_REVEAL' | 'BIDDING' | 'GOING_ONCE' | 'GOING_TWICE' | 'SOLD' | 'UNSOLD' | 'PAUSED' | 'COMPLETE';

export default function AuctionRoomPage() {
  const params = useParams();
  const roomId = params?.id as string;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [phase, setPhase] = useState<Phase>('WAITING');
  const [currentPlayer, setCurrentPlayer] = useState<AuctionPlayer | null>(null);
  const [currentBid, setCurrentBid] = useState(0);
  const [currentBidder, setCurrentBidder] = useState('');
  const [timer, setTimer] = useState(15);
  const [bidHistory, setBidHistory] = useState<Bid[]>([]);
  const [teams, setTeams] = useState<TeamBudget[]>([]);
  const [soldPlayer, setSoldPlayer] = useState<{ player: AuctionPlayer; buyer: string; price: number } | null>(null);
  const [chatMessages, setChatMessages] = useState<{ userName: string; content: string; timestamp: number }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // Additional stats and pool trackers
  const [soldPlayersList, setSoldPlayersList] = useState<{ player: AuctionPlayer; buyer: string; price: number }[]>([]);
  const [unsoldPlayersList, setUnsoldPlayersList] = useState<AuctionPlayer[]>([]);
  const [remainingPlayersList, setRemainingPlayersList] = useState<AuctionPlayer[]>([]);
  
  // Right panel tabs and filters
 const [activeTab, setActiveTab] = useState<
  'bids' | 'chat' | 'pool' | 'squads'
>('bids');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [nationalityFilter, setNationalityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Modal for team squads
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Handle automatic guest login if token is missing
  useEffect(() => {
    const checkAuth = async () => {
      let token = localStorage.getItem('token');
      if (!token) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'}/api/auth/guest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          });
          const data = await res.json();
          if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        } catch (err) {
          console.error('Auto guest login failed:', err);
        }
      }
      setAuthReady(true);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!authReady) return;

    const token = localStorage.getItem('token') || '';
    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    s.on('connect', () => {
      s.emit('auction:getState', { roomId }, (res: any) => {
        if (res.success) {
          const state = res.state;
          setPhase(state.phase);
          setCurrentPlayer(state.currentPlayer);
          setCurrentBid(state.currentBid);
          setTeams(state.participants);
          setTimer(state.timer);
          setBidHistory(state.bidHistory || []);
          setCurrentBidder(state.currentBidderName || '');
          
          setSoldPlayersList(state.soldPlayers || []);
          setUnsoldPlayersList(state.unsoldPlayers || []);
          setRemainingPlayersList(state.remainingPlayers || []);
        }
      });
    });

    s.on('auction:playerRevealed', (data) => {
      setCurrentPlayer(data.player);
      setCurrentBid(data.player.basePrice);
      setCurrentBidder('');
      setBidHistory([]);
      setPhase('PLAYER_REVEAL');
      setSoldPlayer(null);
    });

    s.on('auction:biddingStarted', (data) => {
      setPhase('BIDDING');
      setTimer(data.timer);
    });

    s.on('auction:bidPlaced', (data) => {
      setCurrentBid(data.currentBid);
      setCurrentBidder(data.currentBidderName || data.currentBidder);
      setTimer(data.timer);
      setBidHistory(prev => [data.bid, ...prev]);
      setPhase('BIDDING');
    });

    s.on('auction:timerTick', (data) => setTimer(data.timer));
    s.on('auction:goingOnce', () => setPhase('GOING_ONCE'));
    s.on('auction:goingTwice', () => setPhase('GOING_TWICE'));

    s.on('auction:playerSold', (data) => {
      setPhase('SOLD');
      setSoldPlayer({ player: data.player, buyer: data.buyer.teamName, price: data.price });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
      
      // Update sold lists and remaining lists
      setSoldPlayersList(prev => [...prev, { player: data.player, buyer: data.buyer.teamShortName, price: data.price }]);
      setRemainingPlayersList(prev => prev.filter(p => p.id !== data.player.id));

      // Update team budgets and squads in teams state
      setTeams(prev => prev.map(t => {
        if (t.id === data.buyer.id) {
          const prevPlayers = t.players || [];
          return {
            ...t,
            budget: data.buyerBudgetRemaining,
            playerCount: data.buyerPlayerCount,
            overseasCount: data.player.nationality === 'OVERSEAS' ? t.overseasCount + 1 : t.overseasCount,
            players: [...prevPlayers, data.player]
          };
        }
        return t;
      }));
    });

    s.on('auction:playerUnsold', (data) => {
      setPhase('UNSOLD');
      setUnsoldPlayersList(prev => [...prev, data.player]);
      setRemainingPlayersList(prev => prev.filter(p => p.id !== data.player.id));
    });

    s.on('auction:complete', () => setPhase('COMPLETE'));
    s.on('auction:paused', () => setPhase('PAUSED'));
    s.on('auction:resumed', () => setPhase('BIDDING'));
    s.on('auction:rtmUsed', (data) => {
      setCurrentBidder(data.participant);
      setPhase('BIDDING');
      const newBid = {
        teamName: data.participant,
        amount: data.amount,
        timestamp: Date.now(),
        isRTM: true,
      };
      setBidHistory(prev => [newBid, ...prev]);
      toast.info(`${data.participant} used RTM for ${data.player || 'player'}!`);
    });

    s.on('chat:message', (msg) => {
      setChatMessages(prev => [...prev, msg].slice(-100));
    });

    setSocket(s);
    return () => { s.disconnect(); };
  }, [authReady, roomId]);

  const placeBid = useCallback(() => {
    if (!socket) return;
    // Calculate minimum bid increment
    let increment = 5;
    if (currentBid >= 1000) increment = 25;
    else if (currentBid >= 500) increment = 20;
    else if (currentBid >= 100) increment = 10;

    const bidAmount = currentBid + increment;
    socket.emit('auction:bid', { roomId, amount: bidAmount }, (res: any) => {
      if (!res.success) {
        toast.error(res.error || 'Bid failed');
      }
    });
  }, [socket, roomId, currentBid]);

  const sendChat = useCallback(() => {
    if (!socket || !chatInput.trim()) return;
    socket.emit('chat:message', { roomId, content: chatInput });
    setChatInput('');
  }, [socket, roomId, chatInput]);

  const formatPrice = (lakhs: number) => {
    if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(2)} Cr`;
    return `₹${lakhs} L`;
  };

  // Helper to filter players for the Pool tab
  const getFilteredPlayers = () => {
    let list: Array<{ player: AuctionPlayer; status: 'SOLD' | 'UNSOLD' | 'UPCOMING'; buyer?: string; soldPrice?: number }> = [];
    
    soldPlayersList.forEach(item => {
      list.push({ player: item.player, status: 'SOLD', buyer: item.buyer, soldPrice: item.price });
    });
    
    unsoldPlayersList.forEach(p => {
      list.push({ player: p, status: 'UNSOLD' });
    });
    
    remainingPlayersList.forEach(p => {
      if (currentPlayer?.id !== p.id) {
        list.push({ player: p, status: 'UPCOMING' });
      }
    });

    // Apply Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => 
        item.player.name.toLowerCase().includes(q) || 
        item.player.role.toLowerCase().includes(q) ||
        item.player.country.toLowerCase().includes(q)
      );
    }

    // Apply Role Filter
    if (roleFilter !== 'ALL') {
      list = list.filter(item => item.player.role === roleFilter);
    }

    // Apply Nationality Filter
    if (nationalityFilter !== 'ALL') {
      list = list.filter(item => item.player.nationality === nationalityFilter);
    }

    // Apply Status Filter
    if (statusFilter !== 'ALL') {
      list = list.filter(item => item.status === statusFilter);
    }

    return list.sort((a, b) => b.player.overallRating - a.player.overallRating);
  };

  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  const timerColor = timer > 10 ? 'text-emerald-400' : timer > 5 ? 'text-yellow-400' : 'text-red-400';
  const timerBgColor = timer > 10 ? 'stroke-emerald-400' : timer > 5 ? 'stroke-yellow-400' : 'stroke-red-400';

  // Stats calculations
  const highestPurchase = soldPlayersList.reduce((max, p) => p.price > max.price ? p : max, { price: 0 } as any);
  const lowestPurchase = soldPlayersList.reduce((min, p) => p.price < min.price ? p : min, { price: Infinity } as any);

  if (!authReady) {
    return <Loader />;
  }

  return (
    <div className="h-screen bg-[#030014] flex flex-col overflow-hidden noise-overlay">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          {Array.from({ length: 60 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-sm"
              style={{
                backgroundColor: ['#FFD700', '#6366f1', '#ec4899', '#10b981', '#f59e0b'][i % 5],
                left: `${Math.random() * 100}%`,
                top: -20,
              }}
              animate={{
                y: [0, window.innerHeight + 100],
                x: [0, (Math.random() - 0.5) * 200],
                rotate: [0, Math.random() * 720],
                opacity: [1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Top Bar */}
      <div className="h-14 border-b border-white/[0.06] bg-[#0a0a1a]/85 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 glow-emerald animate-pulse" />
          <span className="text-sm font-bold text-gray-400 tracking-wider">LIVE IPL AUCTION</span>
          <span className="text-[10px] tracking-wide uppercase font-extrabold text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 bg-amber-500/10">
            {phase.replace('_', ' ')}
          </span>
        </div>
        <div className="text-sm text-gray-400">
          Lobby: <span className="text-white font-mono font-bold">{roomId?.slice(0, 8)}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel - Teams & Budgets */}
        <div className="w-80 border-r border-white/[0.06] bg-[#0a0a1a]/45 flex flex-col justify-between shrink-0 hidden lg:flex">
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Franchise Budgets</h3>
              <span className="text-[10px] text-gray-500">Click to view squads</span>
            </div>
            
            <div className="space-y-2">
              {teams.map(team => {
                // Calculate role counts
                const teamPlayers = team.players || [];
                const bats = teamPlayers.filter(p => p.role === 'BATSMAN').length;
                const bowls = teamPlayers.filter(p => p.role === 'BOWLER').length;
                const ar = teamPlayers.filter(p => p.role === 'ALL_ROUNDER').length;
                const wk = teamPlayers.filter(p => p.role === 'WICKET_KEEPER').length;

                return (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-300 hover:border-white/10 hover:bg-white/[0.03] group ${
                      currentBidder === team.teamName
                        ? 'border-amber-500/40 bg-amber-500/5 glow-amber'
                        : 'border-white/[0.04] bg-white/[0.01]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-md"
                             style={{ backgroundColor: team.teamColor }}>
                          {team.teamShortName?.slice(0, 3)}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">{team.teamShortName}</span>
                          {team.isAI && <span className="ml-1.5 text-[8px] text-gray-500 px-1 rounded bg-white/5 border border-white/10">AI</span>}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-white">{formatPrice(team.budget)}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-500">
                      <span>Players: <strong className="text-gray-300">{teamPlayers.length}/25</strong> (O: <strong className="text-gray-300">{team.overseasCount || 0}/8</strong>)</span>
                      <div className="flex gap-1">
                        <span title="Batsmen" className="px-1 rounded bg-blue-500/10 text-blue-400">{bats}</span>
                        <span title="Wicket-Keepers" className="px-1 rounded bg-emerald-500/10 text-emerald-400">{wk}</span>
                        <span title="All-Rounders" className="px-1 rounded bg-purple-500/10 text-purple-400">{ar}</span>
                        <span title="Bowlers" className="px-1 rounded bg-red-500/10 text-red-400">{bowls}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Purchases List */}
          {soldPlayersList.length > 0 && (
            <div className="p-4 border-t border-white/[0.06] bg-white/[0.01]">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Trophy size={12} className="text-amber-500" /> Recent Purchases
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {soldPlayersList.slice(-5).reverse().map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                    <div className="truncate pr-2">
                      <span className="font-bold text-white block">{item.player.name}</span>
                      <span className="text-[9px] text-gray-500">{item.buyer}</span>
                    </div>
                    <span className="font-bold text-emerald-400 shrink-0">{formatPrice(item.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Left Sidebar Footer - Auction Stats */}
          <div className="p-4 border-t border-white/[0.06] bg-[#050510]/80 backdrop-blur-md">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <TrendingUp size={12} className="text-amber-500" /> Auction statistics
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="p-2 rounded-lg bg-white/[0.01] border border-white/[0.04]">
                <div className="text-[9px] text-gray-500 uppercase">Sold Players</div>
                <div className="text-sm font-bold text-white">{soldPlayersList.length}</div>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.01] border border-white/[0.04]">
                <div className="text-[9px] text-gray-500 uppercase">Remaining Pool</div>
                <div className="text-sm font-bold text-white">{remainingPlayersList.length}</div>
              </div>
            </div>
            
            {highestPurchase.price > 0 && (
              <div className="space-y-1.5 text-[11px] text-gray-400 border-t border-white/[0.04] pt-2">
                <div className="flex justify-between items-center">
                  <span>Record Buy:</span>
                  <span className="font-bold text-amber-400">{highestPurchase.player.name} ({formatPrice(highestPurchase.price)})</span>
                </div>
                {lowestPurchase.price !== Infinity && lowestPurchase.price > 0 && (
                  <div className="flex justify-between items-center">
                    <span>Base Buy:</span>
                    <span className="font-bold text-gray-300">{lowestPurchase.player.name} ({formatPrice(lowestPurchase.price)})</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center Stage - Live Card & Bidding */}
        <div className="flex-1 flex flex-col items-center justify-between relative p-6 bg-[#040410]/20 overflow-y-auto custom-scrollbar">
          
          {/* Latest sold player slide-in banner */}
          <div className="w-full max-w-lg mb-2">
            <AnimatePresence>
              {soldPlayersList.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between px-4 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs shadow-md shadow-emerald-500/5"
                >
                  <div className="flex items-center gap-1.5">
                    <Trophy size={14} />
                    <span>Latest Purchase: <strong>{soldPlayersList[soldPlayersList.length - 1].player.name}</strong></span>
                  </div>
                  <span>Sold to <strong>{soldPlayersList[soldPlayersList.length - 1].buyer}</strong> for <strong>{formatPrice(soldPlayersList[soldPlayersList.length - 1].price)}</strong></span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Current Player Hammer Card */}
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg my-auto">
            <AnimatePresence mode="wait">
              {currentPlayer && phase !== 'COMPLETE' && (
                <motion.div
                  key={currentPlayer.id}
                  initial={{ opacity: 0, y: 25, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -25, scale: 0.98 }}
                  transition={{ duration: 0.4 }}
                  className="w-full relative"
                >
                  {/* Player Card Frame */}
                  <div className="relative rounded-2xl border border-white/[0.08] bg-[#070718]/60 backdrop-blur-xl p-8 mb-6 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-2xl pointer-events-none" />
                    
                    {/* Star / Rating badge */}
                    <div className="absolute top-4 right-4 w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex flex-col items-center justify-center shadow-lg border border-yellow-400/20">
                      <span className="text-2xl font-black text-black leading-none">{currentPlayer.overallRating}</span>
                      <span className="text-[8px] font-bold text-black uppercase tracking-wider">OVR</span>
                    </div>

                    {/* Ownership badge if sold or unsold */}
                    <div className="absolute top-4 left-4">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded bg-white/5 border border-white/10 text-gray-400">
                        {soldPlayersList.some(s => s.player.id === currentPlayer.id) ? 'SOLD' : 'UNSOLD PLAYER'}
                      </span>
                    </div>

                    {/* Player Info */}
                    <div className="mb-6 mt-4 text-center">
                      <span className="text-xs uppercase tracking-widest text-amber-500 font-extrabold block mb-1">
                        {currentPlayer.role.replace('_', ' ')}
                      </span>
                      <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-2">{currentPlayer.name}</h2>
                      
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                        <span>{currentPlayer.country}</span>
                        <span className="text-gray-700">•</span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          currentPlayer.nationality === 'OVERSEAS'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-green-500/10 text-green-400 border border-green-500/20'
                        }`}>
                          {currentPlayer.nationality}
                        </span>
                      </div>
                    </div>

                    {/* Stats distribution grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                        <div className="text-[10px] text-gray-500 uppercase font-medium">BATTING</div>
                        <div className="text-lg font-black text-white mt-0.5">{currentPlayer.battingRating}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                        <div className="text-[10px] text-gray-500 uppercase font-medium">BOWLING</div>
                        <div className="text-lg font-black text-white mt-0.5">{currentPlayer.bowlingRating}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                        <div className="text-[10px] text-gray-500 uppercase font-medium">BASE PRICE</div>
                        <div className="text-lg font-black text-amber-400 mt-0.5">{formatPrice(currentPlayer.basePrice)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Live Bid details */}
                  <div className="text-center mb-6">
                    <div className="text-xs text-gray-500 uppercase tracking-widest mb-1.5 font-bold">
                      {currentBidder ? `Current Bidder: ${currentBidder}` : 'Awaiting Bids'}
                    </div>
                    <motion.div
                      key={currentBid}
                      initial={{ scale: 1.15, opacity: 0.8 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.15 }}
                      className="text-6xl font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent leading-none"
                    >
                      {formatPrice(currentBid)}
                    </motion.div>
                  </div>

                  {/* Timer display */}
                  <div className="flex justify-center mb-6">
                    <div className="relative w-24 h-24">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="5" />
                        <circle
                          cx="50" cy="50" r="44" fill="none"
                          className={`${timerBgColor} transition-all duration-1000`}
                          strokeWidth="5" strokeLinecap="round"
                          strokeDasharray={`${(timer / 15) * 276} 276`}
                        />
                      </svg>
                      <div className={`absolute inset-0 flex flex-col items-center justify-center ${timerColor}`}>
                        <span className="text-3xl font-black leading-none">{timer}</span>
                        <span className="text-[8px] font-bold uppercase tracking-wider text-gray-500 mt-1">secs</span>
                      </div>
                    </div>
                  </div>

                  {/* Going Once / Twice Indicator */}
                  <div className="h-8 flex items-center justify-center mb-6">
                    <AnimatePresence>
                      {(phase === 'GOING_ONCE' || phase === 'GOING_TWICE') && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-lg font-black text-rose-500 tracking-widest uppercase animate-pulse"
                        >
                          {phase === 'GOING_ONCE' ? 'Going once...' : 'Going twice...'}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Action Bid Button */}
                  {(phase === 'BIDDING' || phase === 'GOING_ONCE' || phase === 'GOING_TWICE') && (
                    <div className="flex justify-center">
                      <button
                        onClick={placeBid}
                        className="px-16 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-xl shadow-xl shadow-amber-500/10
                                 hover:from-amber-400 hover:to-yellow-400 hover:scale-105 active:scale-98 transition-all duration-200"
                      >
                        BID {formatPrice(currentBid + (currentBid >= 1000 ? 25 : currentBid >= 500 ? 20 : currentBid >= 100 ? 10 : 5))}
                      </button>
                    </div>
                  )}

                  {/* SOLD display popup */}
                  <AnimatePresence>
                    {phase === 'SOLD' && soldPlayer && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 rounded-2xl border border-emerald-500/20 backdrop-blur-md z-20"
                      >
                        <Award size={64} className="text-amber-400 mb-3 animate-bounce" />
                        <div className="text-6xl font-black text-amber-400 tracking-wider mb-2">SOLD!</div>
                        <div className="text-2xl font-bold text-white mb-1">{soldPlayer.buyer}</div>
                        <div className="text-xl font-black text-emerald-400">{formatPrice(soldPlayer.price)}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* UNSOLD display popup */}
                  <AnimatePresence>
                    {phase === 'UNSOLD' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 rounded-2xl border border-white/10 backdrop-blur-md z-20"
                      >
                        <HelpCircle size={64} className="text-gray-500 mb-3" />
                        <div className="text-5xl font-black text-gray-500 tracking-widest uppercase">UNSOLD</div>
                        <p className="text-sm text-gray-500 mt-2">No bids placed within time</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* COMPLETE layout */}
          {phase === 'COMPLETE' && (
            <div className="text-center my-auto flex flex-col items-center justify-center">
              <div className="text-7xl mb-4 animate-bounce">🏆</div>
              <h2 className="text-4xl font-black text-white tracking-tight mb-2">Auction Finished!</h2>
              <p className="text-gray-400 max-w-sm mb-8 text-sm">All player pools have been exhausted. All franchise rosters are locked.</p>
              <a href="/dashboard" className="px-10 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold hover:from-amber-400 hover:to-yellow-400 shadow-lg transition-colors">
                Return to Dashboard
              </a>
            </div>
          )}
        </div>

        {/* Right Panel - Tabbed Bid logs, chat, & search */}
        <div className="w-80 border-l border-white/[0.06] bg-[#0a0a1a]/45 flex flex-col shrink-0 hidden xl:flex">
          
          {/* Tab Header bar */}
          <div className="flex border-b border-white/[0.06] bg-[#070712]/60 p-1">
            {[
              { id: 'bids', label: 'Bids' },
              { id: 'chat', label: 'Chat' },
              { id: 'pool', label: 'Pool' },
              { id: 'squads', label: 'Squads' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white/5 border border-white/10 text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Panels */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            
            {/* Bid log tab */}
            {activeTab === 'bids' && (
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
                {bidHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-xs text-gray-500">
                    <span>Awaiting first bid...</span>
                  </div>
                ) : (
                  bidHistory.map((bid, i) => (
                    <motion.div
                      key={`${bid.timestamp}-${i}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.01] border border-white/[0.04]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-300">{bid.teamName}</span>
                        {bid.isRTM && <span className="text-[8px] uppercase tracking-wider font-black text-pink-400 px-1 py-0.5 rounded bg-pink-500/10 border border-pink-500/20">RTM</span>}
                      </div>
                      <span className="text-xs font-bold text-amber-400">{formatPrice(bid.amount)}</span>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* Chat Box tab */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {chatMessages.length === 0 && (
                    <div className="h-full flex items-center justify-center text-xs text-gray-500">
                      <span>Start messaging...</span>
                    </div>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div key={i} className="text-xs flex flex-col gap-0.5 bg-white/[0.01] border border-white/[0.04] p-2 rounded-lg">
                      <span className="text-indigo-400 font-extrabold">{msg.userName}</span>
                      <span className="text-gray-300">{msg.content}</span>
                    </div>
                  ))}
                </div>
                
                <div className="p-3 border-t border-white/[0.06] bg-[#050510]/80">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendChat()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-gray-600
                               focus:outline-none focus:border-indigo-500/50"
                    />
                    <button onClick={sendChat} className="px-3 py-2 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold hover:bg-indigo-500/30">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Search & Pool tab */}
            {activeTab === 'pool' && (
              <div className="flex-1 flex flex-col overflow-hidden p-3 space-y-3">
                {/* Filters layout */}
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search player, role..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                    />
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  </div>
                  
                  {/* Select filters */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <select
                      value={roleFilter}
                      onChange={e => setRoleFilter(e.target.value)}
                      className="bg-[#050510] border border-white/10 text-[10px] text-gray-400 rounded p-1"
                    >
                      <option value="ALL">Role: All</option>
                      <option value="BATSMAN">BAT</option>
                      <option value="BOWLER">BOWL</option>
                      <option value="ALL_ROUNDER">AR</option>
                      <option value="WICKET_KEEPER">WK</option>
                    </select>

                    <select
                      value={nationalityFilter}
                      onChange={e => setNationalityFilter(e.target.value)}
                      className="bg-[#050510] border border-white/10 text-[10px] text-gray-400 rounded p-1"
                    >
                      <option value="ALL">Nation: All</option>
                      <option value="INDIAN">INDIAN</option>
                      <option value="OVERSEAS">OVERSEAS</option>
                    </select>

                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="bg-[#050510] border border-white/10 text-[10px] text-gray-400 rounded p-1"
                    >
                      <option value="ALL">State: All</option>
                      <option value="SOLD">SOLD</option>
                      <option value="UNSOLD">UNSOLD</option>
                      <option value="UPCOMING">UPCOMING</option>
                    </select>
                  </div>
                </div>

                {/* Player Pool List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                  {getFilteredPlayers().length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-gray-500">
                      <span>No matching players found</span>
                    </div>
                  ) : (
                    getFilteredPlayers().map(({ player, status, buyer, soldPrice }) => (
                      <div key={player.id} className="p-2 rounded-lg bg-white/[0.01] border border-white/[0.04] text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <strong className="text-white truncate max-w-[120px]">{player.name}</strong>
                          <span className="text-[9px] text-gray-500">{player.role.replace('_', ' ')} • {player.overallRating} OVR</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-gray-400">
                          <span>Base: {formatPrice(player.basePrice)}</span>
                          {status === 'SOLD' ? (
                            <span className="text-emerald-400 font-semibold">{buyer} ({formatPrice(soldPrice || 0)})</span>
                          ) : status === 'UNSOLD' ? (
                            <span className="text-rose-500 font-semibold uppercase">Unsold</span>
                          ) : (
                            <span className="text-amber-500 font-semibold">Upcoming</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Squads tab */}
            {activeTab === 'squads' && (
              <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-3">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Team Squads</h4>
                <div className="space-y-2">
                  {teams.map(team => {
                    const squad = team.players || [];
                    return (
                      <div key={team.id} className="p-2.5 rounded-xl border border-white/[0.04] bg-white/[0.01]">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: team.teamColor }} />
                            <span className="text-xs font-bold text-white">{team.teamShortName}</span>
                          </div>
                          <span className="text-[10px] text-gray-400">{squad.length}/25 ({formatPrice(team.budget)})</span>
                        </div>
                        {squad.length === 0 ? (
                          <div className="text-[10px] text-gray-600 italic px-1">No players bought</div>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {squad.map(p => (
                              <span key={p.id} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-gray-300" title={p.role.replace('_', ' ')}>
                                {p.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide-over Modal: Franchise Squad View */}
      <AnimatePresence>
        {selectedTeamId && selectedTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[85vh] rounded-2xl border border-white/[0.08] bg-[#070716]/95 backdrop-blur-2xl p-6 flex flex-col justify-between shadow-2xl relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedTeamId(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              {/* Roster Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-lg"
                     style={{ backgroundColor: selectedTeam.teamColor }}>
                  {selectedTeam.teamShortName?.slice(0, 3)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedTeam.teamName} Squad</h3>
                  <p className="text-xs text-gray-400">
                    Remaining Budget: <strong className="text-amber-400">{formatPrice(selectedTeam.budget)}</strong> • Max limit: {formatPrice(selectedTeam.initialBudget || 12000)}
                  </p>
                </div>
              </div>

              {/* Roster Metrics Dashboard */}
              <div className="grid grid-cols-5 gap-3 mb-6 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <div className="text-[9px] text-gray-500 uppercase">Players</div>
                  <div className="text-lg font-black text-white">{(selectedTeam.players || []).length}/25</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <div className="text-[9px] text-gray-500 uppercase">Overseas</div>
                  <div className="text-lg font-black text-white">{selectedTeam.overseasCount || 0}/8</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <div className="text-[9px] text-gray-500 uppercase">Indian</div>
                  <div className="text-lg font-black text-white">{(selectedTeam.players || []).length - (selectedTeam.overseasCount || 0)}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <div className="text-[9px] text-gray-500 uppercase">Purse Spent</div>
                  <div className="text-lg font-black text-amber-500">{formatPrice(selectedTeam.initialBudget - selectedTeam.budget)}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <div className="text-[9px] text-gray-500 uppercase">Role Spread</div>
                  <div className="flex justify-center gap-1.5 mt-1 font-bold text-[10px]">
                    <span className="text-blue-400" title="Batsmen">{(selectedTeam.players || []).filter(p => p.role === 'BATSMAN').length}B</span>
                    <span className="text-emerald-400" title="Wicket Keeper">{(selectedTeam.players || []).filter(p => p.role === 'WICKET_KEEPER').length}W</span>
                    <span className="text-purple-400" title="All-Rounders">{(selectedTeam.players || []).filter(p => p.role === 'ALL_ROUNDER').length}A</span>
                    <span className="text-red-400" title="Bowlers">{(selectedTeam.players || []).filter(p => p.role === 'BOWLER').length}Bo</span>
                  </div>
                </div>
              </div>

              {/* Roster Table list */}
              <div className="flex-1 overflow-y-auto custom-scrollbar border border-white/[0.06] rounded-xl bg-black/30 p-2">
                {(!selectedTeam.players || selectedTeam.players.length === 0) ? (
                  <div className="h-full flex items-center justify-center text-xs text-gray-500 py-12">
                    <span>No players bought by this franchise yet</span>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-gray-500 font-bold uppercase text-[10px]">
                        <th className="p-3">Player Name</th>
                        <th className="p-3 text-center">OVR</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Nationality</th>
                        <th className="p-3 text-right">Bought Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {selectedTeam.players.map((player) => {
                        // Find the sold price from soldList
                        const sale = soldPlayersList.find(s => s.player.id === player.id);
                        const price = sale ? sale.price : player.basePrice;
                        return (
                          <tr key={player.id} className="hover:bg-white/[0.01]">
                            <td className="p-3 font-semibold text-white">{player.name}</td>
                            <td className="p-3 text-center font-bold text-amber-500">{player.overallRating}</td>
                            <td className="p-3 text-gray-400">{player.role.replace('_', ' ')}</td>
                            <td className="p-3 text-gray-400">{player.country}</td>
                            <td className="p-3 text-right font-bold text-amber-400">{formatPrice(price)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
