/**
 * Grid System for High Seas VTT
 * Manages 20x20 grid operations, coordinates, and region calculations
 */

export interface GridPosition {
  x: number;
  y: number;
}

export interface GridCell {
  x: number;
  y: number;
  region: number;
  terrain: TerrainType;
  visibility?: boolean;
}

export interface GridRegion {
  id: number;
  name: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  weather: {
    windDirection: WindDirection;
    windStrength: number; // 0-3
    visibility: number; // 0-100
    conditions: WeatherCondition[];
  };
}

export enum TerrainType {
  WATER = 'water',
  SHALLOW = 'shallow',
  ISLAND = 'island',
  PORT = 'port',
  REEF = 'reef',
}

export enum WindDirection {
  N = 'N',
  NE = 'NE',
  E = 'E',
  SE = 'SE',
  S = 'S',
  SW = 'SW',
  W = 'W',
  NW = 'NW',
  CALM = 'CALM',
}

export enum WeatherCondition {
  CLEAR = 'clear',
  FOG = 'fog',
  STORM = 'storm',
  CURSED = 'cursed',
}

export class GridSystem {
  static readonly GRID_SIZE = 20;
  static readonly REGIONS = 4; // 4 regions (10x10 each)

  /**
   * Create a new 20x20 grid with default settings
   */
  static createGrid(): GridCell[][] {
    const grid: GridCell[][] = [];

    for (let y = 0; y < this.GRID_SIZE; y++) {
      grid[y] = [];
      for (let x = 0; x < this.GRID_SIZE; x++) {
        grid[y][x] = {
          x,
          y,
          region: this.getRegionFromPosition({ x, y }),
          terrain: TerrainType.WATER,
          visibility: true,
        };
      }
    }

    return grid;
  }

  /**
   * Get region ID from grid position (1-4)
   */
  static getRegionFromPosition(position: GridPosition): number {
    const { x, y } = position;

    if (x < 10 && y < 10) return 1; // Top-left
    if (x >= 10 && y < 10) return 2; // Top-right
    if (x < 10 && y >= 10) return 3; // Bottom-left
    if (x >= 10 && y >= 10) return 4; // Bottom-right

    throw new Error(`Invalid position: ${x}, ${y}`);
  }

  /**
   * Get region bounds
   */
  static getRegionBounds(regionId: number): GridRegion['bounds'] {
    switch (regionId) {
      case 1:
        return { x: 0, y: 0, width: 10, height: 10 };
      case 2:
        return { x: 10, y: 0, width: 10, height: 10 };
      case 3:
        return { x: 0, y: 10, width: 10, height: 10 };
      case 4:
        return { x: 10, y: 10, width: 10, height: 10 };
      default:
        throw new Error(`Invalid region ID: ${regionId}`);
    }
  }

  /**
   * Check if position is within grid bounds
   */
  static isValidPosition(position: GridPosition): boolean {
    return (
      position.x >= 0 &&
      position.x < this.GRID_SIZE &&
      position.y >= 0 &&
      position.y < this.GRID_SIZE
    );
  }

