import { PrismaClient, User, Game } from '@prisma/client';

// Ship templates with Persian names and English equivalents
const shipTemplates = [
  {
    name: 'بادبان سیاه', // Black Sail
    stats: {
      speed: 3,
      durability: 8,
      cannons: 12,
      cargoCapacity: 150,
      crewMax: 80,
      maneuverability: 2,
    },
    shipClass: 'Frigate',
  },
  {
    name: 'طوفان دریا', // Sea Storm
    stats: {
      speed: 4,
      durability: 6,
      cannons: 8,
      cargoCapacity: 100,
      crewMax: 60,
      maneuverability: 3,
    },
    shipClass: 'Sloop',
  },
  {
    name: 'شاهین دریایی', // Sea Falcon
    stats: {
      speed: 5,
      durability: 4,
      cannons: 4,
      cargoCapacity: 50,
      crewMax: 30,
      maneuverability: 4,
    },
    shipClass: 'Cutter',
  },
  {
    name: 'عقاب طلایی', // Golden Eagle
    stats: {
      speed: 2,
      durability: 12,
      cannons: 24,
      cargoCapacity: 300,
      crewMax: 150,
      maneuverability: 1,
    },
    shipClass: 'Ship of the Line',
  },
  {
    name: 'روح آزاد', // Free Spirit
    stats: {
      speed: 3,
      durability: 7,
      cannons: 10,
      cargoCapacity: 120,
      crewMax: 70,
      maneuverability: 3,
    },
    shipClass: 'Brigantine',
  },
];

// Captain templates with Persian and English names
const captainTemplates = [
  {
    name: 'کاپیتان جک اسپرو',
    stats: { cunning: 4, bravery: 3, charisma: 4, seamanship: 3 },
    reputation: { military: 20, trading: 60, pirate: 80 },
  },
  {
    name: 'دریاسالار نورینگتون',
    stats: { cunning: 3, bravery: 4, charisma: 3, seamanship: 4 },
    reputation: { military: 90, trading: 40, pirate: 10 },
  },
  {
    name: 'ریش سیاه',
    stats: { cunning: 4, bravery: 4, charisma: 2, seamanship: 3 },
    reputation: { military: 10, trading: 30, pirate: 95 },
  },
  {
    name: 'آن بانی',
    stats: { cunning: 4, bravery: 3, charisma: 3, seamanship: 3 },
    reputation: { military: 15, trading: 45, pirate: 85 },
  },
  {
    name: 'کاپیتان کید',
    stats: { cunning: 3, bravery: 3, charisma: 4, seamanship: 4 },
    reputation: { military: 50, trading: 70, pirate: 60 },
  },
];

// Starting cargo templates
const cargoTemplates = [
  {
    name: 'Pirate Start',
    goods: {
      rum: { quantity: 10, quality: 'common' },
      gunpowder: { quantity: 5, quality: 'good' },
      rope: { quantity: 8, quality: 'common' },
    },
  },
  {
    name: 'Merchant Start',
    goods: {
      spices: { quantity: 15, quality: 'good' },
      silk: { quantity: 8, quality: 'fine' },
      tea: { quantity: 12, quality: 'common' },
    },
  },
  {
    name: 'Naval Start',
    goods: {
      gunpowder: { quantity: 20, quality: 'military' },
      cannon_balls: { quantity: 50, quality: 'good' },
      naval_supplies: { quantity: 15, quality: 'military' },
    },
  },
];

// Starting positions around the map
const startingPositions = [
  { x: 2, y: 3, region: 'Caribbean East' },
  { x: 8, y: 7, region: 'Caribbean Central' },
  { x: 15, y: 12, region: 'Caribbean West' },
  { x: 5, y: 15, region: 'Spanish Main' },
  { x: 12, y: 4, region: 'Bahamas' },
];

