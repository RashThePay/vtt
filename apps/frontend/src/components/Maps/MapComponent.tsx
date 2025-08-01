import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid as MuiGrid,
  Divider,
} from '@mui/material';
import GridCanvas from './GridCanvas';
import type { GridCellData } from './InteractiveGridCell';
import type { GridCoordinate } from '../../utils/gridCoordinates';
import { gridToAlphanumeric } from '../../utils/gridCoordinates';

interface MapComponentProps {
  gameId?: string;
  isGameMaster?: boolean;
  readOnly?: boolean;
}

interface MapState {
  selectedCell: GridCoordinate | null;
  gridData: Map<string, GridCellData>;
  hoveredCell: GridCoordinate | null;
}

const MapComponent: React.FC<MapComponentProps> = ({
  isGameMaster = false,
  readOnly = false,
}) => {
  const [mapState, setMapState] = useState<MapState>({
    selectedCell: null,
    gridData: new Map(),
    hoveredCell: null,
  });

  // Initialize default map data
  useEffect(() => {
    const initialData = new Map<string, GridCellData>();

    // Add some sample data
    const sampleIslands = [
      { x: 3, y: 5, type: 'island' as const },
      { x: 15, y: 8, type: 'island' as const },
      { x: 7, y: 12, type: 'island' as const },
      { x: 18, y: 15, type: 'island' as const },
    ];

    const samplePorts = [
      { x: 3, y: 4, type: 'port' as const },
      { x: 15, y: 7, type: 'port' as const },
    ];

    const sampleReefs = [
      { x: 10, y: 3, type: 'reef' as const },
      { x: 12, y: 10, type: 'reef' as const },
      { x: 5, y: 16, type: 'reef' as const },
    ];

    // Add sample data to map
    [...sampleIslands, ...samplePorts, ...sampleReefs].forEach(item => {
      const key = `${item.x}-${item.y}`;
      initialData.set(key, {
        x: item.x,
        y: item.y,
        type: item.type,
        visible: true,
      });
    });

    setMapState(prev => ({
      ...prev,
      gridData: initialData,
    }));
  }, []);

  // Handle cell click
  const handleCellClick = useCallback(
    (x: number, y: number) => {
      if (readOnly) return;

      setMapState(prev => ({
        ...prev,
        selectedCell: { x, y },
      }));
    },
    [readOnly]
  );

  // Handle cell hover
  const handleCellHover = useCallback((x: number, y: number) => {
    setMapState(prev => ({
      ...prev,
      hoveredCell: { x, y },
    }));
  }, []);

  // Add feature to selected cell
  const addFeature = useCallback(
    (type: GridCellData['type']) => {
      if (!mapState.selectedCell || readOnly) return;

      const key = `${mapState.selectedCell.x}-${mapState.selectedCell.y}`;
      const newData = new Map(mapState.gridData);

      newData.set(key, {
        x: mapState.selectedCell.x,
        y: mapState.selectedCell.y,
        type,
        visible: true,
      });

      setMapState(prev => ({
        ...prev,
        gridData: newData,
      }));
    },
    [mapState.selectedCell, mapState.gridData, readOnly]
  );

  // Remove feature from selected cell
  const removeFeature = useCallback(() => {
    if (!mapState.selectedCell || readOnly) return;

    const key = `${mapState.selectedCell.x}-${mapState.selectedCell.y}`;
    const newData = new Map(mapState.gridData);
    newData.delete(key);

    setMapState(prev => ({
      ...prev,
      gridData: newData,
    }));
  }, [mapState.selectedCell, mapState.gridData, readOnly]);

  // Clear all features
  const clearMap = useCallback(() => {
    if (readOnly) return;

    setMapState(prev => ({
      ...prev,
      gridData: new Map(),
    }));
  }, [readOnly]);

  // Get cell data for a coordinate
  const getCellData = useCallback(
    (x: number, y: number): GridCellData => {
      const key = `${x}-${y}`;
      const existing = mapState.gridData.get(key);

      return (
        existing || {
          x,
          y,
          type: 'water',
          visible: true,
          selected:
            mapState.selectedCell?.x === x && mapState.selectedCell?.y === y,
        }
      );
    },
    [mapState.gridData, mapState.selectedCell]
  );

  return (
    <Box sx={{ height: '100vh', display: 'flex' }}>
      {/* Map Canvas */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <GridCanvas
          gridSize={20}
          cellSize={40}
          onCellClick={handleCellClick}
          onCellHover={handleCellHover}
          selectedCell={mapState.selectedCell}
          showCoordinates={true}
          interactive={!readOnly}
        />
      </Box>

      {/* Control Panel */}
      {(isGameMaster || !readOnly) && (
        <Paper sx={{ width: 300, p: 2, overflow: 'auto' }}>
          <Typography variant='h6' gutterBottom>
            Map Editor
          </Typography>

          {mapState.selectedCell && (
            <>
              <Typography variant='body2' gutterBottom>
                Selected:{' '}
                {
                  gridToAlphanumeric(
                    mapState.selectedCell.x,
                    mapState.selectedCell.y
                  ).formatted
                }
              </Typography>

              <Typography variant='body2' gutterBottom>
                Current:{' '}
                {
                  getCellData(mapState.selectedCell.x, mapState.selectedCell.y)
                    .type
                }
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant='subtitle2' gutterBottom>
                Add Features:
              </Typography>

              <MuiGrid container spacing={1} sx={{ mb: 2 }}>
                <MuiGrid item xs={6}>
                  <Button
                    fullWidth
                    variant='outlined'
                    size='small'
                    onClick={() => addFeature('island')}
                    sx={{ backgroundColor: 'rgba(139, 69, 19, 0.1)' }}
                  >
                    Island
                  </Button>
                </MuiGrid>
                <MuiGrid item xs={6}>
                  <Button
                    fullWidth
                    variant='outlined'
                    size='small'
                    onClick={() => addFeature('port')}
                    sx={{ backgroundColor: 'rgba(255, 215, 0, 0.1)' }}
                  >
                    Port
                  </Button>
                </MuiGrid>
                <MuiGrid item xs={6}>
                  <Button
                    fullWidth
                    variant='outlined'
                    size='small'
                    onClick={() => addFeature('reef')}
                    sx={{ backgroundColor: 'rgba(255, 69, 0, 0.1)' }}
                  >
                    Reef
                  </Button>
                </MuiGrid>
                <MuiGrid item xs={6}>
                  <Button
                    fullWidth
                    variant='outlined'
                    size='small'
                    onClick={() => addFeature('treasure')}
                    sx={{ backgroundColor: 'rgba(255, 215, 0, 0.1)' }}
                  >
                    Treasure
                  </Button>
                </MuiGrid>
              </MuiGrid>

              <Button
                fullWidth
                variant='outlined'
                color='error'
                size='small'
                onClick={removeFeature}
                sx={{ mb: 1 }}
              >
                Remove Feature
              </Button>
            </>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant='subtitle2' gutterBottom>
            Map Actions:
          </Typography>

          <Button
            fullWidth
            variant='outlined'
            color='error'
            onClick={clearMap}
            sx={{ mb: 1 }}
          >
            Clear Map
          </Button>

          <Divider sx={{ my: 2 }} />

          <Typography variant='subtitle2' gutterBottom>
            Map Statistics:
          </Typography>

          <Typography variant='body2'>
            Islands:{' '}
            {
              Array.from(mapState.gridData.values()).filter(
                cell => cell.type === 'island'
              ).length
            }
          </Typography>
          <Typography variant='body2'>
            Ports:{' '}
            {
              Array.from(mapState.gridData.values()).filter(
                cell => cell.type === 'port'
              ).length
            }
          </Typography>
          <Typography variant='body2'>
            Reefs:{' '}
            {
              Array.from(mapState.gridData.values()).filter(
                cell => cell.type === 'reef'
              ).length
            }
          </Typography>
          <Typography variant='body2'>
            Treasures:{' '}
            {
              Array.from(mapState.gridData.values()).filter(
                cell => cell.type === 'treasure'
              ).length
            }
          </Typography>

          {mapState.hoveredCell && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant='body2'>
                Hovering:{' '}
                {
                  gridToAlphanumeric(
                    mapState.hoveredCell.x,
                    mapState.hoveredCell.y
                  ).formatted
                }
              </Typography>
            </>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default MapComponent;
