export const IPL_TEAMS = {
  CSK: { name: 'Chennai Super Kings', short: 'CSK', color: '#FDB913', secondary: '#044BA0', textColor: '#000' },
  MI: { name: 'Mumbai Indians', short: 'MI', color: '#004BA0', secondary: '#D1AB3E', textColor: '#fff' },
  RCB: { name: 'Royal Challengers Bengaluru', short: 'RCB', color: '#EC1C24', secondary: '#2B2A29', textColor: '#fff' },
  DC: { name: 'Delhi Capitals', short: 'DC', color: '#17479E', secondary: '#EF1B23', textColor: '#fff' },
  KKR: { name: 'Kolkata Knight Riders', short: 'KKR', color: '#3A225D', secondary: '#B3A123', textColor: '#fff' },
  PBKS: { name: 'Punjab Kings', short: 'PBKS', color: '#ED1B24', secondary: '#DCDDDF', textColor: '#fff' },
  RR: { name: 'Rajasthan Royals', short: 'RR', color: '#EA1A85', secondary: '#254AA5', textColor: '#fff' },
  GT: { name: 'Gujarat Titans', short: 'GT', color: '#1C1C1C', secondary: '#A7D0E4', textColor: '#fff' },
  LSG: { name: 'Lucknow Super Giants', short: 'LSG', color: '#A72056', secondary: '#FFCC00', textColor: '#fff' },
  SRH: { name: 'Sunrisers Hyderabad', short: 'SRH', color: '#FF822A', secondary: '#000000', textColor: '#000' },
} as const;

export type TeamKey = keyof typeof IPL_TEAMS;

export const PLAYER_ROLES = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'] as const;
export type PlayerRole = typeof PLAYER_ROLES[number];

export const GAME_MODES = [
  { id: 'quick', name: 'Quick Auction', description: 'Fast-paced 30-player auction', icon: 'Zap', gradient: 'from-amber-500 to-orange-600' },
  { id: 'mini', name: 'Mini Auction', description: 'Strategic retention-based auction', icon: 'Target', gradient: 'from-indigo-500 to-purple-600' },
  { id: 'mega', name: 'Mega Auction', description: 'Full 600+ player mega auction', icon: 'Crown', gradient: 'from-yellow-500 to-amber-600' },
  { id: 'career', name: 'Career Mode', description: 'Multi-season franchise journey', icon: 'Trophy', gradient: 'from-emerald-500 to-teal-600' },
  { id: 'multiplayer', name: 'Multiplayer', description: 'Compete with friends in real-time', icon: 'Users', gradient: 'from-pink-500 to-rose-600' },
  { id: 'fantasy', name: 'Fantasy Draft', description: 'Snake draft style team building', icon: 'Sparkles', gradient: 'from-cyan-500 to-blue-600' },
] as const;

export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export const BID_INCREMENTS = [
  { min: 0, max: 100, increment: 5 },
  { min: 100, max: 200, increment: 10 },
  { min: 200, max: 500, increment: 20 },
  { min: 500, max: 1000, increment: 25 },
  { min: 1000, max: Infinity, increment: 50 },
] as const;

export function getBidIncrement(currentBid: number): number {
  const tier = BID_INCREMENTS.find(t => currentBid >= t.min && currentBid < t.max);
  return tier?.increment ?? 25;
}

export function formatCurrency(lakhs: number): string {
  if (lakhs >= 100) {
    const crores = lakhs / 100;
    return `₹${crores % 1 === 0 ? crores.toFixed(0) : crores.toFixed(2)} Cr`;
  }
  return `₹${lakhs} L`;
}

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'New Auction', href: '/auction/new', icon: 'Gavel' },
  { label: 'Join Room', href: '/lobby', icon: 'DoorOpen' },
  { label: 'My Teams', href: '/team', icon: 'Users' },
  { label: 'Match Center', href: '/match', icon: 'Tv' },
  { label: 'Analytics', href: '/analytics', icon: 'BarChart3' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
] as const;
