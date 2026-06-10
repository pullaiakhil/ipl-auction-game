export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function formatCurrency(lakhs: number): string {
  if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(2)} Cr`;
  return `₹${lakhs} L`;
}

export function getBidIncrement(currentBid: number): number {
  if (currentBid >= 1600) return 25;
  if (currentBid >= 1000) return 25;
  if (currentBid >= 500) return 20;
  if (currentBid >= 100) return 10;
  if (currentBid >= 50) return 5;
  return 5;
}

export function calculatePlayerSetOrder(
  players: Array<{ role: string; basePrice: number; isMarquee: boolean; nationality: string }>,
  mode: 'MEGA' | 'MINI' | 'QUICK'
): number[][] {
  const sets: number[][] = [];
  
  if (mode === 'MEGA') {
    // Set 1: Marquee (Base ≥ 200L)
    const marquee = players
      .map((p, i) => ({ ...p, idx: i }))
      .filter(p => p.isMarquee || p.basePrice >= 200)
      .map(p => p.idx);
    if (marquee.length) sets.push(marquee);

    // Set 2-5: By role
    const roles = ['BATSMAN', 'ALL_ROUNDER', 'BOWLER', 'WICKET_KEEPER'];
    for (const role of roles) {
      const rolePlayers = players
        .map((p, i) => ({ ...p, idx: i }))
        .filter(p => p.role === role && !p.isMarquee && p.basePrice < 200)
        .sort((a, b) => b.basePrice - a.basePrice)
        .map(p => p.idx);
      
      // Split into sub-sets of 20
      for (let i = 0; i < rolePlayers.length; i += 20) {
        sets.push(rolePlayers.slice(i, i + 20));
      }
    }
  } else {
    // MINI/QUICK: Single set, ordered by base price descending
    const allIndices = players
      .map((_, i) => i)
      .sort((a, b) => players[b].basePrice - players[a].basePrice);
    
    for (let i = 0; i < allIndices.length; i += 25) {
      sets.push(allIndices.slice(i, i + 25));
    }
  }

  return sets;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
