'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="text-6xl mb-6">🏆</div>
            <h1 className="text-5xl font-black text-white mb-4">
              Join The<br />
              <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                Arena
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-md">
              Create your account and start building your dream IPL squad today. It&apos;s free!
            </p>
            <div className="mt-8 space-y-3 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">✓</div>
                500+ real IPL players with full stats
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">✓</div>
                Real-time multiplayer auctions
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">✓</div>
                AI opponents with unique strategies
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-1">Create Account</h2>
            <p className="text-gray-500 mb-8">Start your cricket journey</p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600
                           focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600
                           focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600
                             focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all pr-12"
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold
                         hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 transition-all duration-200"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-gray-600 text-sm mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign In</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
