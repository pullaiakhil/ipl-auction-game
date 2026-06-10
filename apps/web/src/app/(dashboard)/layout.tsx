'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Gavel, Users, Trophy, BarChart3,
  Swords, Medal, Settings, ChevronLeft, ChevronRight,
  LogOut, Menu, X
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/lobby', label: 'New Auction', icon: Gavel },
  { href: '/players', label: 'Players', icon: Users },
  { href: '/team', label: 'Teams', icon: Trophy },
  { href: '/match', label: 'Match Center', icon: Swords },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/leaderboard', label: 'Leaderboard', icon: Medal },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-[#030014] overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative z-50 h-full flex flex-col
        bg-[#0a0a1a]/95 backdrop-blur-xl border-r border-white/[0.04]
        transition-all duration-300
        ${collapsed ? 'w-[72px]' : 'w-[240px]'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-white/[0.04]">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Trophy size={16} className="text-white" />
            </div>
            {!collapsed && (
              <span className="text-sm font-bold text-white tracking-wider">IPL AUCTION</span>
            )}
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-indigo-500/10 text-indigo-400 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.2)]'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
                  }
                `}
              >
                <item.icon size={18} className={isActive ? 'text-indigo-400' : ''} />
                {!collapsed && <span>{item.label}</span>}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-white/[0.04] space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-300 hover:bg-white/[0.03] transition-all"
          >
            <Settings size={18} />
            {!collapsed && <span>Settings</span>}
          </Link>
          <button
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#0a0a1a] border border-white/[0.08] items-center justify-center text-gray-500 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-white/[0.04] bg-[#0a0a1a]/50 backdrop-blur-xl">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search players, teams, auctions..."
                className="w-full h-9 bg-white/[0.03] border border-white/[0.06] rounded-xl pl-4 pr-4 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500/30 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
              U
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
