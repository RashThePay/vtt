import fs from 'fs/promises';
import path from 'path';
import { GridSystem, GridRegion } from './grid.js';
import { MapValidator } from './mapValidation.js';
import { MapTemplates, MapTemplate } from './mapTemplates.js';

export interface MapExportData {
  version: string;
  metadata: {
    name: string;
    description?: string;
    author?: string;
    created: string;
    modified: string;
    gameId?: string;
  };
  map: {
    gridSize: number;
    regions: GridRegion[];
    features: any[];
  };
  settings?: {
    difficulty?: string;
    weatherEnabled?: boolean;
    fogOfWar?: boolean;
  };
}

export interface ImportResult {
  success: boolean;
  data?: MapExportData;
  errors: string[];
  warnings: string[];
}

export class MapImportExport {
  private static readonly CURRENT_VERSION = '1.0.0';
  private static readonly SUPPORTED_VERSIONS = ['1.0.0'];

  /**
   * Export map data to JSON format
   */
  static exportMap(
    gameId: string,
    name: string,
    regions: GridRegion[],
    features: any[],
    options: {
      description?: string;
      author?: string;
      includeSettings?: boolean;
      settings?: any;
    } = {}
  ): MapExportData {
    const now = new Date().toISOString();

    return {
      version: this.CURRENT_VERSION,
      metadata: {
        name,
        description: options.description,
        author: options.author,
        created: now,
        modified: now,
        gameId,
      },
      map: {
        gridSize: GridSystem.GRID_SIZE,
        regions: JSON.parse(JSON.stringify(regions)), // Deep clone
        features: JSON.parse(JSON.stringify(features)),
      },
      settings: options.includeSettings ? options.settings : undefined,
    };
  }

  /**
   * Import map data from JSON format
   */
  static importMap(jsonData: any): ImportResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate basic structure
      if (!jsonData || typeof jsonData !== 'object') {
        errors.push('داده‌های JSON نامعتبر است');
        return { success: false, errors, warnings };
      }

      // Check version compatibility
      if (!jsonData.version) {
        warnings.push('نسخه‌ای مشخص نشده است، فرض بر این است که نسخه فعلی است');
        jsonData.version = this.CURRENT_VERSION;
      } else if (!this.SUPPORTED_VERSIONS.includes(jsonData.version)) {
        errors.push(
          `نسخه پشتیبانی نشده: ${jsonData.version}. نسخه‌های پشتیبانی شده: ${this.SUPPORTED_VERSIONS.join(', ')}`
        );
        return { success: false, errors, warnings };
      }

      // Validate metadata
      if (!jsonData.metadata || !jsonData.metadata.name) {
        errors.push('اطلاعات متادیتا نقشه موجود نیست یا نامعتبر است');
        return { success: false, errors, warnings };
      }

      // Validate map data
      if (!jsonData.map) {
        errors.push('اطلاعات نقشه موجود نیست');
        return { success: false, errors, warnings };
      }

      const mapData = jsonData.map;

      // Validate grid size
      if (mapData.gridSize !== GridSystem.GRID_SIZE) {
        warnings.push(
          `عدم تطابق اندازه شبکه: انتظار می‌رفت ${GridSystem.GRID_SIZE}، دریافت شد ${mapData.gridSize}`
        );
      }

      // Validate regions
      if (!mapData.regions) {
        errors.push('اطلاعات مناطق موجود نیست');
        return { success: false, errors, warnings };
      }

      const regionValidation = MapValidator.validateRegions(mapData.regions);
      errors.push(...regionValidation.errors);
      warnings.push(...regionValidation.warnings);

      // Validate features
      if (mapData.features) {
        const featureValidation = MapValidator.validateFeatures(
          mapData.features
        );
        errors.push(...featureValidation.errors);
        warnings.push(...featureValidation.warnings);
      } else {
        warnings.push('اطلاعات ویژگی‌ها موجود نیست');
        mapData.features = [];
      }

