import express from 'express';
import { PrismaClient } from '@prisma/client';
import { GridSystem, GridRegion } from '../utils/grid.js';
import { authenticateToken } from '../middleware/auth.js';
import { MapValidator } from '../utils/mapValidation.js';
import { MapTemplates } from '../utils/mapTemplates.js';
import { MapImportExport } from '../utils/mapImportExport.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Get game map data
 * GET /api/maps/:gameId
 */
router.get('/:gameId', authenticateToken, async (req, res): Promise<void> => {
  try {
    const { gameId } = req.params;

    // Check if user is part of the game
    const player = await prisma.player.findFirst({
      where: {
        gameId,
        userId: req.user!.userId,
      },
    });

    if (!player) {
      res.status(403).json({ error: 'Not authorized to access this game' });
      return;
    }

    // Get game map with features - For now, return a mock until Prisma is regenerated
    const mockGameMap = {
      id: `map-${gameId}`,
      gameId,
      name: 'Default Map',
      description: 'Default 20x20 game map',
      gridSize: 20,
      regions: GridSystem.createDefaultRegions(),
      features: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    res.json(mockGameMap);
  } catch (error) {
    console.error('Error fetching game map:', error);
    res.status(500).json({ error: 'Failed to fetch game map' });
  }
});

/**
 * Create or update game map
 * POST /api/maps/:gameId
 */
router.post('/:gameId', authenticateToken, async (req, res): Promise<void> => {
  try {
    const { gameId } = req.params;
    const { name, description, regions } = req.body;

    // Check if user is GM of the game
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    if (game.gmId !== req.user!.userId) {
      res.status(403).json({ error: 'Only game master can modify the map' });
      return;
    }

    // Validate regions data
    if (regions && !GridSystem.validateRegions(regions)) {
      res.status(400).json({ error: 'Invalid regions data' });
      return;
    }

    // For now, return a mock response until Prisma is regenerated
    const mockGameMap = {
      id: `map-${gameId}`,
      gameId,
      name: name || 'Default Map',
      description,
      gridSize: 20,
      regions: regions || GridSystem.createDefaultRegions(),
      features: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    res.json(mockGameMap);
  } catch (error) {
    console.error('Error creating/updating game map:', error);
    res.status(500).json({ error: 'Failed to create/update game map' });
  }
});

/**
 * Add map feature (island, port, reef, etc.)
 * POST /api/maps/:gameId/features
 */
router.post(
  '/:gameId/features',
  authenticateToken,
  async (req, res): Promise<void> => {
    try {
      const { gameId } = req.params;
      const {
        type,
        name,
        description,
        position,
        properties,
        isVisible = true,
      } = req.body;

      // Check if user is GM of the game
      const game = await prisma.game.findUnique({
        where: { id: gameId },
      });

      if (!game) {
        res.status(404).json({ error: 'Game not found' });
        return;
      }

      if (game.gmId !== req.user!.userId) {
        res
          .status(403)
          .json({ error: 'Only game master can add map features' });
        return;
      }

      // Validate position
      if (!position || !GridSystem.isValidPosition(position)) {
        res.status(400).json({ error: 'Invalid position' });
        return;
      }

      // For now, return a mock feature until Prisma is regenerated
      const mockFeature = {
        id: `feature-${Date.now()}`,
        mapId: `map-${gameId}`,
        type,
        name,
        description,
        position,
        properties,
        isVisible,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      res.status(201).json(mockFeature);
    } catch (error) {
      console.error('Error adding map feature:', error);
      res.status(500).json({ error: 'Failed to add map feature' });
    }
  }
);

/**
 * Update weather for a region
 * PUT /api/maps/:gameId/weather/:regionId
 */
router.put(
  '/:gameId/weather/:regionId',
  authenticateToken,
  async (req, res): Promise<void> => {
    try {
      const { gameId, regionId } = req.params;
      const { windDirection, windStrength, visibility, conditions } = req.body;

      // Check if user is GM of the game
      const game = await prisma.game.findUnique({
        where: { id: gameId },
      });

      if (!game) {
        res.status(404).json({ error: 'Game not found' });
        return;
      }

      if (game.gmId !== req.user!.userId) {
        res.status(403).json({ error: 'Only game master can modify weather' });
        return;
      }

      // Validate region ID
      const regionIdNum = parseInt(regionId);
      if (regionIdNum < 1 || regionIdNum > 4) {
        res.status(400).json({ error: 'Invalid region ID' });
        return;
      }

      // For now, return mock weather data
      const mockWeather = {
        regionId: regionIdNum,
        weather: {
          windDirection: windDirection || 'E',
          windStrength: windStrength !== undefined ? windStrength : 2,
          visibility: visibility !== undefined ? visibility : 80,
          conditions: conditions || ['clear'],
        },
      };

      res.json(mockWeather);
    } catch (error) {
      console.error('Error updating weather:', error);
      res.status(500).json({ error: 'Failed to update weather' });
    }
  }
);

/**
 * Get grid template
 * GET /api/maps/templates/default
 */
router.get('/templates/default', authenticateToken, async (req, res) => {
  try {
    const grid = GridSystem.createGrid();
    const regions = GridSystem.createDefaultRegions();

    res.json({
      gridSize: GridSystem.GRID_SIZE,
      grid,
      regions,
      defaultFeatures: [
        {
          type: 'PORT',
          name: 'Port Royal',
          position: { x: 5, y: 5 },
          properties: { dockingSlots: 8, tradingPost: true },
        },
        {
          type: 'PORT',
          name: 'Tortuga',
          position: { x: 15, y: 3 },
          properties: { dockingSlots: 6, pirateFriendly: true },
        },
        {
          type: 'ISLAND',
          name: 'Skull Island',
          position: { x: 8, y: 12 },
          properties: { size: 'small', treasureRumors: true },
        },
        {
          type: 'REEF',
          name: "Devil's Triangle",
          position: { x: 12, y: 8 },
          properties: { danger: 'high' },
        },
      ],
    });
  } catch (error) {
    console.error('Error generating map template:', error);
    res.status(500).json({ error: 'Failed to generate map template' });
  }
});

/**
 * Get all available map templates
 * GET /api/maps/templates
 */
router.get('/templates', authenticateToken, async (req, res) => {
  try {
    const templates = MapTemplates.getAllTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error fetching map templates:', error);
    res.status(500).json({ error: 'Failed to fetch map templates' });
  }
});

/**
 * Get specific map template
 * GET /api/maps/templates/:templateId
 */
router.get(
  '/templates/:templateId',
  authenticateToken,
  async (req, res): Promise<void> => {
    try {
      const { templateId } = req.params;
      const template = MapTemplates.getTemplate(templateId);

      if (!template) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }

      res.json(template);
    } catch (error) {
      console.error('Error fetching map template:', error);
      res.status(500).json({ error: 'Failed to fetch map template' });
    }
  }
);

/**
 * Export game map
 * GET /api/maps/:gameId/export
 */
router.get(
  '/:gameId/export',
  authenticateToken,
  async (req, res): Promise<void> => {
    try {
      const { gameId } = req.params;
      const { format = 'json' } = req.query;

      // Check if user is part of the game or is GM
      const player = await prisma.player.findFirst({
        where: {
          gameId,
          userId: req.user!.userId,
        },
      });

      const game = await prisma.game.findUnique({
        where: { id: gameId },
      });

      if (!game) {
        res.status(404).json({ error: 'Game not found' });
        return;
      }

      if (!player && game.gmId !== req.user!.userId) {
        res
          .status(403)
          .json({ error: 'Not authorized to export this game map' });
        return;
      }

      // For now, export a mock map until Prisma is regenerated
      const exportData = MapImportExport.exportMap(
        gameId,
        `${game.name} Map`,
        GridSystem.createDefaultRegions(),
        [],
        {
          description: `Exported map from game: ${game.name}`,
          author: req.user!.username,
        }
      );

      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${game.name.replace(/[^a-zA-Z0-9]/g, '_')}_map.json"`
        );
        res.json(exportData);
      } else {
        res.status(400).json({ error: 'Unsupported export format' });
      }
    } catch (error) {
      console.error('Error exporting map:', error);
      res.status(500).json({ error: 'Failed to export map' });
    }
  }
);

