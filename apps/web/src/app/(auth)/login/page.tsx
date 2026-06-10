'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/dashboard';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
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
        window.location.href = '/dashboard';
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-indigo-500/10 to-purple-500/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[100px]" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="text-6xl mb-6">🏏</div>
            <h1 className="text-5xl font-black text-white mb-4">
              Welcome<br />
              <span className="bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
                Back
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-md">
              Your auction room awaits. Sign in to continue building your dream IPL team.
            </p>
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
            <h2 className="text-2xl font-bold text-white mb-1">Sign In</h2>
            <p className="text-gray-500 mb-8">Enter your credentials to continue</p>

            {/* Google Login */}
            <button
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-white/10 
                        text-white hover:bg-white/5 transition-colors duration-200 mb-4"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-6">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-xs text-gray-600 uppercase tracking-wider">or</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600
                           focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
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
                             focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold
                         hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 transition-all duration-200"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-4">
              <button
                onClick={handleGuestLogin}
                disabled={loading}
                className="w-full py-3 rounded-xl border border-indigo-500/30 text-indigo-400 font-semibold
                         hover:bg-indigo-500/10 hover:border-indigo-500/50 disabled:opacity-50 transition-all duration-200"
              >
                ⚡ Play as Guest
              </button>
            </div>

            <p className="text-center text-gray-600 text-sm mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-amber-400 hover:text-amber-300 font-medium">Sign Up</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
