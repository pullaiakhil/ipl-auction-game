'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Plus, Users, ArrowRight, Copy, Check, Settings } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader } from '@/components/ui/Loader';

export default function LobbyPage() {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [tab, setTab] = useState<'create' | 'join' | 'browse'>('create');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Create room state
  const [roomName, setRoomName] = useState('');
  const [mode, setMode] = useState<'MEGA' | 'MINI' | 'QUICK'>('MEGA');
  const [isPublic, setIsPublic] = useState(true);
  const [enableAI, setEnableAI] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(15);
  const [loading, setLoading] = useState(false);

  // Room state
  const [inRoom, setInRoom] = useState(false);
  const [roomData, setRoomData] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const roomDataRef = useRef<any>(null);

  useEffect(() => {
    roomDataRef.current = roomData;
  }, [roomData]);

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

    s.on('connect', () => console.log('Connected to lobby'));

    s.on('room:playerJoined', (data) => {
      setParticipants(prev => [...prev, data]);
    });

    s.on('room:playerLeft', (data) => {
      setParticipants(prev => prev.filter(p => p.userId !== data.userId));
    });

    s.on('room:teamSelected', (data) => {
      setParticipants(prev => prev.map(p =>
        p.userId === data.userId ? { ...p, teamId: data.teamId, teamName: data.teamName } : p
      ));
    });

    s.on('room:readyStateChanged', (data) => {
      setParticipants(prev => prev.map(p =>
        p.userId === data.userId ? { ...p, isReady: data.isReady } : p
      ));
    });

    s.on('auction:started', () => {
      if (roomDataRef.current) {
        router.push(`/auction/${roomDataRef.current.id}`);
      }
    });

    setSocket(s);

    // Fetch teams
    fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'}/api/teams`)
      .then(r => r.json())
      .then(d => { if (d.success) setTeams(d.data); })
      .catch(() => {});

    return () => { s.disconnect(); };
  }, [authReady, router]);

  const createRoom = useCallback(() => {
    if (!socket) return;
    setLoading(true);
    socket.emit('room:create', {
      name: roomName || `Auction Room`,
      mode,
      purseAmount: mode === 'MEGA' ? 120 : mode === 'MINI' ? 75 : 50,
      maxParticipants: 10,
      timerSeconds,
      isPublic,
      enableAI,
      aiDifficulty: 'MEDIUM',
    }, (res: any) => {
      setLoading(false);
      if (res.success) {
        setRoomData(res.room);
        setInRoom(true);
        setParticipants([{ userId: 'me', userName: 'You', isHost: true, isReady: false }]);
      } else {
        toast.error(res.error || 'Failed to create room');
      }
    });
  }, [socket, roomName, mode, timerSeconds, isPublic, enableAI]);

  const joinRoom = useCallback(() => {
    if (!socket || !joinCode) return;
    setLoading(true);
    socket.emit('room:join', { code: joinCode.toUpperCase() }, (res: any) => {
      setLoading(false);
      if (res.success) {
        setRoomData(res.room);
        setInRoom(true);
        setParticipants(res.room.participants || []);
      } else {
        toast.error(res.error || 'Failed to join room');
      }
    });
  }, [socket, joinCode]);

  const selectTeam = useCallback((teamId: string, teamName: string) => {
    if (!socket || !roomData) return;
    socket.emit('room:selectTeam', { roomId: roomData.id, teamId, teamName }, (res: any) => {
      if (res.success) setSelectedTeam(teamId);
    });
  }, [socket, roomData]);

  const toggleReady = useCallback(() => {
    if (!socket || !roomData) return;
    socket.emit('room:toggleReady', { roomId: roomData.id }, (res: any) => {
      if (res.success) setIsReady(res.isReady);
    });
  }, [socket, roomData]);

 const startAuction = useCallback(() => {
  if (!socket || !roomData) return;

  socket.emit('auction:start', { roomId: roomData.id }, (res: any) => {
    console.log('START RESPONSE:', res);

    if (res.success) {
      router.push(`/auction/${roomData.id}`);
    } else {
      alert(res.error);
    }
  });
}, [socket, roomData, router]);

  const copyCode = () => {
    if (roomData?.code) {
      navigator.clipboard.writeText(roomData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!authReady) {
    return <Loader />;
  }

  // Pre-auction lobby view
  if (inRoom && roomData) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
            {/* Room header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">{roomData.name}</h2>
                <p className="text-sm text-gray-500">{roomData.mode} Auction • {roomData.purseAmount} Cr Purse</p>
              </div>
              <button onClick={copyCode} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors">
                <span className="font-mono font-bold tracking-wider">{roomData.code}</span>
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
            </div>

            {/* Team Selection */}
            <div className="mb-8">
              <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-3">Select Your Team</h3>
              <div className="grid grid-cols-5 gap-2">
                {teams.map(team => {
                  const taken = participants.some(p => p.teamId === team.id && p.userId !== 'me');
                  return (
                    <button
                      key={team.id}
                      onClick={() => !taken && selectTeam(team.id, team.name)}
                      disabled={taken}
                      className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                        selectedTeam === team.id
                          ? 'border-amber-500/50 bg-amber-500/10'
                          : taken
                          ? 'border-white/[0.02] bg-white/[0.01] opacity-30 cursor-not-allowed'
                          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-md mx-auto mb-1 flex items-center justify-center text-[10px] font-bold text-white"
                           style={{ backgroundColor: team.primaryColor }}>
                        {team.shortName?.slice(0, 3)}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">{team.shortName}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Participants */}
            <div className="mb-8">
              <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-3">
                Players ({participants.length}/10)
              </h3>
              <div className="space-y-2">
                {participants.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-sm text-indigo-400">
                        {(p.userName || 'P')[0]}
                      </div>
                      <div>
                        <span className="text-sm text-white">{p.userName || 'Player'}</span>
                        {p.isHost && <span className="ml-2 text-[10px] text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10">HOST</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.teamName && <span className="text-xs text-gray-400">{p.teamName}</span>}
                      <div className={`w-2 h-2 rounded-full ${p.isReady ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={toggleReady}
                className={`flex-1 py-3 rounded-xl font-bold transition-all duration-200 ${
                  isReady
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                }`}
              >
                {isReady ? '✓ Ready' : 'Ready Up'}
              </button>
              <button
                onClick={startAuction}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold
                         hover:from-amber-400 hover:to-yellow-400 transition-all duration-200"
              >
                Start Auction →
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Lobby creation/join view
  return (
    <div className="min-h-screen bg-[#030014] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Tab Bar */}
        <div className="flex rounded-xl bg-white/[0.03] border border-white/[0.06] p-1 mb-6">
          {[
            { key: 'create', label: 'Create Room', icon: Plus },
            { key: 'join', label: 'Join Room', icon: Users },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                tab === t.key ? 'bg-white/[0.08] text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
          {tab === 'create' ? (
            <div className="space-y-5">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Room Name</label>
                <input
                  value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  placeholder="My Auction Room"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600
                           focus:outline-none focus:border-amber-500/50 transition-all"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Auction Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['QUICK', 'MINI', 'MEGA'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`py-3 rounded-xl text-sm font-medium transition-all ${
                        mode === m
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-white/[0.03] text-gray-400 border border-white/[0.06] hover:border-white/[0.12]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">AI Opponents</label>
                <button
                  onClick={() => setEnableAI(!enableAI)}
                  className={`w-12 h-6 rounded-full transition-all duration-200 ${
                    enableAI ? 'bg-amber-500' : 'bg-white/10'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ml-0.5 ${enableAI ? 'translate-x-6' : ''}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Public Room</label>
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={`w-12 h-6 rounded-full transition-all duration-200 ${
                    isPublic ? 'bg-amber-500' : 'bg-white/10'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ml-0.5 ${isPublic ? 'translate-x-6' : ''}`} />
                </button>
              </div>

              <button
                onClick={createRoom}
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-lg
                         hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 transition-all duration-200"
              >
                {loading ? 'Creating...' : 'Create Room'}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Room Code</label>
                <input
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  maxLength={6}
                  className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white text-center font-mono text-2xl tracking-[0.5em] placeholder-gray-600
                           focus:outline-none focus:border-amber-500/50 transition-all uppercase"
                />
              </div>
              <button
                onClick={joinRoom}
                disabled={loading || joinCode.length < 6}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-lg
                         hover:from-indigo-400 hover:to-purple-400 disabled:opacity-50 transition-all duration-200"
              >
                {loading ? 'Joining...' : 'Join Room'}
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-400 transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
