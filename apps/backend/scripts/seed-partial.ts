#!/usr/bin/env tsx

import { PrismaClient, User, Game } from '@prisma/client';
import { seedUsers } from './seeders/users';
import { seedGames } from './seeders/games';
import { seedMarkets } from './seeders/markets';
import { seedMissions } from './seeders/missions';

const prisma = new PrismaClient();

async function seedPartial(dataTypes: string[]) {
  console.log('🌱 Starting partial database seeding...');
  console.log(`📋 Seeding: ${dataTypes.join(', ')}`);

  try {
    let users: User[] = [];
    let games: Game[] = [];

    // Always ensure we have users if seeding anything that depends on them
    if (
      dataTypes.includes('users') ||
      dataTypes.some(type => ['games', 'markets', 'missions'].includes(type))
    ) {
      if (dataTypes.includes('users')) {
        console.log('🗑️  Clearing existing users...');
        await prisma.user.deleteMany();
      }

      const existingUsers = await prisma.user.findMany();
      if (existingUsers.length === 0) {
        console.log('👥 Seeding users (required dependency)...');
        users = await seedUsers(prisma);
      } else {
        users = existingUsers;
        console.log('👥 Using existing users...');
      }
    }

    // Handle games and dependencies
    if (
      dataTypes.includes('games') ||
      dataTypes.some(type => ['markets', 'missions'].includes(type))
    ) {
      if (dataTypes.includes('games')) {
        console.log('🗑️  Clearing existing games and dependencies...');
        await prisma.gameLog.deleteMany();
        await prisma.mission.deleteMany();
        await prisma.market.deleteMany();
        await prisma.ship.deleteMany();
        await prisma.player.deleteMany();
        await prisma.game.deleteMany();
      }

      const existingGames = await prisma.game.findMany();
      if (existingGames.length === 0) {
        console.log('🎮 Seeding games (required dependency)...');
        games = await seedGames(prisma, users);
      } else {
        games = existingGames;
        console.log('🎮 Using existing games...');
      }
    }

    // Seed markets
    if (dataTypes.includes('markets')) {
      console.log('🗑️  Clearing existing markets...');
      await prisma.market.deleteMany();
      console.log('🏪 Seeding markets...');
      await seedMarkets(prisma, games);
    }

    // Seed missions
    if (dataTypes.includes('missions')) {
      console.log('🗑️  Clearing existing missions...');
      await prisma.mission.deleteMany();
      console.log('📝 Seeding missions...');
      await seedMissions(prisma, games);
    }

    console.log('✅ Partial seeding completed successfully!');

    // Print summary
    const userCount = await prisma.user.count();
    const gameCount = await prisma.game.count();
    const playerCount = await prisma.player.count();
    const shipCount = await prisma.ship.count();
    const marketCount = await prisma.market.count();
    const missionCount = await prisma.mission.count();

    console.log('\n📊 Current Database State:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Games: ${gameCount}`);
    console.log(`   Players: ${playerCount}`);
    console.log(`   Ships: ${shipCount}`);
    console.log(`   Markets: ${marketCount}`);
    console.log(`   Missions: ${missionCount}`);
  } catch (error) {
    console.error('❌ Error during partial seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle script execution
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: tsx scripts/seed-partial.ts <dataTypes>');
    console.log('Available data types: users, games, markets, missions');
    console.log('Example: tsx scripts/seed-partial.ts users games');
    process.exit(1);
  }

  const validTypes = ['users', 'games', 'markets', 'missions'];
  const invalidTypes = args.filter(type => !validTypes.includes(type));

  if (invalidTypes.length > 0) {
    console.error(`❌ Invalid data types: ${invalidTypes.join(', ')}`);
    console.log(`Valid types: ${validTypes.join(', ')}`);
    process.exit(1);
  }

  seedPartial(args);
}

export default seedPartial;
