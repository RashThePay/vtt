import {
  GridSystem,
  GridRegion,
  TerrainType,
  WindDirection,
  WeatherCondition,
} from './grid.js';

export interface MapTemplate {
  id: string;
  name: string;
  description: string;
  gridSize: number;
  regions: GridRegion[];
  defaultFeatures: any[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export class MapTemplates {
  /**
   * Get all available map templates
   */
  static getAllTemplates(): MapTemplate[] {
    return [
      this.getClassicCaribbeanTemplate(),
      this.getStormyWatersTemplate(),
      this.getTreasureHuntTemplate(),
      this.getWarZoneTemplate(),
    ];
  }

  /**
   * Get a specific template by ID
   */
  static getTemplate(id: string): MapTemplate | null {
    const templates = this.getAllTemplates();
    const template = templates.find(t => t.id === id) || null;
    if (!template) {
      console.error(`قالب با شناسه ${id} یافت نشد`);
    }
    return template;
  }

  /**
   * Classic Caribbean Template - Good for beginners
   */
  static getClassicCaribbeanTemplate(): MapTemplate {
    return {
      id: 'classic-caribbean',
      name: 'کارائیب کلاسیک',
      description:
        'نقشه‌ای متعادل با بادهای متوسط و بنادر پراکنده. مناسب برای بازیکنان تازه‌کار.',
      gridSize: GridSystem.GRID_SIZE,
      difficulty: 'beginner',
      regions: [
        {
          id: 1,
          name: 'کارائیب شرقی',
          bounds: GridSystem.getRegionBounds(1),
          weather: {
            windDirection: WindDirection.E,
            windStrength: 2,
            visibility: 85,
            conditions: [WeatherCondition.CLEAR],
          },
        },
        {
          id: 2,
          name: 'باهاما',
          bounds: GridSystem.getRegionBounds(2),
          weather: {
            windDirection: WindDirection.NE,
            windStrength: 1,
            visibility: 90,
            conditions: [WeatherCondition.CLEAR],
          },
        },
        {
          id: 3,
          name: 'اسپانیای اصلی',
          bounds: GridSystem.getRegionBounds(3),
          weather: {
            windDirection: WindDirection.SE,
            windStrength: 2,
            visibility: 80,
            conditions: [WeatherCondition.CLEAR],
          },
        },
        {
          id: 4,
          name: 'کارائیب غربی',
          bounds: GridSystem.getRegionBounds(4),
          weather: {
            windDirection: WindDirection.S,
            windStrength: 1,
            visibility: 85,
            conditions: [WeatherCondition.CLEAR],
          },
        },
      ],
      defaultFeatures: [
        {
          type: 'PORT',
          name: 'پورت رویال',
          description: 'مرکز اصلی تجارت با امکانات عالی',
          position: { x: 5, y: 5 },
          properties: {
            dockingSlots: 8,
            tradingPost: true,
            repairYard: true,
            priceModifier: 1.0,
          },
          isVisible: true,
        },
        {
          type: 'PORT',
          name: 'ناساو',
          description: 'بندر دوستدار دزدان دریایی در باهاما',
          position: { x: 15, y: 3 },
          properties: {
            dockingSlots: 6,
            pirateFriendly: true,
            blackMarket: true,
            priceModifier: 0.8,
          },
          isVisible: true,
        },
        {
          type: 'PORT',
          name: 'کارتاگنا',
          description: 'بندر استعماری اسپانیایی با حضور نظامی',
          position: { x: 3, y: 15 },
          properties: {
            dockingSlots: 7,
            military: true,
            tradingPost: true,
            priceModifier: 1.2,
          },
          isVisible: true,
        },
        {
          type: 'PORT',
          name: 'تورتوگا',
          description: 'پناهگاه معروف دزدان دریایی',
          position: { x: 17, y: 12 },
          properties: {
            dockingSlots: 5,
            pirateFriendly: true,
            tavern: true,
            priceModifier: 0.9,
          },
          isVisible: true,
        },
        {
          type: 'ISLAND',
          name: 'جزیره میمون‌ها',
          description: 'جزیره کوچک گرمسیری',
          position: { x: 8, y: 8 },
          properties: { size: 'small', resources: ['میوه', 'چوب'] },
          isVisible: true,
        },
        {
          type: 'ISLAND',
          name: 'جزیره گنج',
          description: 'جزیره‌ای اسرارآمیز با شایعاتی درباره گنج‌ها',
          position: { x: 12, y: 14 },
          properties: { size: 'medium', treasureRumors: true },
          isVisible: true,
        },
        {
          type: 'REEF',
          name: 'صخره مرجانی',
          description: 'تشکیل خطرناک مرجان‌ها',
          position: { x: 7, y: 12 },
          properties: { danger: 'medium' },
          isVisible: true,
        },
      ],
    };
  }

  /**
   * Stormy Waters Template - Challenging weather conditions
   */
  static getStormyWatersTemplate(): MapTemplate {
    return {
      id: 'stormy-waters',
      name: 'آب‌های طوفانی',
      description:
        'شرایط آب و هوایی سخت با طوفان‌های مکرر و بادهای شدید. مناسب برای دریانوردان باتجربه.',
      gridSize: GridSystem.GRID_SIZE,
      difficulty: 'advanced',
      regions: [
        {
          id: 1,
          name: 'مسیر طوفان',
          bounds: GridSystem.getRegionBounds(1),
          weather: {
            windDirection: WindDirection.NE,
            windStrength: 3,
            visibility: 60,
            conditions: [WeatherCondition.STORM],
          },
        },
        {
          id: 2,
          name: 'بادهای تجاری',
          bounds: GridSystem.getRegionBounds(2),
          weather: {
            windDirection: WindDirection.E,
            windStrength: 2,
            visibility: 70,
            conditions: [WeatherCondition.CLEAR],
          },
        },
        {
          id: 3,
          name: 'دریای آرام',
          bounds: GridSystem.getRegionBounds(3),
          weather: {
            windDirection: WindDirection.CALM,
            windStrength: 0,
            visibility: 95,
            conditions: [WeatherCondition.CLEAR],
          },
        },
        {
          id: 4,
          name: 'بانک‌های مه',
          bounds: GridSystem.getRegionBounds(4),
          weather: {
            windDirection: WindDirection.W,
            windStrength: 1,
            visibility: 40,
            conditions: [WeatherCondition.FOG],
          },
        },
      ],
      defaultFeatures: [
        {
          type: 'PORT',
          name: 'بندر امن',
          description: 'تنها بندر واقعاً امن در این آب‌های خطرناک',
          position: { x: 10, y: 10 },
          properties: {
            dockingSlots: 12,
            stormShelter: true,
            repairYard: true,
            priceModifier: 1.5,
          },
          isVisible: true,
        },
        {
          type: 'FOG_BANK',
          name: 'مه ابدی',
          description: 'مه غلیظی که هرگز پاک نمی‌شود',
          position: { x: 15, y: 17 },
          properties: { visibilityReduction: 80 },
          isVisible: false,
        },
        {
          type: 'WEATHER_SYSTEM',
          name: 'چشم طوفان',
          description: 'چشم یک طوفان دائمی',
          position: { x: 5, y: 3 },
          properties: { windEffect: 'extreme', danger: 'very high' },
          isVisible: true,
        },
        {
          type: 'REEF',
          name: 'صخره کشتی‌شکسته',
          description: 'صخره‌ای پر از بقایای کشتی‌ها',
          position: { x: 18, y: 8 },
          properties: { danger: 'very high', salvage: true },
          isVisible: true,
        },
      ],
    };
  }

  /**
   * Treasure Hunt Template - Focus on exploration and treasure
   */
  static getTreasureHuntTemplate(): MapTemplate {
    return {
      id: 'treasure-hunt',
      name: 'شکار گنج',
      description:
        'نقشه‌ای طراحی شده برای ماجراجویی‌های شکار گنج با مکان‌های مخفی فراوان.',
      gridSize: GridSystem.GRID_SIZE,
      difficulty: 'intermediate',
      regions: GridSystem.createDefaultRegions(),
      defaultFeatures: [
        {
          type: 'PORT',
          name: 'پناهگاه قاچاقچیان',
          description: 'بندری مخفی که فقط تعداد کمی از آن خبر دارند',
          position: { x: 2, y: 18 },
          properties: {
            dockingSlots: 4,
            hidden: true,
            blackMarket: true,
            priceModifier: 0.7,
          },
          isVisible: false,
        },
        {
          type: 'TREASURE_SITE',
          name: 'طلای دفن شده',
          description: 'اینجا علامت گنج است',
          position: { x: 16, y: 5 },
          properties: { treasureValue: 1000, difficulty: 'medium' },
          isVisible: false,
        },
        {
          type: 'TREASURE_SITE',
          name: 'کشتی غرق شده',
          description: 'کشتی گنج اسپانیایی زیر امواج قرار دارد',
          position: { x: 8, y: 15 },
          properties: {
            treasureValue: 2500,
            difficulty: 'hard',
            underwater: true,
          },
          isVisible: false,
        },
        {
          type: 'ISLAND',
          name: 'جزیره جمجمه',
          description: 'جزیره‌ای شوم با رازهای تاریک',
          position: { x: 6, y: 6 },
          properties: {
            size: 'small',
            treasureRumors: true,
            haunted: true,
          },
          isVisible: true,
        },
        {
          type: 'ISLAND',
          name: 'جزیره مرد مرده',
          description: 'جزیره‌ای کوچک و غیرمسکونی',
          position: { x: 14, y: 12 },
          properties: { size: 'tiny', secretCave: true },
          isVisible: true,
        },
        {
          type: 'CURSED_WATER',
          name: 'مثلث شیطان',
          description: 'کشتی‌هایی که وارد اینجا می‌شوند هرگز دیده نمی‌شوند',
          position: { x: 11, y: 7 },
          properties: { curse: 'navigation', danger: 'extreme' },
          isVisible: true,
        },
      ],
    };
  }

  /**
   * War Zone Template - Military conflicts and battles
   */
  static getWarZoneTemplate(): MapTemplate {
    return {
      id: 'war-zone',
      name: 'منطقه جنگی',
      description: 'صحنه فعال دریایی با گشت‌های نظامی و آب‌های خصمانه.',
      gridSize: GridSystem.GRID_SIZE,
      difficulty: 'advanced',
      regions: [
        {
          id: 1,
          name: 'آب‌های بریتانیا',
          bounds: GridSystem.getRegionBounds(1),
          weather: {
            windDirection: WindDirection.W,
            windStrength: 2,
            visibility: 80,
            conditions: [WeatherCondition.CLEAR],
          },
        },
        {
          id: 2,
          name: 'قلمرو اسپانیا',
          bounds: GridSystem.getRegionBounds(2),
          weather: {
            windDirection: WindDirection.S,
            windStrength: 2,
            visibility: 85,
            conditions: [WeatherCondition.CLEAR],
          },
        },
        {
          id: 3,
          name: 'مستعمره فرانسه',
          bounds: GridSystem.getRegionBounds(3),
          weather: {
            windDirection: WindDirection.E,
            windStrength: 1,
            visibility: 75,
            conditions: [WeatherCondition.CLEAR],
          },
        },
        {
          id: 4,
          name: 'آب‌های مورد مناقشه',
          bounds: GridSystem.getRegionBounds(4),
          weather: {
            windDirection: WindDirection.N,
            windStrength: 3,
            visibility: 70,
            conditions: [WeatherCondition.STORM],
          },
        },
      ],
      defaultFeatures: [
        {
          type: 'PORT',
          name: 'پایگاه دریایی HMS',
          description: 'پایگاه دریایی بریتانیا با استحکامات سنگین',
          position: { x: 3, y: 3 },
          properties: {
            dockingSlots: 10,
            military: true,
            british: true,
            fortified: true,
            priceModifier: 1.3,
          },
          isVisible: true,
        },
        {
          type: 'PORT',
          name: 'کاستیلو سان کارلوس',
          description: 'قلعه و بندر اسپانیایی',
          position: { x: 17, y: 4 },
          properties: {
            dockingSlots: 8,
            military: true,
            spanish: true,
            fortified: true,
            priceModifier: 1.2,
          },
          isVisible: true,
        },
        {
          type: 'PORT',
          name: 'فورت-دو-فرانس',
          description: 'سنگر استعماری فرانسه',
          position: { x: 5, y: 16 },
          properties: {
            dockingSlots: 6,
            military: true,
            french: true,
            priceModifier: 1.1,
          },
          isVisible: true,
        },
        {
          type: 'HAZARD',
          name: 'منطقه نبرد',
          description: 'منطقه فعال جنگ دریایی',
          position: { x: 12, y: 12 },
          properties: {
            danger: 'extreme',
            militaryPatrols: true,
            activeWarfare: true,
          },
          isVisible: true,
        },
        {
          type: 'ISLAND',
          name: 'زمین بی‌طرف',
          description: 'قلمرو دیپلماتیک بی‌طرف',
          position: { x: 10, y: 8 },
          properties: {
            size: 'medium',
            neutral: true,
            diplomacy: true,
          },
          isVisible: true,
        },
      ],
    };
  }

  /**
   * Create a custom template based on parameters
   */
  static createCustomTemplate(
    name: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    weatherIntensity: 'calm' | 'moderate' | 'stormy',
    featureDensity: 'sparse' | 'normal' | 'dense'
  ): MapTemplate {
    const regions = this.generateRegionsForDifficulty(weatherIntensity);
    const features = this.generateFeaturesForDensity(featureDensity);

    if (!regions.length) {
      console.error('ایجاد مناطق با شکست مواجه شد');
    }

    if (!features.length) {
      console.error('ایجاد ویژگی‌ها با شکست مواجه شد');
    }

    return {
      id: `custom-${Date.now()}`,
      name,
      description: `نقشه سفارشی با سختی ${difficulty}، آب و هوای ${weatherIntensity}، و ویژگی‌های ${featureDensity}`,
      gridSize: GridSystem.GRID_SIZE,
      difficulty,
      regions,
      defaultFeatures: features,
    };
  }

  /**
   * Generate regions based on weather intensity
   */
  private static generateRegionsForDifficulty(
    intensity: 'calm' | 'moderate' | 'stormy'
  ): GridRegion[] {
    const baseRegions = GridSystem.createDefaultRegions();

    switch (intensity) {
      case 'calm':
        return baseRegions.map(region => ({
          ...region,
          weather: {
            ...region.weather,
            windStrength: Math.min(1, region.weather.windStrength),
            visibility: Math.max(90, region.weather.visibility),
            conditions: [WeatherCondition.CLEAR],
          },
        }));

      case 'stormy':
        return baseRegions.map(region => ({
          ...region,
          weather: {
            ...region.weather,
            windStrength: Math.max(2, region.weather.windStrength),
            visibility: Math.min(60, region.weather.visibility),
            conditions: [WeatherCondition.STORM, WeatherCondition.FOG],
          },
        }));

      default: // moderate
        return baseRegions;
    }
  }

  /**
   * Generate features based on density
   */
  private static generateFeaturesForDensity(
    density: 'sparse' | 'normal' | 'dense'
  ): any[] {
    const baseFeatures = this.getClassicCaribbeanTemplate().defaultFeatures;

    switch (density) {
      case 'sparse':
        return baseFeatures.slice(0, 4); // Only major ports

      case 'dense':
        return [
          ...baseFeatures,
          // Add more features for dense maps
          {
            type: 'ISLAND',
            name: 'جزیره‌ی مرموز',
            position: { x: 4, y: 9 },
            properties: { size: 'small' },
            isVisible: true,
          },
          {
            type: 'REEF',
            name: 'صخره مرجانی',
            position: { x: 13, y: 6 },
            properties: { danger: 'high' },
            isVisible: true,
          },
          {
            type: 'PORT',
            name: 'تجارت‌خانه',
            position: { x: 8, y: 16 },
            properties: { dockingSlots: 3, tradingPost: true },
            isVisible: true,
          },
        ];

      default: // normal
        return baseFeatures;
    }
  }
}
