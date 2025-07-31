import { PrismaClient, Game, MissionStatus } from '@prisma/client';

// Mission templates with Persian titles and descriptions
const missionTemplates = [
  {
    title: 'حمل محموله تجاری', // Commercial Cargo Transport
    description:
      'محموله‌ای از ادویه گرانبها از هاوانا به پورت رویال برسانید. مراقب دزدان دریایی باشید!',
    // Transport a cargo of precious spices from Havana to Port Royal. Beware of pirates!
    type: 'transport',
    difficulty: 'easy',
    requirements: {
      cargoSpace: 50,
      minimumReputation: { trading: 20 },
      startLocation: 'havana',
      endLocation: 'port_royal',
      timeLimit: 5, // turns
      cargoType: 'spices',
      cargoAmount: 45,
    },
    rewards: {
      gold: 200,
      reputation: { trading: 15 },
      bonus: {
        condition: 'fast_delivery', // delivered in 3 turns or less
        gold: 50,
        reputation: { trading: 5 },
      },
    },
  },
  {
    title: 'شکار دزد دریایی', // Pirate Hunt
    description:
      'کاپیتان ریش قرمز در آب‌های اطراف تورتوگا دیده شده. او را پیدا کنید و به عدالت برسانید.',
    // Captain Redbeard has been spotted in waters around Tortuga. Find him and bring him to justice.
    type: 'combat',
    difficulty: 'hard',
    requirements: {
      minimumReputation: { military: 50 },
      combatRating: 3,
      searchArea: 'tortuga_waters',
      targetShip: {
        name: 'انتقام خونین', // Bloody Revenge
        captain: 'کاپیتان ریش قرمز', // Captain Redbeard
        strength: 'very_high',
      },
    },
    rewards: {
      gold: 500,
      reputation: { military: 30, pirate: -20 },
      specialReward: 'naval_commendation',
      bonus: {
        condition: 'capture_alive',
        gold: 200,
        reputation: { military: 15 },
      },
    },
  },
  {
    title: 'جستجوی گنج مفقود', // Lost Treasure Hunt
    description:
      'نقشه‌ای از گنج کاپیتان فلینت پیدا شده. به جزیره مرده بروید و گنج را بیابید.',
    // A map of Captain Flint's treasure has been found. Go to Dead Island and find the treasure.
    type: 'exploration',
    difficulty: 'medium',
    requirements: {
      equipment: ['shovel', 'treasure_map'],
      crewSize: 20,
      location: 'dead_island',
      searchSkill: 2,
      dangers: ['skeleton_crew', 'cursed_traps'],
    },
    rewards: {
      gold: 800,
      reputation: { pirate: 25 },
      treasureChance: {
        common: 0.6,
        rare: 0.3,
        legendary: 0.1,
      },
      bonus: {
        condition: 'no_casualties',
        gold: 100,
        reputation: { seamanship: 10 },
      },
    },
  },
  {
    title: 'نجات مسافران', // Passenger Rescue
    description:
      'کشتی مسافربری در طوفان غرق شده. بازماندگان را از جزیره‌ای دورافتاده نجات دهید.',
    // A passenger ship has sunk in a storm. Rescue survivors from a remote island.
    type: 'rescue',
    difficulty: 'medium',
    requirements: {
      speed: 3,
      cargoSpace: 30, // for passengers
      navigationSkill: 2,
      rescueLocation: 'remote_island',
      timeLimit: 4, // turns
      weatherConditions: 'stormy',
    },
    rewards: {
      gold: 300,
      reputation: { trading: 20, military: 10 },
      passengers: 25,
      bonus: {
        condition: 'all_rescued',
        gold: 150,
        reputation: { charisma: 15 },
      },
    },
  },
  {
    title: 'اسکورت کاروان تجاری', // Trade Convoy Escort
    description:
      'کاروان تجاری ثروتمندی محافظت می‌خواهد. آنها را از کارتاخنا به ناسائو همراهی کنید.',
    // A wealthy trade convoy requests protection. Escort them from Cartagena to Nassau.
    type: 'escort',
    difficulty: 'hard',
    requirements: {
      combatRating: 2,
      minimumReputation: { trading: 40, military: 30 },
      route: ['cartagena', 'kingston', 'nassau'],
      convoySize: 3,
      threatLevel: 'high',
    },
    rewards: {
      gold: 400,
      reputation: { trading: 25, military: 15 },
      tradingBonus: 0.1, // 10% better prices for next trade
      bonus: {
        condition: 'no_convoy_losses',
        gold: 200,
        reputation: { military: 20 },
      },
    },
  },
  {
    title: 'پیام مخفی', // Secret Message
    description:
      'پیام محرمانه‌ای باید به فرماندار پورت رویال برسد. مراقب جاسوسان باشید!',
    // A confidential message must reach the Governor of Port Royal. Beware of spies!
    type: 'stealth',
    difficulty: 'medium',
    requirements: {
      stealth: 3,
      speed: 2,
      trustworthiness: 'high',
      startLocation: 'secret_meeting',
      endLocation: 'port_royal',
      secrecy: 'absolute',
    },
    rewards: {
      gold: 250,
      reputation: { military: 20 },
      specialAccess: 'governors_favor',
      bonus: {
        condition: 'undetected',
        gold: 100,
        reputation: { cunning: 10 },
      },
    },
  },
  {
    title: 'تحقیق در ناپدیدی کشتی', // Missing Ship Investigation
    description:
      'کشتی تجاری "ستاره دریا" ناپدید شده. آخرین بار در مثلث برمودا دیده شده.',
    // The merchant ship "Sea Star" has disappeared. Last seen in the Bermuda Triangle.
    type: 'investigation',
    difficulty: 'hard',
    requirements: {
      investigationSkill: 3,
      courage: 2,
      searchArea: 'bermuda_triangle',
      equipment: ['compass', 'spyglass'],
      mysteryLevel: 'supernatural',
    },
    rewards: {
      gold: 350,
      reputation: { seamanship: 25 },
      mysteriousReward: 'ancient_artifact',
      bonus: {
        condition: 'solve_mystery',
        gold: 200,
        reputation: { cunning: 20 },
      },
    },
  },
  {
    title: 'قاچاق برای انقلابیون', // Smuggling for Revolutionaries
    description:
      'انقلابیون جامائیکا به اسلحه نیاز دارند. محموله را مخفیانه به آنها برسانید.',
    // Jamaican revolutionaries need weapons. Secretly deliver the cargo to them.
    type: 'smuggling',
    difficulty: 'very_hard',
    requirements: {
      stealth: 4,
      reputation: { pirate: 60 },
      cargoType: 'weapons',
      avoidance: ['naval_patrols', 'spanish_ships'],
      dropLocation: 'secret_cove',
    },
    rewards: {
      gold: 600,
      reputation: { pirate: 40, military: -30 },
      revolutionarySupport: true,
      bonus: {
        condition: 'perfect_stealth',
        gold: 300,
        reputation: { cunning: 25 },
      },
    },
  },
  {
    title: 'مسابقه بادبانی', // Sailing Race
    description:
      'مسابقه بزرگ بادبانی کاراییب برگزار می‌شود. برنده جایزه بزرگی خواهد برد!',
    // The Great Caribbean Sailing Race is being held. The winner will receive a great prize!
    type: 'race',
    difficulty: 'medium',
    requirements: {
      speed: 4,
      seamanship: 3,
      raceRoute: ['nassau', 'kingston', 'havana', 'port_royal'],
      competitors: 5,
      weatherFactors: true,
    },
    rewards: {
      gold: 1000,
      reputation: { seamanship: 50 },
      fame: 'racing_champion',
      trophyShip: 'upgraded_sails',
      bonus: {
        condition: 'record_time',
        gold: 500,
        reputation: { seamanship: 25 },
      },
    },
  },
  {
    title: 'دفاع از شهر', // City Defense
    description:
      'ناوگان اسپانیایی به پورت رویال حمله خواهد کرد. در دفاع از شهر شرکت کنید.',
    // Spanish fleet will attack Port Royal. Participate in the city's defense.
    type: 'defense',
    difficulty: 'very_hard',
    requirements: {
      combatRating: 4,
      loyalty: 'british',
      minimumReputation: { military: 70 },
      fleetPosition: 'defensive_line',
      enemyStrength: 'massive',
    },
    rewards: {
      gold: 750,
      reputation: { military: 60 },
      heroStatus: 'defender_of_port_royal',
      landGrant: 'plantation_deed',
      bonus: {
        condition: 'decisive_victory',
        gold: 500,
        reputation: { military: 40, bravery: 30 },
      },
    },
  },
];

