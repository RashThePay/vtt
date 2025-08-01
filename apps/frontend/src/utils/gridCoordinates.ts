/**
 * Grid coordinate system utilities for the High Seas VTT
 * Provides conversion between different coordinate formats
 */

export interface GridCoordinate {
  x: number;
  y: number;
}

export interface PixelCoordinate {
  x: number;
  y: number;
}

export interface AlphanumericCoordinate {
  letter: string;
  number: number;
  formatted: string;
}

/**
 * Convert grid coordinates (0-based) to alphanumeric format (A1, B2, etc.)
 */
export function gridToAlphanumeric(
  x: number,
  y: number
): AlphanumericCoordinate {
  const letter = String.fromCharCode(65 + x); // A, B, C, ...
  const number = y + 1; // 1, 2, 3, ...

  return {
    letter,
    number,
    formatted: `${letter}${number}`,
  };
}

/**
 * Convert alphanumeric coordinates back to grid coordinates
 */
export function alphanumericToGrid(coordinate: string): GridCoordinate | null {
  const match = coordinate.match(/^([A-Z])(\d+)$/);
  if (!match) return null;

  const letter = match[1];
  const number = parseInt(match[2], 10);

  const x = letter.charCodeAt(0) - 65; // A=0, B=1, C=2, ...
  const y = number - 1; // 1=0, 2=1, 3=2, ...

  return { x, y };
}

/**
 * Convert grid coordinates to pixel coordinates
 */
export function gridToPixel(
  gridX: number,
  gridY: number,
  cellSize: number
): PixelCoordinate {
  return {
    x: gridX * cellSize,
    y: gridY * cellSize,
  };
}

/**
 * Convert pixel coordinates to grid coordinates
 */
export function pixelToGrid(
  pixelX: number,
  pixelY: number,
  cellSize: number
): GridCoordinate {
  return {
    x: Math.floor(pixelX / cellSize),
    y: Math.floor(pixelY / cellSize),
  };
}

/**
 * Check if grid coordinates are within bounds
 */
export function isValidGridCoordinate(
  x: number,
  y: number,
  gridSize: number = 20
): boolean {
  return x >= 0 && x < gridSize && y >= 0 && y < gridSize;
}

/**
 * Calculate distance between two grid coordinates
 */
export function calculateGridDistance(
  coord1: GridCoordinate,
  coord2: GridCoordinate
): number {
  const dx = Math.abs(coord1.x - coord2.x);
  const dy = Math.abs(coord1.y - coord2.y);
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate Manhattan distance between two grid coordinates
 */
export function calculateManhattanDistance(
  coord1: GridCoordinate,
  coord2: GridCoordinate
): number {
  return Math.abs(coord1.x - coord2.x) + Math.abs(coord1.y - coord2.y);
}

/**
 * Get all adjacent grid coordinates (8-directional)
 */
export function getAdjacentCoordinates(
  x: number,
  y: number,
  gridSize: number = 20
): GridCoordinate[] {
  const adjacent: GridCoordinate[] = [];

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue; // Skip center cell

      const newX = x + dx;
      const newY = y + dy;

      if (isValidGridCoordinate(newX, newY, gridSize)) {
        adjacent.push({ x: newX, y: newY });
      }
    }
  }

  return adjacent;
}

/**
 * Get coordinates in a line between two points
 */
export function getLineCoordinates(
  start: GridCoordinate,
  end: GridCoordinate
): GridCoordinate[] {
  const coordinates: GridCoordinate[] = [];

  const dx = Math.abs(end.x - start.x);
  const dy = Math.abs(end.y - start.y);
  const sx = start.x < end.x ? 1 : -1;
  const sy = start.y < end.y ? 1 : -1;
  let err = dx - dy;

  let x = start.x;
  let y = start.y;

  while (true) {
    coordinates.push({ x, y });

    if (x === end.x && y === end.y) break;

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }

  return coordinates;
}

/**
 * Get coordinates in a circle around a center point
 */
export function getCircleCoordinates(
  center: GridCoordinate,
  radius: number,
  gridSize: number = 20
): GridCoordinate[] {
  const coordinates: GridCoordinate[] = [];

  for (let x = center.x - radius; x <= center.x + radius; x++) {
    for (let y = center.y - radius; y <= center.y + radius; y++) {
      if (!isValidGridCoordinate(x, y, gridSize)) continue;

      const distance = calculateGridDistance(center, { x, y });
      if (distance <= radius) {
        coordinates.push({ x, y });
      }
    }
  }

  return coordinates;
}

/**
 * Check if a coordinate is within a rectangular area
 */
export function isInRectangle(
  coord: GridCoordinate,
  topLeft: GridCoordinate,
  bottomRight: GridCoordinate
): boolean {
  return (
    coord.x >= topLeft.x &&
    coord.x <= bottomRight.x &&
    coord.y >= topLeft.y &&
    coord.y <= bottomRight.y
  );
}

/**
 * Generate a formatted coordinate list for display
 */
export function formatCoordinateList(coordinates: GridCoordinate[]): string {
  return coordinates
    .map(coord => gridToAlphanumeric(coord.x, coord.y).formatted)
    .join(', ');
}

/**
 * Parse a coordinate string list back to coordinates
 */
export function parseCoordinateList(
  coordinateString: string
): GridCoordinate[] {
  return coordinateString
    .split(',')
    .map(str => str.trim())
    .map(alphanumericToGrid)
    .filter((coord): coord is GridCoordinate => coord !== null);
}
