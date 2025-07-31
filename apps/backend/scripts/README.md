# Database Seeding Scripts

This directory contains comprehensive database seeding scripts for the High Seas VTT project. The scripts create realistic test data including users, games, players, ships, markets, and missions with Persian language support.

## Available Scripts

### Main Seeding Scripts

- **`npm run db:seed`** - Complete database seeding (clears all data and creates fresh seed data)
- **`npm run db:seed:partial <types>`** - Partial seeding for specific data types
- **`npm run db:cleanup`** - Clean all seeded data from database

### Usage Examples

```bash
# Full database seeding (recommended for development setup)
npm run db:seed

# Seed only users and games
npm run db:seed:partial users games

# Seed only markets (requires existing games)
npm run db:seed:partial markets

# Seed only missions (requires existing games)
npm run db:seed:partial missions

# Clean all data
npm run db:cleanup
```

## Seeded Data Overview

### Users (8 total)

- **Test Users**: Various captain personas with English names
- **Persian Users**: Users with Persian usernames for RTL testing
- **Game Master**: Special GM account for game management

**Default Password**: `password123` for all test users, `gmpassword` for GM

### Games (3 total)

- **Active Game**: "بحر آزاد - دریای کاراییب" (Free Seas - Caribbean Sea)
  - 5 active players with ships
  - Round 3, Planning phase
  - Full game settings configured
- **Setup Game**: "نبرد دزدان دریایی" (Battle of Pirates)
  - No players yet
  - Ready for player joining
- **Completed Game**: "گنج جزیره مرده" (Dead Island Treasure)
  - Historical reference game

### Players & Ships (5 per active game)

- **Persian Captain Names**: کاپیتان جک اسپرو, دریاسالار نورینگتون, etc.
- **Persian Ship Names**: بادبان سیاه, طوفان دریا, شاهین دریایی, etc.
- **Diverse Ship Classes**: Frigate, Sloop, Cutter, Ship of the Line, Brigantine
- **Realistic Stats**: Speed, durability, cannons, cargo capacity
- **Starting Cargo**: Different cargo types based on role (pirate, merchant, naval)
- **Crew Management**: Morale, experience, wages

### Markets (6 per game)

- **Locations**: Port Royal, Tortuga, Havana, Nassau, Cartagena, Kingston
- **Persian Names**: پورت رویال, تورتوگا, هاوانا, ناسائو, کارتاخنا, کینگستون
- **25+ Goods Types**: Including Persian names (رام, شکر, تنباکو, etc.)
- **Dynamic Pricing**: Based on location modifiers and specialties
- **Supply/Demand**: Realistic economic simulation
- **Categories**:
  - Trade Goods (rum, sugar, spices, silk)
  - Precious Goods (gold, silver, emeralds, pearls)
  - Military Supplies (gunpowder, cannons, muskets)
  - Ship Supplies (rope, sailcloth, hardwood)
  - Provisions (salt, fish, water)
  - Contraband (stolen goods, smuggled items)

### Missions (13+ per game)

- **Mission Types**:
  - Transport (حمل محموله تجاری)
  - Combat (شکار دزد دریایی)
  - Exploration (جستجوی گنج مفقود)
  - Rescue (نجات مسافران)
  - Escort (اسکورت کاروان تجاری)
  - Stealth (پیام مخفی)
  - Investigation (تحقیق در ناپدیدی کشتی)
  - Smuggling (قاچاق برای انقلابیون)
  - Racing (مسابقه بادبانی)
  - Defense (دفاع از شهر)

- **Difficulty Levels**: Easy, Medium, Hard, Very Hard
- **Persian Descriptions**: Full Persian text with cultural context
- **Realistic Rewards**: Gold, reputation, special items
- **Bonus Conditions**: Additional rewards for excellent performance
- **Time-Sensitive**: Some missions with urgent variants
- **Daily Missions**: Repeatable short missions

## Data Structure Features

### Realistic Economics

- Location-based price modifiers
- Specialty goods discounts
- Supply and demand simulation
- Market trends and fluctuations

### Persian Language Support

- Persian character and ship names
- Persian mission titles and descriptions
- Persian goods names
- RTL text testing data

### Game Mechanics

- Captain stats: Cunning, Bravery, Charisma, Seamanship
- Reputation systems: Military, Trading, Pirate
- Ship conditions and maintenance
- Crew morale and experience
- Weather and environmental factors

### Mission System

- Complex requirement structures
- Multi-step missions
- Reputation prerequisites
- Equipment requirements
- Time limits and urgency
- Bonus objectives

## File Structure

```
scripts/
├── seed.ts              # Main seeding script
├── seed-partial.ts      # Partial seeding utility
├── cleanup.ts           # Database cleanup
└── seeders/
    ├── users.ts         # User accounts
    ├── games.ts         # Games, players, and ships
    ├── markets.ts       # Market locations and pricing
    └── missions.ts      # Mission templates and generation
```

## Development Tips

1. **Use partial seeding** during development to avoid recreating all data
2. **Markets and missions** require existing games - seed games first
3. **Clean data** before full seeding to avoid foreign key conflicts
4. **Check Prisma Studio** (`npm run db:studio`) to view seeded data
5. **Persian text** may require specific font support in your terminal

## Test Data Login Credentials

| Username           | Email                     | Role   | Password    |
| ------------------ | ------------------------- | ------ | ----------- |
| captain_sparrow    | jack.sparrow@pirates.sea  | Player | password123 |
| admiral_norrington | james.norrington@navy.gov | Player | password123 |
| blackbeard         | edward.teach@pirates.sea  | Player | password123 |
| gamemaster         | gm@highseas.vtt           | GM     | gmpassword  |
| دریابان            | persian.captain@seas.ir   | Player | password123 |

## Troubleshooting

### Common Issues

1. **Foreign Key Constraints**: Run cleanup before full seeding
2. **Missing Dependencies**: Ensure users exist before seeding games
3. **Persian Text Display**: Enable UTF-8 support in terminal
4. **Memory Issues**: Seed in smaller batches for large datasets

### Reset Development Database

```bash
# Complete reset and reseed
npm run db:cleanup
npm run db:seed

# Or use Prisma reset (more aggressive)
npx prisma migrate reset --force
npm run db:seed
```

This seeding system provides a comprehensive foundation for testing all aspects of the High Seas VTT application with realistic, culturally appropriate data.