// Helper function to determine mission status based on game state

function determineMissionStatus(
  mission: any,
  gameStatus: string
): MissionStatus {
  if (gameStatus === 'COMPLETED') {
    return Math.random() > 0.7 ? 'COMPLETED' : 'FAILED';
  } else if (gameStatus === 'ACTIVE') {
    const rand = Math.random();
    if (rand > 0.8) return 'IN_PROGRESS';
    if (rand > 0.6) return 'ASSIGNED';
    return 'AVAILABLE';
  }
  return 'AVAILABLE';
}

// Helper function to generate time-based missions
function generateTimeSensitiveMission(baseTemplate: any): any {
  const timeMultiplier = 0.5 + Math.random(); // 0.5 to 1.5
  return {
    ...baseTemplate,
    title: `${baseTemplate.title} (فوری)`, // (Urgent)
    requirements: {
      ...baseTemplate.requirements,
      timeLimit: Math.max(
        1,
        Math.floor((baseTemplate.requirements.timeLimit || 5) * timeMultiplier)
      ),
    },
    rewards: {
      ...baseTemplate.rewards,
      gold: Math.floor(baseTemplate.rewards.gold * 1.3), // 30% bonus for urgent missions
      reputation: Object.fromEntries(
        Object.entries(baseTemplate.rewards.reputation || {}).map(
          ([key, value]) => [key, Math.floor((value as number) * 1.2)]
        )
      ),
    },
  };
}

