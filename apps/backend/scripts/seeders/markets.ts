import { PrismaClient, Game } from '@prisma/client';

// Market locations with Persian and English names
const marketLocations = [
  {
    id: 'port_royal',
    name: 'پورت رویال', // Port Royal
    region: 'Jamaica',
    type: 'major_port',
    specialties: ['rum', 'sugar', 'gunpowder'],
    modifiers: {
      military: 1.2, // 20% higher prices for military goods
      luxury: 0.9, // 10% lower prices for luxury goods
    },
  },
  {
    id: 'tortuga',
    name: 'تورتوگا', // Tortuga
    region: 'Hispaniola',
    type: 'pirate_haven',
    specialties: ['contraband', 'weapons', 'stolen_goods'],
    modifiers: {
      legal: 1.3, // 30% higher prices for legal goods
      contraband: 0.7, // 30% lower prices for contraband
    },
  },
  {
    id: 'havana',
    name: 'هاوانا', // Havana
    region: 'Cuba',
    type: 'spanish_port',
    specialties: ['tobacco', 'silver', 'coffee'],
    modifiers: {
      spanish: 0.8, // 20% lower prices for Spanish goods
      foreign: 1.4, // 40% higher prices for foreign goods
    },
  },
  {
    id: 'nassau',
    name: 'ناسائو', // Nassau
    region: 'Bahamas',
    type: 'free_port',
    specialties: ['pearls', 'salt', 'fish'],
    modifiers: {
      all: 1.0, // No price modifiers
    },
  },
  {
    id: 'cartagena',
    name: 'کارتاخنا', // Cartagena
    region: 'Spanish Main',
    type: 'fortified_port',
    specialties: ['emeralds', 'gold', 'spices'],
    modifiers: {
      precious: 0.9, // 10% lower prices for precious goods
      weapons: 1.5, // 50% higher prices for weapons
    },
  },
  {
    id: 'kingston',
    name: 'کینگستون', // Kingston
    region: 'Jamaica',
    type: 'naval_base',
    specialties: ['naval_supplies', 'hardwood', 'medicine'],
    modifiers: {
      military: 0.8, // 20% lower prices for military supplies
      pirate: 2.0, // 100% higher prices for known pirates
    },
  },
];

// Base goods with Persian names and realistic pricing
const baseGoods = {
  // Common Trade Goods
  rum: {
    name: 'رام', // Rum
    basePrice: 15,
    volatility: 0.3,
    category: 'consumable',
    rarity: 'common',
  },
  sugar: {
    name: 'شکر', // Sugar
    basePrice: 12,
    volatility: 0.2,
    category: 'agricultural',
    rarity: 'common',
  },
  tobacco: {
    name: 'تنباکو', // Tobacco
    basePrice: 25,
    volatility: 0.4,
    category: 'luxury',
    rarity: 'uncommon',
  },
  coffee: {
    name: 'قهوه', // Coffee
    basePrice: 20,
    volatility: 0.3,
    category: 'luxury',
    rarity: 'uncommon',
  },
  spices: {
    name: 'ادویه', // Spices
    basePrice: 35,
    volatility: 0.5,
    category: 'luxury',
    rarity: 'uncommon',
  },
  silk: {
    name: 'ابریشم', // Silk
    basePrice: 50,
    volatility: 0.6,
    category: 'luxury',
    rarity: 'rare',
  },
  tea: {
    name: 'چای', // Tea
    basePrice: 18,
    volatility: 0.25,
    category: 'consumable',
    rarity: 'common',
  },

  // Precious Goods
  gold: {
    name: 'طلا', // Gold
    basePrice: 100,
    volatility: 0.1,
    category: 'precious',
    rarity: 'very_rare',
  },
  silver: {
    name: 'نقره', // Silver
    basePrice: 60,
    volatility: 0.15,
    category: 'precious',
    rarity: 'rare',
  },
  emeralds: {
    name: 'زمرد', // Emeralds
    basePrice: 150,
    volatility: 0.8,
    category: 'precious',
    rarity: 'very_rare',
  },
  pearls: {
    name: 'مروارید', // Pearls
    basePrice: 80,
    volatility: 0.7,
    category: 'precious',
    rarity: 'rare',
  },

  // Military Supplies
  gunpowder: {
    name: 'باروت', // Gunpowder
    basePrice: 40,
    volatility: 0.4,
    category: 'military',
    rarity: 'uncommon',
  },
  cannon_balls: {
    name: 'گلوله توپ', // Cannon Balls
    basePrice: 8,
    volatility: 0.2,
    category: 'military',
    rarity: 'common',
  },
  muskets: {
    name: 'تفنگ', // Muskets
    basePrice: 75,
    volatility: 0.5,
    category: 'military',
    rarity: 'uncommon',
  },
  swords: {
    name: 'شمشیر', // Swords
    basePrice: 30,
    volatility: 0.3,
    category: 'military',
    rarity: 'common',
  },
  naval_supplies: {
    name: 'تجهیزات دریایی', // Naval Supplies
    basePrice: 45,
    volatility: 0.3,
    category: 'military',
    rarity: 'uncommon',
  },

  // Ship Supplies
  rope: {
    name: 'طناب', // Rope
    basePrice: 5,
    volatility: 0.1,
    category: 'supplies',
    rarity: 'common',
  },
  sailcloth: {
    name: 'پارچه بادبان', // Sailcloth
    basePrice: 22,
    volatility: 0.2,
    category: 'supplies',
    rarity: 'common',
  },
  hardwood: {
    name: 'چوب سخت', // Hardwood
    basePrice: 15,
    volatility: 0.15,
    category: 'supplies',
    rarity: 'common',
  },
  tar: {
    name: 'قیر', // Tar
    basePrice: 8,
    volatility: 0.1,
    category: 'supplies',
    rarity: 'common',
  },
  medicine: {
    name: 'دارو', // Medicine
    basePrice: 60,
    volatility: 0.4,
    category: 'supplies',
    rarity: 'uncommon',
  },

  // Food & Provisions
  salt: {
    name: 'نمک', // Salt
    basePrice: 3,
    volatility: 0.1,
    category: 'provisions',
    rarity: 'common',
  },
  fish: {
    name: 'ماهی', // Fish
    basePrice: 4,
    volatility: 0.3,
    category: 'provisions',
    rarity: 'common',
  },
  fruits: {
    name: 'میوه', // Fruits
    basePrice: 6,
    volatility: 0.4,
    category: 'provisions',
    rarity: 'common',
  },
  water: {
    name: 'آب شیرین', // Fresh Water
    basePrice: 2,
    volatility: 0.2,
    category: 'provisions',
    rarity: 'common',
  },

  // Contraband
  stolen_goods: {
    name: 'اجناس دزدی', // Stolen Goods
    basePrice: 80,
    volatility: 1.0,
    category: 'contraband',
    rarity: 'rare',
  },
  contraband: {
    name: 'کالای قاچاق', // Contraband
    basePrice: 120,
    volatility: 1.2,
    category: 'contraband',
    rarity: 'very_rare',
  },
};