export async function seedGames(
  prisma: PrismaClient,
  users: User[]
): Promise<Game[]> {
  const games: Game[] = [];

  // Create a sample active game
  const activeGame = await prisma.game.create({
    data: {
      name: 'بحر آزاد - دریای کاراییب', // Free Seas - Caribbean Sea
      gmId: users.find(u => u.username === 'gamemaster')!.id,
      status: 'ACTIVE',
      currentRound: 3,
      currentPhase: 'PLANNING',
      settings: {
        weatherEnabled: true,
        fogOfWar: true,
        realTimeMode: false,
        turnTimeLimit: 300, // 5 minutes
        maxPlayers: 6,
        startingGold: 150,
        difficultyLevel: 'normal',
        customRules: {
          quickCombat: false,
          enhancedTrading: true,
          randomEvents: true,
        },
      },
    },
  });

  games.push(activeGame);
  console.log(`   ✓ Created game: ${activeGame.name}`);

  // Create players for the active game
  const playerUsers = users
    .filter(u => u.username !== 'gamemaster')
    .slice(0, 5);

  for (let i = 0; i < playerUsers.length; i++) {
    const user = playerUsers[i];
    const captainTemplate = captainTemplates[i % captainTemplates.length];
    const shipTemplate = shipTemplates[i % shipTemplates.length];
    const cargoTemplate = cargoTemplates[i % cargoTemplates.length];
    const position = startingPositions[i % startingPositions.length];

    // Create player
    const player = await prisma.player.create({
      data: {
        gameId: activeGame.id,
        userId: user.id,
        captainName: captainTemplate.name,
        captainStats: captainTemplate.stats,
        reputation: captainTemplate.reputation,
        gold: 150 + Math.floor(Math.random() * 100), // 150-250 starting gold
        position: position,
      },
    });

    // Create ship for player
    const ship = await prisma.ship.create({
      data: {
        playerId: player.id,
        name: shipTemplate.name,
        stats: {
          ...shipTemplate.stats,
          currentSpeed: shipTemplate.stats.speed,
          currentDurability: shipTemplate.stats.durability,
          shipClass: shipTemplate.shipClass,
        },
        cargo: {
          current: cargoTemplate.goods,
          capacity: shipTemplate.stats.cargoCapacity,
          weight: Object.values(cargoTemplate.goods).reduce(
            (total: number, item: any) => total + item.quantity,
            0
          ),
        },
        crew: {
          current: Math.floor(shipTemplate.stats.crewMax * 0.8), // 80% crew to start
          max: shipTemplate.stats.crewMax,
          morale: 75 + Math.floor(Math.random() * 20), // 75-95 morale
          experience: Math.floor(Math.random() * 50), // 0-50 experience
          wages: 2, // gold per crew member per turn
        },
        condition: {
          hull: 100,
          sails: 100,
          rigging: 100,
          cannons: 100,
          lastMaintenance: new Date().toISOString(),
          repairs: [],
        },
      },
    });

    console.log(
      `   ✓ Created player: ${player.captainName} with ship: ${ship.name}`
    );
  }

  // Create a setup game
  const setupGame = await prisma.game.create({
    data: {
      name: 'نبرد دزدان دریایی', // Battle of Pirates
      gmId: users.find(u => u.username === 'gamemaster')!.id,
      status: 'SETUP',
      currentRound: 1,
      currentPhase: 'WIND',
      settings: {
        weatherEnabled: true,
        fogOfWar: false,
        realTimeMode: true,
        turnTimeLimit: 180, // 3 minutes
        maxPlayers: 4,
        startingGold: 200,
        difficultyLevel: 'hard',
        customRules: {
          quickCombat: true,
          enhancedTrading: false,
          randomEvents: true,
        },
      },
    },
  });

  games.push(setupGame);
  console.log(`   ✓ Created game: ${setupGame.name}`);

  // Create a completed game for reference
  const completedGame = await prisma.game.create({
    data: {
      name: 'گنج جزیره مرده', // Dead Island Treasure
      gmId: users.find(u => u.username === 'gamemaster')!.id,
      status: 'COMPLETED',
      currentRound: 15,
      currentPhase: 'MAINTENANCE',
      settings: {
        weatherEnabled: true,
        fogOfWar: true,
        realTimeMode: false,
        turnTimeLimit: 600, // 10 minutes
        maxPlayers: 8,
        startingGold: 100,
        difficultyLevel: 'normal',
        customRules: {
          quickCombat: false,
          enhancedTrading: true,
          randomEvents: true,
        },
      },
    },
  });

  games.push(completedGame);
  console.log(`   ✓ Created game: ${completedGame.name}`);

  return games;
}
