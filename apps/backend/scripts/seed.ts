#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeders/users';
import { seedGames } from './seeders/games';
import { seedMarkets } from './seeders/markets';
import { seedMissions } from './seeders/missions';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log('🗑️  Clearing existing data...');
    await prisma.gameLog.deleteMany();
    await prisma.mission.deleteMany();
    await prisma.market.deleteMany();
    await prisma.ship.deleteMany();
    await prisma.player.deleteMany();
    await prisma.game.deleteMany();
    await prisma.user.deleteMany();

    // Seed data in order of dependencies
    console.log('👥 Seeding users...');
    const users = await seedUsers(prisma);

    console.log('🎮 Seeding games...');
    const games = await seedGames(prisma, users);

    console.log('🏪 Seeding markets...');
    await seedMarkets(prisma, games);

    console.log('📝 Seeding missions...');
    await seedMissions(prisma, games);

    console.log('✅ Database seeding completed successfully!');

    // Print summary
    const userCount = await prisma.user.count();
    const gameCount = await prisma.game.count();
    const playerCount = await prisma.player.count();
    const shipCount = await prisma.ship.count();
    const marketCount = await prisma.market.count();
    const missionCount = await prisma.mission.count();

    console.log('\n📊 Seeding Summary:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Games: ${gameCount}`);
    console.log(`   Players: ${playerCount}`);
    console.log(`   Ships: ${shipCount}`);
    console.log(`   Markets: ${marketCount}`);
    console.log(`   Missions: ${missionCount}`);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle script execution
if (require.main === module) {
  main();
}

export default main;