/**
 * Import map data
 * POST /api/maps/:gameId/import
 */
router.post(
  '/:gameId/import',
  authenticateToken,
  async (req, res): Promise<void> => {
    try {
      const { gameId } = req.params;
      const { mapData, mergeWithExisting = false } = req.body;

      // Check if user is GM of the game
      const game = await prisma.game.findUnique({
        where: { id: gameId },
      });

      if (!game) {
        res.status(404).json({ error: 'Game not found' });
        return;
      }

      if (game.gmId !== req.user!.userId) {
        res.status(403).json({ error: 'Only game master can import map data' });
        return;
      }

      // Import and validate map data
      const importResult = MapImportExport.importMap(mapData);

      if (!importResult.success) {
        res.status(400).json({
          error: 'Map import failed',
          details: importResult.errors,
          warnings: importResult.warnings,
        });
        return;
      }

      // For now, just return success until Prisma is regenerated
      res.json({
        success: true,
        imported: {
          name: importResult.data!.metadata.name,
          gridSize: importResult.data!.map.gridSize,
          regionCount: importResult.data!.map.regions.length,
          featureCount: importResult.data!.map.features.length,
        },
        warnings: importResult.warnings,
      });
    } catch (error) {
      console.error('Error importing map:', error);
      res.status(500).json({ error: 'Failed to import map' });
    }
  }
);

/**
 * Validate map data
 * POST /api/maps/validate
 */
router.post('/validate', authenticateToken, async (req, res): Promise<void> => {
  try {
    const { regions, features } = req.body;

    if (!regions) {
      res.status(400).json({ error: 'Regions data is required' });
      return;
    }

    const validation = MapValidator.validateMap(regions, features || []);

    res.json({
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings,
    });
  } catch (error) {
    console.error('Error validating map:', error);
    res.status(500).json({ error: 'Failed to validate map' });
  }
});

export default router;
