'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Moon, Monitor, Bell, Shield, Palette } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [volume, setVolume] = useState(75);
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState('dark');

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`w-11 h-6 rounded-full transition-colors relative ${
        enabled ? 'bg-indigo-500' : 'bg-white/[0.08]'
      }`}
    >
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
        enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
      }`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-[#030014] p-6 lg:p-10 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-500 mb-8">Manage your preferences</p>
      </motion.div>

      <div className="space-y-6">
        {/* Audio */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="flex items-center gap-3 mb-4">
            {audioEnabled ? <Volume2 size={20} className="text-indigo-400" /> : <VolumeX size={20} className="text-gray-500" />}
            <h2 className="text-lg font-bold text-white">Audio</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Sound Effects</span>
              <ToggleSwitch enabled={audioEnabled} onToggle={() => setAudioEnabled(!audioEnabled)} />
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Volume</span>
                <span>{volume}%</span>
              </div>
              <input type="range" min={0} max={100} value={volume}
                onChange={e => setVolume(Number(e.target.value))}
                className="w-full h-1.5 bg-white/[0.06] rounded-full appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="flex items-center gap-3 mb-4">
            <Palette size={20} className="text-purple-400" />
            <h2 className="text-lg font-bold text-white">Appearance</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['dark', 'light', 'system'].map(t => (
              <button key={t} onClick={() => setTheme(t)}
                className={`p-3 rounded-xl border text-sm font-medium capitalize transition-all ${
                  theme === t
                    ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400'
                    : 'border-white/[0.06] bg-white/[0.02] text-gray-400 hover:bg-white/[0.04]'
                }`}>
                {t === 'system' ? <Monitor size={16} className="inline mr-2" /> : <Moon size={16} className="inline mr-2" />}
                {t}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell size={20} className="text-amber-400" />
            <h2 className="text-lg font-bold text-white">Notifications</h2>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Push Notifications</span>
            <ToggleSwitch enabled={notifications} onToggle={() => setNotifications(!notifications)} />
          </div>
        </motion.div>

        {/* Account */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={20} className="text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Account</h2>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-sm text-gray-400 hover:bg-white/[0.04] transition-colors">
              Change Password
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/10 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
              Delete Account
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
