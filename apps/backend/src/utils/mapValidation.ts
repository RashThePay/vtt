import { GridSystem, GridPosition, GridRegion, TerrainType } from './grid.js';

export interface MapValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class MapValidator {
  /**
   * Validate complete map configuration
   */
  static validateMap(
    regions: GridRegion[],
    features: any[]
  ): MapValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate regions
    const regionValidation = this.validateRegions(regions);
    errors.push(...regionValidation.errors);
    warnings.push(...regionValidation.warnings);

    // Validate features
    const featureValidation = this.validateFeatures(features);
    errors.push(...featureValidation.errors);
    warnings.push(...featureValidation.warnings);

    // Check for overlapping features
    const overlapValidation = this.validateFeatureOverlaps(features);
    errors.push(...overlapValidation.errors);
    warnings.push(...overlapValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate regions configuration
   */
  static validateRegions(regions: GridRegion[]): MapValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(regions)) {
      errors.push('مناطق باید یک آرایه باشند');
      return { isValid: false, errors, warnings };
    }

    if (regions.length !== 4) {
      errors.push(`انتظار می‌رفت ۴ منطقه، دریافت شد ${regions.length}`);
    }

    for (let i = 0; i < regions.length; i++) {
      const region = regions[i];
      const regionIndex = i + 1;

      // Check required properties
      if (!region.id) {
        errors.push(`منطقه ${regionIndex}: شناسه موجود نیست`);
      } else if (region.id !== regionIndex) {
        errors.push(
          `منطقه ${regionIndex}: عدم تطابق شناسه (انتظار می‌رفت ${regionIndex}، دریافت شد ${region.id})`
        );
      }

      if (!region.name || typeof region.name !== 'string') {
        errors.push(`منطقه ${regionIndex}: نام موجود نیست یا نامعتبر است`);
      }

      if (!region.bounds) {
        errors.push(`منطقه ${regionIndex}: اطلاعات مرز موجود نیست`);
      } else {
        const bounds = region.bounds;
        if (
          typeof bounds.x !== 'number' ||
          typeof bounds.y !== 'number' ||
          typeof bounds.width !== 'number' ||
          typeof bounds.height !== 'number'
        ) {
          errors.push(`منطقه ${regionIndex}: فرمت مرز نامعتبر است`);
        } else {
          // Validate bounds are within grid
          if (
            bounds.x < 0 ||
            bounds.y < 0 ||
            bounds.x + bounds.width > GridSystem.GRID_SIZE ||
            bounds.y + bounds.height > GridSystem.GRID_SIZE
          ) {
            errors.push(
              `منطقه ${regionIndex}: مرزها از محدودیت‌های شبکه فراتر می‌روند`
            );
          }

          // Check expected bounds for each region
          const expectedBounds = GridSystem.getRegionBounds(regionIndex);
          if (
            bounds.x !== expectedBounds.x ||
            bounds.y !== expectedBounds.y ||
            bounds.width !== expectedBounds.width ||
            bounds.height !== expectedBounds.height
          ) {
            warnings.push(
              `منطقه ${regionIndex}: مرزها با چیدمان استاندارد متفاوت است`
            );
          }
        }
      }

      if (!region.weather) {
        errors.push(`منطقه ${regionIndex}: اطلاعات آب و هوا موجود نیست`);
      } else {
        const weather = region.weather;

        // Validate wind direction
        const validDirections = [
          'N',
          'NE',
          'E',
          'SE',
          'S',
          'SW',
          'W',
          'NW',
          'CALM',
        ];
        if (!validDirections.includes(weather.windDirection)) {
          errors.push(
            `منطقه ${regionIndex}: جهت باد نامعتبر '${weather.windDirection}'`
          );
        }

        // Validate wind strength
        if (
          typeof weather.windStrength !== 'number' ||
          weather.windStrength < 0 ||
          weather.windStrength > 3
        ) {
          errors.push(`منطقه ${regionIndex}: قدرت باد باید بین ۰ تا ۳ باشد`);
        }

        // Validate visibility
        if (
          typeof weather.visibility !== 'number' ||
          weather.visibility < 0 ||
          weather.visibility > 100
        ) {
          errors.push(`منطقه ${regionIndex}: دید باید بین ۰ تا ۱۰۰ باشد`);
        }

        // Validate conditions
        if (!Array.isArray(weather.conditions)) {
          errors.push(
            `منطقه ${regionIndex}: شرایط آب و هوا باید یک آرایه باشد`
          );
        } else {
          const validConditions = ['clear', 'fog', 'storm', 'cursed'];
          for (const condition of weather.conditions) {
            if (!validConditions.includes(condition)) {
              errors.push(
                `منطقه ${regionIndex}: وضعیت آب و هوای نامعتبر '${condition}'`
              );
            }
          }
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate map features
   */
  static validateFeatures(features: any[]): MapValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(features)) {
      errors.push('ویژگی‌ها باید یک آرایه باشند');
      return { isValid: false, errors, warnings };
    }

    const validTypes = [
      'ISLAND',
      'PORT',
      'REEF',
      'HAZARD',
      'WEATHER_SYSTEM',
      'FOG_BANK',
      'CURSED_WATER',
      'TREASURE_SITE',
    ];

    for (let i = 0; i < features.length; i++) {
      const feature = features[i];
      const featureIndex = i + 1;

      // Check required properties
      if (!feature.type) {
        errors.push(`ویژگی ${featureIndex}: نوع موجود نیست`);
      } else if (!validTypes.includes(feature.type)) {
        errors.push(`ویژگی ${featureIndex}: نوع نامعتبر '${feature.type}'`);
      }

      if (!feature.name || typeof feature.name !== 'string') {
        errors.push(`ویژگی ${featureIndex}: نام موجود نیست یا نامعتبر است`);
      }

      if (!feature.position) {
        errors.push(`ویژگی ${featureIndex}: موقعیت موجود نیست`);
      } else {
        const pos = feature.position;
        if (typeof pos.x !== 'number' || typeof pos.y !== 'number') {
          errors.push(`ویژگی ${featureIndex}: فرمت موقعیت نامعتبر است`);
        } else if (!GridSystem.isValidPosition(pos)) {
          errors.push(
            `ویژگی ${featureIndex}: موقعیت (${pos.x}, ${pos.y}) خارج از محدوده شبکه است`
          );
        }
      }

      // Type-specific validation
      if (feature.type === 'PORT') {
        if (!feature.properties || !feature.properties.dockingSlots) {
          warnings.push(`Feature ${featureIndex}: Port missing docking slots`);
        }
      } else if (feature.type === 'REEF' || feature.type === 'HAZARD') {
        if (!feature.properties || !feature.properties.danger) {
          warnings.push(
            `Feature ${featureIndex}: ${feature.type} missing danger level`
          );
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Check for overlapping features
   */
  static validateFeatureOverlaps(features: any[]): MapValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const positionMap = new Map<string, string[]>();

    for (const feature of features) {
      if (feature.position) {
        const key = `${feature.position.x},${feature.position.y}`;
        if (!positionMap.has(key)) {
          positionMap.set(key, []);
        }
        positionMap.get(key)!.push(feature.name || feature.type);
      }
    }

    // Check for overlaps
    for (const [position, featureNames] of positionMap.entries()) {
      if (featureNames.length > 1) {
        const [x, y] = position.split(',');

        // Some overlaps are warnings, others are errors
        const hasPort = featureNames.some(name => name.includes('PORT'));
        const hasIsland = featureNames.some(name => name.includes('ISLAND'));

        if (hasPort && hasIsland) {
          // Port on island is acceptable
          warnings.push(
            `Position (${x}, ${y}): Port and island overlap - ${featureNames.join(', ')}`
          );
        } else {
          errors.push(
            `Position (${x}, ${y}): Multiple features overlap - ${featureNames.join(', ')}`
          );
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate ship movement path
   */
  static validateMovementPath(
    path: GridPosition[],
    regions: GridRegion[],
    features: any[]
  ): MapValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(path) || path.length === 0) {
      errors.push('مسیر حرکت نمی‌تواند خالی باشد');
      return { isValid: false, errors, warnings };
    }

    // Check each position in path
    for (let i = 0; i < path.length; i++) {
      const position = path[i];

      if (!GridSystem.isValidPosition(position)) {
        errors.push(
          `مرحله مسیر ${i + 1}: موقعیت (${position.x}, ${position.y}) خارج از محدوده شبکه است`
        );
        continue;
      }

      // Check for hazardous features
      const featuresAtPosition = features.filter(
        f =>
          f.position &&
          f.position.x === position.x &&
          f.position.y === position.y
      );

      for (const feature of featuresAtPosition) {
        if (feature.type === 'REEF') {
          warnings.push(
            `Path step ${i + 1}: Crossing reef '${feature.name}' at (${position.x}, ${position.y})`
          );
        } else if (
          feature.type === 'HAZARD' ||
          feature.type === 'CURSED_WATER'
        ) {
          warnings.push(
            `Path step ${i + 1}: Entering dangerous area '${feature.name}' at (${position.x}, ${position.y})`
          );
        } else if (feature.type === 'ISLAND') {
          errors.push(
            `Path step ${i + 1}: Cannot move through island '${feature.name}' at (${position.x}, ${position.y})`
          );
        }
      }

      // Check movement between adjacent positions
      if (i > 0) {
        const prevPosition = path[i - 1];
        const distance = GridSystem.calculateDistance(prevPosition, position);

        if (distance > Math.sqrt(2) + 0.01) {
          // Allow diagonal movement
          errors.push(
            `مرحله مسیر ${i + 1}: فاصله بین موقعیت‌ها بیش از حد مجاز است`
          );
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate template map data
   */
  static validateTemplate(template: any): MapValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!template) {
      errors.push('داده‌های قالب مورد نیاز است');
      return { isValid: false, errors, warnings };
    }

    // Check grid size
    if (!template.gridSize || template.gridSize !== GridSystem.GRID_SIZE) {
      errors.push(
        `اندازه شبکه نامعتبر: انتظار می‌رفت ${GridSystem.GRID_SIZE}، دریافت شد ${template.gridSize}`
      );
    }

    // Validate regions
    if (template.regions) {
      const regionValidation = this.validateRegions(template.regions);
      errors.push(...regionValidation.errors);
      warnings.push(...regionValidation.warnings);
    } else {
      warnings.push('قالب فاقد اطلاعات مناطق است');
    }

    // Validate default features
    if (template.defaultFeatures) {
      const featureValidation = this.validateFeatures(template.defaultFeatures);
      errors.push(...featureValidation.errors);
      warnings.push(...featureValidation.warnings);
    } else {
      warnings.push('قالب فاقد اطلاعات ویژگی‌های پیش‌فرض است');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }
}