export async function seedMissions(
  prisma: PrismaClient,
  games: Game[]
): Promise<void> {
  for (const game of games) {
    console.log(`   Creating missions for game: ${game.name}`);

    // Create standard missions
    for (let i = 0; i < missionTemplates.length; i++) {
      const template = missionTemplates[i];
      const status = determineMissionStatus(template, game.status);

      await prisma.mission.create({
        data: {
          gameId: game.id,
          title: template.title,
          description: template.description,
          requirements: {
            type: template.type,
            difficulty: template.difficulty,
            details: template.requirements,
            prerequisites: {
              reputation: template.requirements.minimumReputation || {},
              equipment: template.requirements.equipment || [],
              skills: {
                combat: template.requirements.combatRating || 0,
                navigation: template.requirements.navigationSkill || 0,
                stealth: template.requirements.stealth || 0,
                investigation: template.requirements.investigationSkill || 0,
              },
            },
          },
          rewards: {
            primary: {
              gold: template.rewards.gold,
              reputation: template.rewards.reputation || {},
              items: [],
            },
            bonus: template.rewards.bonus || {},
            special: {
              access: template.rewards.specialAccess,
              status: template.rewards.heroStatus,
              ship_upgrades: template.rewards.trophyShip,
              land: template.rewards.landGrant,
            },
          },
          status: status,
          assignedToId:
            status === 'ASSIGNED' || status === 'IN_PROGRESS'
              ? (await prisma.player.findFirst({ where: { gameId: game.id } }))
                  ?.id
              : null,
        },
      });

      console.log(`     ✓ Created mission: ${template.title}`);
    }

    // Create some urgent/time-sensitive missions
    const urgentMissions = [0, 2, 4].map(i =>
      generateTimeSensitiveMission(missionTemplates[i])
    );

    for (const urgentMission of urgentMissions) {
      const status = determineMissionStatus(urgentMission, game.status);

      await prisma.mission.create({
        data: {
          gameId: game.id,
          title: urgentMission.title,
          description: urgentMission.description + ' ⏰ مهلت محدود!', // Limited time!
          requirements: {
            type: urgentMission.type,
            difficulty: urgentMission.difficulty,
            urgent: true,
            details: urgentMission.requirements,
            prerequisites: {
              reputation: urgentMission.requirements.minimumReputation || {},
              equipment: urgentMission.requirements.equipment || [],
              skills: {
                combat: urgentMission.requirements.combatRating || 0,
                navigation: urgentMission.requirements.navigationSkill || 0,
                stealth: urgentMission.requirements.stealth || 0,
                investigation:
                  urgentMission.requirements.investigationSkill || 0,
              },
            },
          },
          rewards: {
            primary: {
              gold: urgentMission.rewards.gold,
              reputation: urgentMission.rewards.reputation || {},
              items: [],
            },
            bonus: urgentMission.rewards.bonus || {},
            special: {
              access: urgentMission.rewards.specialAccess,
              status: urgentMission.rewards.heroStatus,
              ship_upgrades: urgentMission.rewards.trophyShip,
              land: urgentMission.rewards.landGrant,
            },
          },
          status: status,
          assignedToId:
            status === 'ASSIGNED' || status === 'IN_PROGRESS'
              ? (await prisma.player.findFirst({ where: { gameId: game.id } }))
                  ?.id
              : null,
        },
      });

      console.log(`     ✓ Created urgent mission: ${urgentMission.title}`);
    }

    // Create some random daily missions
    const dailyMissionTypes = [
      {
        title: 'تحویل روزانه', // Daily Delivery
        description: 'یک محموله کوچک را به مقصد نزدیک برسانید.',
        type: 'daily_delivery',
        rewards: { gold: 50, reputation: { trading: 5 } },
      },
      {
        title: 'گشت‌زنی امنیتی', // Security Patrol
        description: 'در منطقه مشخص شده گشت‌زنی کنید.',
        type: 'daily_patrol',
        rewards: { gold: 40, reputation: { military: 5 } },
      },
      {
        title: 'جمع‌آوری اطلاعات', // Information Gathering
        description: 'اطلاعاتی از بندر جمع‌آوری کنید.',
        type: 'daily_intel',
        rewards: { gold: 60, reputation: { cunning: 5 } },
      },
    ];

    for (const dailyType of dailyMissionTypes) {
      await prisma.mission.create({
        data: {
          gameId: game.id,
          title: dailyType.title,
          description: dailyType.description,
          requirements: {
            type: dailyType.type,
            difficulty: 'easy',
            daily: true,
            details: {
              timeLimit: 1,
              refreshDaily: true,
            },
            prerequisites: {},
          },
          rewards: {
            primary: dailyType.rewards,
            bonus: {},
            special: {},
          },
          status: 'AVAILABLE',
        },
      });

      console.log(`     ✓ Created daily mission: ${dailyType.title}`);
    }
  }
}
