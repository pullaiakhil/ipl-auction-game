'use client';

import { motion } from 'framer-motion';

interface TeamCardProps {
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  city: string;
  homeGround: string;
  selected?: boolean;
  disabled?: boolean;
  playerCount?: number;
  budget?: number;
  onClick?: () => void;
}

export function TeamCard({
  name, shortName, primaryColor, secondaryColor, city, homeGround,
  selected, disabled, playerCount, budget, onClick,
}: TeamCardProps) {
  return (
    <motion.div
      className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
        disabled ? 'opacity-30 cursor-not-allowed' : ''
      } ${selected ? 'ring-2 ring-amber-400 shadow-[0_0_30px_-5px_rgba(251,191,36,0.3)]' : ''}`}
      whileHover={!disabled ? { y: -4, scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={!disabled ? onClick : undefined}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 opacity-20" style={{
        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor || primaryColor}88, transparent)`,
      }} />

      <div className="relative p-5 border border-white/[0.06] rounded-2xl bg-[#0a0a1a]/80 backdrop-blur-sm
                      hover:border-white/[0.12] transition-colors duration-300">
        {/* Team logo placeholder */}
        <div className="w-16 h-16 rounded-xl mb-4 flex items-center justify-center text-xl font-black text-white"
             style={{ backgroundColor: primaryColor }}>
          {shortName}
        </div>

        <h3 className="text-lg font-bold text-white mb-1">{name}</h3>
        <p className="text-xs text-gray-500 mb-1">{city}</p>
        <p className="text-[10px] text-gray-600 truncate">{homeGround}</p>

        {/* Squad info (if in auction context) */}
        {(playerCount !== undefined || budget !== undefined) && (
          <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between">
            {playerCount !== undefined && (
              <span className="text-xs text-gray-400">{playerCount}/25 players</span>
            )}
            {budget !== undefined && (
              <span className="text-xs font-medium text-amber-400">
                ₹{budget >= 100 ? `${(budget / 100).toFixed(1)}Cr` : `${budget}L`}
              </span>
            )}
          </div>
        )}

        {/* Selected indicator */}
        {selected && (
          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
}