      // If there are errors, return failure
      if (errors.length > 0) {
        return { success: false, errors, warnings };
      }

      // Update metadata timestamps
      const now = new Date().toISOString();
      jsonData.metadata.modified = now;

      return {
        success: true,
        data: jsonData as MapExportData,
        errors,
        warnings,
      };
    } catch (error) {
      errors.push(
        `وارد کردن شکست خورد: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`
      );
      return { success: false, errors, warnings };
    }
  }

  /**
   * Export map to file
   */
  static async exportMapToFile(
    mapData: MapExportData,
    filePath: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const jsonString = JSON.stringify(mapData, null, 2);
      await fs.writeFile(filePath, jsonString, 'utf8');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `نوشتن فایل با شکست مواجه شد: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`,
      };
    }
  }

  /**
   * Import map from file
   */
  static async importMapFromFile(filePath: string): Promise<ImportResult> {
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      const jsonData = JSON.parse(fileContent);
      return this.importMap(jsonData);
    } catch (error) {
      return {
        success: false,
        errors: [
          `خواندن فایل با شکست مواجه شد: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`,
        ],
        warnings: [],
      };
    }
  }

  /**
   * Convert template to export format
   */
  static templateToExport(
    template: MapTemplate,
    options: {
      author?: string;
      gameId?: string;
    } = {}
  ): MapExportData {
    return this.exportMap(
      options.gameId || `template-${template.id}`,
      template.name,
      template.regions,
      template.defaultFeatures,
      {
        description: template.description,
        author: options.author,
        includeSettings: true,
        settings: {
          difficulty: template.difficulty,
          weatherEnabled: true,
          fogOfWar: true,
        },
      }
    );
  }

  /**
   * Convert export data to template
   */
  static exportToTemplate(exportData: MapExportData): MapTemplate {
    return {
      id: `imported-${Date.now()}`,
      name: exportData.metadata.name,
      description: exportData.metadata.description || 'Imported map',
      gridSize: exportData.map.gridSize,
      regions: exportData.map.regions,
      defaultFeatures: exportData.map.features,
      difficulty: (exportData.settings?.difficulty as any) || 'intermediate',
    };
  }

  /**
   * Merge two maps (useful for combining templates)
   */
  static mergeMaps(
    baseMap: MapExportData,
    overlayMap: MapExportData,
    options: {
      mergeFeatures?: boolean;
      mergeWeather?: boolean;
      preferOverlay?: boolean;
    } = {}
  ): MapExportData {
    const {
      mergeFeatures = true,
      mergeWeather = false,
      preferOverlay = false,
    } = options;

    const result = JSON.parse(JSON.stringify(baseMap)); // Deep clone

    // Update metadata
    const now = new Date().toISOString();
    result.metadata.name = preferOverlay
      ? overlayMap.metadata.name
      : `${baseMap.metadata.name} + ${overlayMap.metadata.name}`;
    result.metadata.description = preferOverlay
      ? overlayMap.metadata.description
      : result.metadata.description;
    result.metadata.modified = now;

    // Merge regions weather if requested
    if (mergeWeather) {
      for (
        let i = 0;
        i < overlayMap.map.regions.length && i < result.map.regions.length;
        i++
      ) {
        if (preferOverlay) {
          result.map.regions[i].weather = overlayMap.map.regions[i].weather;
        }
      }
    }

    // Merge features if requested
    if (mergeFeatures) {
      // Check for position conflicts
      const basePositions = new Set(
        result.map.features.map((f: any) => `${f.position?.x},${f.position?.y}`)
      );

      const overlayFeatures = overlayMap.map.features.filter((feature: any) => {
        const posKey = `${feature.position?.x},${feature.position?.y}`;
        return !basePositions.has(posKey);
      });

      result.map.features = [...result.map.features, ...overlayFeatures];
    }

    return result;
  }

  /**
   * Generate a map diff between two maps
   */
  static generateMapDiff(
    originalMap: MapExportData,
    modifiedMap: MapExportData
  ): {
    metadata: Record<string, any>;
    regions: Record<number, any>;
    features: {
      added: any[];
      removed: any[];
      modified: any[];
    };
  } {
    const diff = {
      metadata: {} as Record<string, any>,
      regions: {} as Record<number, any>,
      features: {
        added: [] as any[],
        removed: [] as any[],
        modified: [] as any[],
      },
    };

    // Compare metadata
    for (const key in modifiedMap.metadata) {
      if (
        originalMap.metadata[key as keyof typeof originalMap.metadata] !==
        modifiedMap.metadata[key as keyof typeof modifiedMap.metadata]
      ) {
        diff.metadata[key] = {
          from: originalMap.metadata[key as keyof typeof originalMap.metadata],
          to: modifiedMap.metadata[key as keyof typeof modifiedMap.metadata],
        };
      }
    }

    // Compare regions (simplified - just weather changes)
    for (
      let i = 0;
      i <
      Math.max(originalMap.map.regions.length, modifiedMap.map.regions.length);
      i++
    ) {
      const originalRegion = originalMap.map.regions[i];
      const modifiedRegion = modifiedMap.map.regions[i];

      if (originalRegion && modifiedRegion) {
        if (
          JSON.stringify(originalRegion.weather) !==
          JSON.stringify(modifiedRegion.weather)
        ) {
          diff.regions[i] = {
            from: originalRegion.weather,
            to: modifiedRegion.weather,
          };
        }
      }
    }

    // Compare features (simplified - by position)
    const originalPositions = new Map(
      originalMap.map.features.map((f: any) => [
        `${f.position?.x},${f.position?.y}`,
        f,
      ])
    );
    const modifiedPositions = new Map(
      modifiedMap.map.features.map((f: any) => [
        `${f.position?.x},${f.position?.y}`,
        f,
      ])
    );

    // Find added features
    for (const [pos, feature] of modifiedPositions) {
      if (!originalPositions.has(pos)) {
        diff.features.added.push(feature);
      }
    }

    // Find removed features
    for (const [pos, feature] of originalPositions) {
      if (!modifiedPositions.has(pos)) {
        diff.features.removed.push(feature);
      }
    }

    // Find modified features (same position, different properties)
    for (const [pos, modifiedFeature] of modifiedPositions) {
      const originalFeature = originalPositions.get(pos);
      if (
        originalFeature &&
        JSON.stringify(originalFeature) !== JSON.stringify(modifiedFeature)
      ) {
        diff.features.modified.push({
          position: modifiedFeature.position,
          from: originalFeature,
          to: modifiedFeature,
        });
      }
    }

    return {
      metadata: diff.metadata,
      regions: diff.regions,
      features: {
        added: diff.features.added,
        removed: diff.features.removed,
        modified: diff.features.modified.map(f => ({
          position: f.position,
          from: f.from,
          to: f.to,
          error: `ویژگی تغییر یافته در موقعیت ${f.position.x},${f.position.y}`,
        })),
      },
    };
  }

  /**
   * Validate exported map file
   */
  static validateExportFile(filePath: string): Promise<ImportResult> {
    return this.importMapFromFile(filePath);
  }

  /**
   * Get export file info without full import
   */
  static async getExportFileInfo(filePath: string): Promise<{
    success: boolean;
    info?: {
      name: string;
      description?: string;
      author?: string;
      created: string;
      version: string;
      gridSize: number;
      featureCount: number;
    };
    error?: string;
  }> {
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      const jsonData = JSON.parse(fileContent);

      if (!jsonData.metadata || !jsonData.map) {
        return { success: false, error: 'Invalid map file format' };
      }

      return {
        success: true,
        info: {
          name: jsonData.metadata.name,
          description: jsonData.metadata.description,
          author: jsonData.metadata.author,
          created: jsonData.metadata.created,
          version: jsonData.version || 'Unknown',
          gridSize: jsonData.map.gridSize || 20,
          featureCount: jsonData.map.features
            ? jsonData.map.features.length
            : 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to read file info: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}