  /**
   * Calculate distance between two positions
   */
  static calculateDistance(pos1: GridPosition, pos2: GridPosition): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Get adjacent cells (8-directional)
   */
  static getAdjacentCells(position: GridPosition): GridPosition[] {
    const adjacent: GridPosition[] = [];
    const directions = [
      { x: -1, y: -1 },
      { x: 0, y: -1 },
      { x: 1, y: -1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: -1, y: 1 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ];

    for (const dir of directions) {
      const newPos = { x: position.x + dir.x, y: position.y + dir.y };
      if (this.isValidPosition(newPos)) {
        adjacent.push(newPos);
      }
    }

    return adjacent;
  }

  /**
   * Get cells within a radius
   */
  static getCellsInRadius(
    center: GridPosition,
    radius: number
  ): GridPosition[] {
    const cells: GridPosition[] = [];

    for (
      let y = Math.max(0, center.y - radius);
      y <= Math.min(this.GRID_SIZE - 1, center.y + radius);
      y++
    ) {
      for (
        let x = Math.max(0, center.x - radius);
        x <= Math.min(this.GRID_SIZE - 1, center.x + radius);
        x++
      ) {
        if (this.calculateDistance(center, { x, y }) <= radius) {
          cells.push({ x, y });
        }
      }
    }

    return cells;
  }

  /**
   * Convert grid coordinates to navigation bearing
   */
  static getCompassDirection(
    from: GridPosition,
    to: GridPosition
  ): WindDirection {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    // Calculate angle in degrees
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const normalizedAngle = (angle + 360) % 360;

    // Convert to compass directions
    if (normalizedAngle >= 337.5 || normalizedAngle < 22.5)
      return WindDirection.E;
    if (normalizedAngle >= 22.5 && normalizedAngle < 67.5)
      return WindDirection.SE;
    if (normalizedAngle >= 67.5 && normalizedAngle < 112.5)
      return WindDirection.S;
    if (normalizedAngle >= 112.5 && normalizedAngle < 157.5)
      return WindDirection.SW;
    if (normalizedAngle >= 157.5 && normalizedAngle < 202.5)
      return WindDirection.W;
    if (normalizedAngle >= 202.5 && normalizedAngle < 247.5)
      return WindDirection.NW;
    if (normalizedAngle >= 247.5 && normalizedAngle < 292.5)
      return WindDirection.N;
    if (normalizedAngle >= 292.5 && normalizedAngle < 337.5)
      return WindDirection.NE;

    return WindDirection.CALM;
  }

  /**
   * Create default regions with weather
   */
  static createDefaultRegions(): GridRegion[] {
    return [
      {
        id: 1,
        name: 'Caribbean East',
        bounds: this.getRegionBounds(1),
        weather: {
          windDirection: WindDirection.E,
          windStrength: 2,
          visibility: 80,
          conditions: [WeatherCondition.CLEAR],
        },
      },
      {
        id: 2,
        name: 'Bahamas',
        bounds: this.getRegionBounds(2),
        weather: {
          windDirection: WindDirection.NE,
          windStrength: 1,
          visibility: 90,
          conditions: [WeatherCondition.CLEAR],
        },
      },
      {
        id: 3,
        name: 'Spanish Main',
        bounds: this.getRegionBounds(3),
        weather: {
          windDirection: WindDirection.W,
          windStrength: 3,
          visibility: 70,
          conditions: [WeatherCondition.STORM],
        },
      },
      {
        id: 4,
        name: 'Caribbean West',
        bounds: this.getRegionBounds(4),
        weather: {
          windDirection: WindDirection.S,
          windStrength: 0,
          visibility: 100,
          conditions: [WeatherCondition.CLEAR],
        },
      },
    ];
  }

  /**
   * Validate grid data structure
   */
  static validateGrid(grid: GridCell[][]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check dimensions
    if (grid.length !== this.GRID_SIZE) {
      errors.push(
        `Invalid grid height: expected ${this.GRID_SIZE}, got ${grid.length}`
      );
    }

    for (let y = 0; y < grid.length; y++) {
      if (grid[y].length !== this.GRID_SIZE) {
        errors.push(
          `Invalid grid width at row ${y}: expected ${this.GRID_SIZE}, got ${grid[y].length}`
        );
      }

      for (let x = 0; x < grid[y].length; x++) {
        const cell = grid[y][x];

        // Check position consistency
        if (cell.x !== x || cell.y !== y) {
          errors.push(
            `Position mismatch at (${x}, ${y}): cell reports (${cell.x}, ${cell.y})`
          );
        }

        // Check region validity
        if (cell.region < 1 || cell.region > 4) {
          errors.push(`Invalid region at (${x}, ${y}): ${cell.region}`);
        }

        // Verify region calculation
        const expectedRegion = this.getRegionFromPosition({ x, y });
        if (cell.region !== expectedRegion) {
          errors.push(
            `Incorrect region at (${x}, ${y}): expected ${expectedRegion}, got ${cell.region}`
          );
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate regions data
   */
  static validateRegions(regions: any[]): boolean {
    if (!Array.isArray(regions) || regions.length !== 4) {
      return false;
    }

    for (let i = 0; i < regions.length; i++) {
      const region = regions[i];

      // Check required properties
      if (!region.id || !region.name || !region.bounds || !region.weather) {
        return false;
      }

      // Check region ID
      if (region.id !== i + 1) {
        return false;
      }

      // Check bounds
      if (
        !region.bounds.x !== undefined ||
        !region.bounds.y !== undefined ||
        !region.bounds.width ||
        !region.bounds.height
      ) {
        return false;
      }

      // Check weather
      if (
        !region.weather.windDirection ||
        region.weather.windStrength === undefined ||
        region.weather.visibility === undefined ||
        !Array.isArray(region.weather.conditions)
      ) {
        return false;
      }
    }

    return true;
  }
}
