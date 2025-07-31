#!/usr/bin/env node
/**
 * Database Migration Script for Map System
 * This script creates the database migration for the new map system models
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runMigration() {
  console.log(
    '🗺️ Creating database migration for High Seas VTT Map System...\n'
  );

  try {
    // Create migration
    console.log('📝 Creating Prisma migration...');
    const { stdout, stderr } = await execAsync(
      'npx prisma migrate dev --name add_map_system',
      {
        cwd: process.cwd(),
      }
    );

    if (stderr) {
      console.error('❌ Migration Error:', stderr);
      return;
    }

    console.log('✅ Migration Output:');
    console.log(stdout);

    // Generate Prisma client
    console.log('\n🔄 Generating Prisma client...');
    const { stdout: genStdout } = await execAsync('npx prisma generate');
    console.log('✅ Prisma client generated successfully');

    console.log('\n🎉 Map System database migration completed!');
    console.log('\n📋 What was added:');
    console.log('- GameMap model with regions and features support');
    console.log('- MapFeature model for islands, ports, reefs, etc.');
    console.log('- FeatureType enum for different map features');
    console.log('- Proper relations between Game and GameMap');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Check your DATABASE_URL in .env file');
    console.log('3. Ensure no other processes are using the database');
    console.log('4. Try running: npx prisma db push --force-reset');
  }
}

// Check if we're in the right directory
if (!process.cwd().includes('backend')) {
  console.error('❌ This script must be run from the backend directory');
  console.log('💡 Run: cd apps/backend && node scripts/migrate-map-system.js');
  process.exit(1);
}

runMigration();
