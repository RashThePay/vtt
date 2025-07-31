#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  console.log('🗑️  Cleaning database...');

  try {
    // Delete in reverse order of dependencies
    console.log('   Deleting game logs...');
    await prisma.gameLog.deleteMany();

    console.log('   Deleting missions...');
    await prisma.mission.deleteMany();

    console.log('   Deleting markets...');
    await prisma.market.deleteMany();

    console.log('   Deleting ships...');
    await prisma.ship.deleteMany();

    console.log('   Deleting players...');
    await prisma.player.deleteMany();

    console.log('   Deleting games...');
    await prisma.game.deleteMany();

    console.log('   Deleting users...');
    await prisma.user.deleteMany();

    console.log('✅ Database cleaned successfully!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle script execution
if (require.main === module) {
  cleanup();
}

export default cleanup;
