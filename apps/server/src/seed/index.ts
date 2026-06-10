import { PrismaClient, Nationality, PlayerRole, PlayerSubRole, BattingStyle, BowlingStyle } from '@prisma/client';
import { teamsSeed } from './teams';
import { players } from './players';

const prisma = new PrismaClient();

// Map string values from seed data to Prisma enums
const nationalityMap: Record<string, Nationality> = {
  'INDIAN': 'INDIAN',
  'OVERSEAS': 'OVERSEAS',
  'ASSOCIATE': 'ASSOCIATE',
};

const roleMap: Record<string, PlayerRole> = {
  'BATSMAN': 'BATSMAN',
  'BOWLER': 'BOWLER',
  'ALL_ROUNDER': 'ALL_ROUNDER',
  'WICKET_KEEPER': 'WICKET_KEEPER',
};

const subRoleMap: Record<string, PlayerSubRole> = {
  'OPENER': 'OPENER',
  'TOP_ORDER': 'TOP_ORDER',
  'MIDDLE_ORDER': 'MIDDLE_ORDER',
  'FINISHER': 'FINISHER',
  'PACE_BOWLER': 'PACE_BOWLER',
  'MEDIUM_PACE_BOWLER': 'MEDIUM_PACE_BOWLER',
  'SPINNER': 'SPINNER',
  'SEAM_ALL_ROUNDER': 'SEAM_ALL_ROUNDER',
  'SPIN_ALL_ROUNDER': 'SPIN_ALL_ROUNDER',
  'BATTING_ALL_ROUNDER': 'BATTING_ALL_ROUNDER',
  'BOWLING_ALL_ROUNDER': 'BOWLING_ALL_ROUNDER',
  'KEEPER_BATSMAN': 'KEEPER_BATSMAN',
};

const battingStyleMap: Record<string, BattingStyle> = {
  'RIGHT_HAND_BAT': 'RIGHT_HANDED',
  'RIGHT_HANDED': 'RIGHT_HANDED',
  'LEFT_HAND_BAT': 'LEFT_HANDED',
  'LEFT_HANDED': 'LEFT_HANDED',
};

const bowlingStyleMap: Record<string, BowlingStyle> = {
  'RIGHT_ARM_FAST': 'RIGHT_ARM_FAST',
  'RIGHT_ARM_FAST_MEDIUM': 'RIGHT_ARM_MEDIUM_FAST',
  'RIGHT_ARM_MEDIUM_FAST': 'RIGHT_ARM_MEDIUM_FAST',
  'RIGHT_ARM_MEDIUM': 'RIGHT_ARM_MEDIUM',
  'LEFT_ARM_FAST': 'LEFT_ARM_FAST',
  'LEFT_ARM_FAST_MEDIUM': 'LEFT_ARM_MEDIUM_FAST',
  'LEFT_ARM_MEDIUM_FAST': 'LEFT_ARM_MEDIUM_FAST',
  'LEFT_ARM_MEDIUM': 'LEFT_ARM_MEDIUM',
  'RIGHT_ARM_OFFBREAK': 'RIGHT_ARM_OFF_BREAK',
  'RIGHT_ARM_OFF_BREAK': 'RIGHT_ARM_OFF_BREAK',
  'RIGHT_ARM_OFF_SPIN': 'RIGHT_ARM_OFF_SPIN',
  'RIGHT_ARM_LEGBREAK': 'RIGHT_ARM_LEG_BREAK',
  'RIGHT_ARM_LEG_BREAK': 'RIGHT_ARM_LEG_BREAK',
  'RIGHT_ARM_LEG_SPIN': 'RIGHT_ARM_LEG_SPIN',
  'LEFT_ARM_ORTHODOX': 'LEFT_ARM_ORTHODOX',
  'LEFT_ARM_SPIN': 'LEFT_ARM_ORTHODOX',
  'SLOW_LEFT_ARM_ORTHODOX': 'SLOW_LEFT_ARM_ORTHODOX',
  'LEFT_ARM_CHINAMAN': 'LEFT_ARM_CHINAMAN',
  'LEFT_ARM_WRIST_SPIN': 'LEFT_ARM_CHINAMAN',
  'NONE': 'NONE',
};

