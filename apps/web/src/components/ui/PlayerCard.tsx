'use client';

import { motion } from 'framer-motion';

interface PlayerCardProps {
  name: string;
  role: string;
  country: string;
  nationality: 'INDIAN' | 'OVERSEAS';
  overallRating: number;
  battingRating: number;
  bowlingRating: number;
  fieldingRating: number;
  basePrice: number;
  isMarquee?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const roleColors: Record<string, string> = {
  BATSMAN: '#3b82f6',
  BOWLER: '#ef4444',
  ALL_ROUNDER: '#8b5cf6',
  WICKET_KEEPER: '#f59e0b',
};

const roleLabels: Record<string, string> = {
  BATSMAN: 'BAT',
  BOWLER: 'BOWL',
  ALL_ROUNDER: 'AR',
  WICKET_KEEPER: 'WK',
};

const roleIcons: Record<string, string> = {
  BATSMAN: '🏏',
  BOWLER: '🎳',
  ALL_ROUNDER: '⚡',
  WICKET_KEEPER: '🧤',
};

function formatPrice(lakhs: number): string {
  if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(1)}Cr`;
  return `₹${lakhs}L`;
}

function getRatingColor(rating: number): string {
  if (rating >= 90) return '#FFD700';
  if (rating >= 80) return '#22c55e';
  if (rating >= 70) return '#3b82f6';
  if (rating >= 60) return '#a855f7';
  return '#6b7280';
}

export function PlayerCard({
  name, role, country, nationality, overallRating,
  battingRating, bowlingRating, fieldingRating,
  basePrice, isMarquee, size = 'md', onClick,
}: PlayerCardProps) {
  const color = roleColors[role] || '#6b7280';
  const ratingColor = getRatingColor(overallRating);
  const cardSize = size === 'lg' ? 'w-72' : size === 'sm' ? 'w-44' : 'w-56';

  return (
    <motion.div
      className={`${cardSize} cursor-pointer group`}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.01]
                      group-hover:border-white/[0.15] group-hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)] transition-all duration-500">
        {/* Top gradient bar */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />

        {/* Marquee badge */}
        {isMarquee && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30">
            <span className="text-[10px] font-bold text-amber-400 tracking-wider">MARQUEE</span>
          </div>
        )}

        {/* Player silhouette / icon area */}
        <div className="relative h-28 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />
          <div className="text-5xl opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500">
            {roleIcons[role] || '🏏'}
          </div>
          {/* Rating badge */}
          <div className="absolute bottom-2 left-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center border-2 bg-[#0a0a1a]"
                 style={{ borderColor: ratingColor }}>
              <span className="text-lg font-black" style={{ color: ratingColor }}>{overallRating}</span>
            </div>
          </div>
        </div>

        {/* Player info */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${color}15`, color }}>
              {roleLabels[role]}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              nationality === 'OVERSEAS'
                ? 'bg-blue-500/10 text-blue-400'
                : 'bg-green-500/10 text-green-400'
            }`}>
              {country}
            </span>
          </div>

          <h3 className="text-sm font-bold text-white truncate mb-2 group-hover:text-amber-200 transition-colors">
            {name}
          </h3>

          {/* Stats bar */}
          <div className="space-y-1.5 mb-3">
            <StatBar label="BAT" value={battingRating} color="#3b82f6" />
            <StatBar label="BWL" value={bowlingRating} color="#ef4444" />
            <StatBar label="FLD" value={fieldingRating} color="#22c55e" />
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Base Price</span>
            <span className="text-sm font-bold text-amber-400">{formatPrice(basePrice)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-gray-600 w-6 text-right">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[10px] text-gray-500 w-5">{value}</span>
    </div>
  );
}