function generateMarketPrices(location: any, baseGoods: any): any {
  const prices: any = {};

  const supplyLevels: any = {};

  for (const [goodId, good] of Object.entries(baseGoods)) {
    const basePrice = (good as any).basePrice;

    const volatility = (good as any).volatility;

    const category = (good as any).category;

    // Apply location modifiers
    let priceModifier = 1.0;
    if (location.modifiers[category]) {
      priceModifier *= location.modifiers[category];
    }
    if (location.modifiers.all) {
      priceModifier *= location.modifiers.all;
    }

    // Apply specialty bonus/penalty
    if (location.specialties.includes(goodId)) {
      priceModifier *= 0.85; // 15% cheaper for specialties
    }

    // Add random market fluctuation
    const fluctuation = 1 + (Math.random() - 0.5) * volatility;
    const finalPrice = Math.round(basePrice * priceModifier * fluctuation);

    // Generate supply levels
    const baseSupply = location.specialties.includes(goodId)
      ? 70 + Math.random() * 30 // 70-100 for specialties
      : 20 + Math.random() * 60; // 20-80 for others

    prices[goodId] = {
      current: finalPrice,
      base: basePrice,
      modifier: priceModifier,
      trend: Math.random() > 0.5 ? 'rising' : 'falling',
      lastUpdate: new Date().toISOString(),
    };

    supplyLevels[goodId] = {
      supply: Math.round(baseSupply),
      demand: Math.round(30 + Math.random() * 70),
      lastUpdate: new Date().toISOString(),
    };
  }

  return { prices, supplyLevels };
}

export async function seedMarkets(
  prisma: PrismaClient,
  games: Game[]
): Promise<void> {
  for (const game of games) {
    console.log(`   Creating markets for game: ${game.name}`);

    for (const location of marketLocations) {
      const { prices, supplyLevels } = generateMarketPrices(
        location,
        baseGoods
      );

      await prisma.market.create({
        data: {
          gameId: game.id,
          locationId: location.id,
          goodsPrices: {
            location: {
              id: location.id,
              name: location.name,
              region: location.region,
              type: location.type,
              specialties: location.specialties,
            },
            goods: prices,
            lastGlobalUpdate: new Date().toISOString(),
            marketEvents: [], // Can be populated with special events
          },
          supplyLevels: {
            levels: supplyLevels,
            trends: {
              overall: 'stable',
              categories: {
                luxury: 'rising',
                military: 'stable',
                provisions: 'falling',
              },
            },
            lastUpdate: new Date().toISOString(),
          },
        },
      });

      console.log(`     ✓ Created market: ${location.name}`);
    }
  }
}