async function main() {
  console.log('🌱 Starting database seed...');
  console.log('');

  // Clear existing data in reverse dependency order
  console.log('🗑️  Clearing existing data...');
  await prisma.ballEvent.deleteMany();
  await prisma.innings.deleteMany();
  await prisma.match.deleteMany();
  await prisma.leagueTable.deleteMany();
  await prisma.season.deleteMany();
  await prisma.analytics.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.playerContract.deleteMany();
  await prisma.squad.deleteMany();
  await prisma.auctionPlayer.deleteMany();
  await prisma.auctionParticipant.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.auctionRoom.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Cleared all data');
  console.log('');

  // Seed teams
  console.log('🏏 Seeding teams...');
  for (const team of teamsSeed) {
    await prisma.team.create({ data: team });
  }
  console.log(`✅ Seeded ${teamsSeed.length} teams`);
  console.log('');

  // Seed players
  console.log('👤 Seeding players...');
  let count = 0;
  const batchSize = 50;
  let skipped = 0;

  for (let i = 0; i < players.length; i += batchSize) {
    const batch = players.slice(i, i + batchSize);
    const mapped = batch.map(p => {
      const nationality = nationalityMap[p.nationality] || 'INDIAN';
      const role = roleMap[p.role] || 'BATSMAN';
      const subRole = subRoleMap[p.subRole] || 'MIDDLE_ORDER';
      const battingStyle = battingStyleMap[p.battingStyle] || 'RIGHT_HANDED';
      const bowlingStyle = bowlingStyleMap[p.bowlingStyle] || 'NONE';

      return {
        name: p.name,
        fullName: p.fullName,
        country: p.country,
        nationality,
        role,
        subRole,
        age: p.age,
        battingStyle,
        bowlingStyle,
        matches: p.matches || 0,
        runs: p.runs || 0,
        battingAverage: p.battingAverage || 0,
        strikeRate: p.strikeRate || 0,
        hundreds: p.hundreds || 0,
        fifties: p.fifties || 0,
        wickets: p.wickets || 0,
        bowlingAverage: p.bowlingAverage || 0,
        economy: p.economy || 0,
        bowlingStrikeRate: p.bowlingStrikeRate || 0,
        bestBowling: p.bestBowling || '0/0',
        catches: p.catches || 0,
        stumpings: p.stumpings || 0,
        overallRating: p.overallRating || 50,
        battingRating: p.battingRating || 50,
        bowlingRating: p.bowlingRating || 50,
        fieldingRating: p.fieldingRating || 50,
        fitnessRating: p.fitnessRating || 50,
        formRating: p.formRating || 50,
        marketDemand: p.marketDemand || 50,
        basePrice: p.basePrice || 20,
        isMarquee: p.isMarquee || false,
        isCapped: p.isCapped !== false,
      };
    });

    try {
      await prisma.player.createMany({ data: mapped });
      count += mapped.length;
    } catch (err) {
      // If batch fails, try individually
      for (const playerData of mapped) {
        try {
          await prisma.player.create({ data: playerData });
          count++;
        } catch {
          skipped++;
        }
      }
    }
    process.stdout.write(`\r  Progress: ${count}/${players.length} players (${skipped} skipped)`);
  }
  console.log('');
  console.log(`✅ Seeded ${count} players (${skipped} skipped)`);
  console.log('');

  // Create admin user
  console.log('👑 Creating admin user...');
  const bcrypt = await import('bcryptjs');
  const hashedPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@ipl-auction.com' },
    update: {},
    create: {
      email: 'admin@ipl-auction.com',
      name: 'Admin',
      hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created (admin@ipl-auction.com / admin123)');
  console.log('');

  // Summary
  const teamCount = await prisma.team.count();
  const playerCount = await prisma.player.count();
  const userCount = await prisma.user.count();

  console.log('═══════════════════════════════════');
  console.log('  🌱 SEED COMPLETE');
  console.log('═══════════════════════════════════');
  console.log(`  Teams:   ${teamCount}`);
  console.log(`  Players: ${playerCount}`);
  console.log(`  Users:   ${userCount}`);
  console.log('═══════════════════════════════════');
}

main()
  .catch(e => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
