import { Router, Request, Response } from 'express';

export const matchRouter = Router();

// POST /matches/simulate
matchRouter.post('/simulate', async (req: Request, res: Response) => {
  try {
    const { venue } = req.body;

    // Simplified match simulation
    const team1Score = Math.floor(Math.random() * 80) + 120;
    const team2Score = Math.floor(Math.random() * 80) + 120;
    const team1Wickets = Math.floor(Math.random() * 6) + 2;
    const team2Wickets = Math.floor(Math.random() * 6) + 2;
    const team1Overs = team1Wickets >= 10 ? 15 + Math.random() * 5 : 20;
    const team2Overs = team2Score > team1Score && team2Wickets < 10 ? 15 + Math.random() * 5 : 20;

    const team1 = 'Team A';
    const team2 = 'Team B';
    const winner = team1Score > team2Score ? team1 : team2;

    const generateBatters = (totalRuns: number, wickets: number) => {
      const names = ['V Kohli', 'R Sharma', 'KL Rahul', 'S Gill', 'H Pandya', 'R Jadeja', 'M Dhoni', 'R Pant', 'S Iyer', 'A Patel', 'J Bumrah'];
      const batters = [];
      let remaining = totalRuns;
      const batCount = Math.min(wickets + 2, 11);

      for (let i = 0; i < batCount; i++) {
        const balls = Math.floor(Math.random() * 30) + 5;
        const runs = i < batCount - 1 ? Math.floor(remaining * (Math.random() * 0.4 + 0.05)) : remaining;
        remaining -= runs;
        if (remaining < 0) remaining = 0;
        const fours = Math.floor(runs / 12);
        const sixes = Math.floor(runs / 20);

        batters.push({
          name: names[i % names.length],
          runs: Math.max(0, runs),
          balls,
          fours,
          sixes,
          strikeRate: balls > 0 ? (runs / balls) * 100 : 0,
          isOut: i < wickets,
          dismissal: i < wickets ? ['Caught', 'Bowled', 'LBW', 'Run Out', 'Stumped'][Math.floor(Math.random() * 5)] : undefined,
        });
      }
      return batters;
    };

    const generateBowlers = (totalRuns: number, wickets: number) => {
      const names = ['J Bumrah', 'M Siraj', 'Y Chahal', 'R Ashwin', 'A Singh', 'B Kumar'];
      const bowlers = [];
      let remainingOvers = 20;
      let remainingRuns = totalRuns;
      let remainingWickets = wickets;

      for (let i = 0; i < Math.min(6, wickets + 2); i++) {
        const overs = Math.min(4, Math.floor(remainingOvers / (6 - Math.min(i, 5) - i)) + 1);
        remainingOvers -= overs;
        const runs = Math.floor(remainingRuns / (6 - i));
        remainingRuns -= runs;
        const w = Math.min(remainingWickets, Math.floor(Math.random() * 3));
        remainingWickets -= w;

        bowlers.push({
          name: names[i % names.length],
          overs,
          maidens: Math.random() > 0.7 ? 1 : 0,
          runs: Math.max(0, runs),
          wickets: w,
          economy: overs > 0 ? runs / overs : 0,
        });
      }
      return bowlers;
    };

    const generateOverByOver = (totalRuns: number) => {
      const overs = [];
      let cumulative = 0;
      for (let i = 1; i <= 20; i++) {
        const runs = Math.floor(totalRuns / 20) + Math.floor(Math.random() * 8) - 3;
        const capped = Math.max(0, Math.min(runs, 24));
        cumulative += capped;
        overs.push({ over: i, runs: capped, wickets: Math.random() > 0.8 ? 1 : 0, cumulative });
      }
      return overs;
    };

    const result = {
      team1,
      team2,
      venue: venue || 'Wankhede Stadium',
      tossWinner: Math.random() > 0.5 ? team1 : team2,
      tossDecision: Math.random() > 0.5 ? 'bat' : 'bowl',
      innings1: {
        battingTeam: team1,
        bowlingTeam: team2,
        totalRuns: team1Score,
        wickets: team1Wickets,
        overs: team1Overs,
        runRate: team1Score / (team1Overs || 20),
        fours: Math.floor(team1Score / 8),
        sixes: Math.floor(team1Score / 15),
        batters: generateBatters(team1Score, team1Wickets),
        bowlers: generateBowlers(team1Score, team1Wickets),
        overByOver: generateOverByOver(team1Score),
      },
      innings2: {
        battingTeam: team2,
        bowlingTeam: team1,
        totalRuns: team2Score,
        wickets: team2Wickets,
        overs: team2Overs,
        runRate: team2Score / (team2Overs || 20),
        fours: Math.floor(team2Score / 8),
        sixes: Math.floor(team2Score / 15),
        batters: generateBatters(team2Score, team2Wickets),
        bowlers: generateBowlers(team2Score, team2Wickets),
        overByOver: generateOverByOver(team2Score),
      },
      winner,
      resultText: team1Score > team2Score
        ? `${team1} won by ${team1Score - team2Score} runs`
        : `${team2} won by ${10 - team2Wickets} wickets`,
      playerOfMatch: {
        name: 'V Kohli',
        performance: `${Math.floor(Math.random() * 40) + 50}(${Math.floor(Math.random() * 20) + 20})`,
      },
    };

    return res.json({ success: true, data: result });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Match simulation failed' });
  }
});

// GET /matches/:id
matchRouter.get('/:id', async (req: Request, res: Response) => {
  return res.json({ success: true, data: { id: req.params.id, status: 'COMPLETED' } });
});
