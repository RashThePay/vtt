import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Line, Text, Group } from 'react-konva';
import {
  Box,
  Paper,
  Typography,
  Slider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import Konva from 'konva';

interface GridCanvasProps {
  gridSize?: number;
  cellSize?: number;
  onCellClick?: (x: number, y: number) => void;
  onCellHover?: (x: number, y: number) => void;
  selectedCell?: { x: number; y: number } | null;
  showCoordinates?: boolean;
  interactive?: boolean;
}

interface GridCellData {
  x: number;
  y: number;
  color: string;
  content?: string;
}

const GridCanvas: React.FC<GridCanvasProps> = ({
  gridSize = 20,
  cellSize = 30,
  onCellClick,
  onCellHover,
  selectedCell,
  showCoordinates = true,
  interactive = true,
}) => {
  const stageRef = useRef<Konva.Stage>(null);
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [hoveredCell, setHoveredCell] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

  // Calculate grid dimensions
  const gridWidth = gridSize * cellSize;
  const gridHeight = gridSize * cellSize;

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('grid-container');
      if (container) {
        setStageSize({
          width: container.offsetWidth,
          height: container.offsetHeight,
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle zoom
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const scaleBy = 1.1;
    const stage = e.target.getStage();
    if (!stage) return;

    const oldScale = stage.scaleX();
    const mousePos = stage.getPointerPosition();
    if (!mousePos) return;

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    // Limit zoom
    const clampedScale = Math.max(0.1, Math.min(3, newScale));

    setStageScale(clampedScale);

    const newPos = {
      x: mousePos.x - ((mousePos.x - stage.x()) * clampedScale) / oldScale,
      y: mousePos.y - ((mousePos.y - stage.y()) * clampedScale) / oldScale,
    };

    setStagePosition(newPos);
  }, []);

  // Handle cell interaction
  const handleCellMouseEnter = useCallback(
    (x: number, y: number) => {
      if (!interactive) return;
      setHoveredCell({ x, y });
      onCellHover?.(x, y);
    },
    [interactive, onCellHover]
  );

  const handleCellMouseLeave = useCallback(() => {
    setHoveredCell(null);
  }, []);

  const handleCellClick = useCallback(
    (x: number, y: number) => {
      if (!interactive) return;
      onCellClick?.(x, y);
    },
    [interactive, onCellClick]
  );

  // Convert grid coordinates to letter-number format (A1, B2, etc.)
  const formatCoordinate = useCallback((x: number, y: number) => {
    const letter = String.fromCharCode(65 + x); // A, B, C, ...
    const number = y + 1; // 1, 2, 3, ...
    return `${letter}${number}`;
  }, []);

  // Render grid cells
  const renderGridCells = () => {
    const cells = [];

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const isSelected = selectedCell?.x === x && selectedCell?.y === y;
        const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;

        let fillColor = 'rgba(0, 0, 0, 0)';
        if (isSelected) {
          fillColor = 'rgba(25, 118, 210, 0.3)'; // Primary color with opacity
        } else if (isHovered) {
          fillColor = 'rgba(25, 118, 210, 0.1)';
        }

        cells.push(
          <Rect
            key={`cell-${x}-${y}`}
            x={x * cellSize}
            y={y * cellSize}
            width={cellSize}
            height={cellSize}
            fill={fillColor}
            stroke='rgba(255, 255, 255, 0.2)'
            strokeWidth={0.5}
            onMouseEnter={() => handleCellMouseEnter(x, y)}
            onMouseLeave={handleCellMouseLeave}
            onClick={() => handleCellClick(x, y)}
            listening={interactive}
          />
        );

        // Add coordinate labels if enabled and zoomed in enough
        if (showCoordinates && stageScale > 0.8) {
          cells.push(
            <Text
              key={`coord-${x}-${y}`}
              x={x * cellSize + 2}
              y={y * cellSize + 2}
              text={formatCoordinate(x, y)}
              fontSize={Math.max(8, cellSize * stageScale * 0.3)}
              fill='rgba(255, 255, 255, 0.6)'
              listening={false}
            />
          );
        }
      }
    }

    return cells;
  };

  // Render grid lines
  const renderGridLines = () => {
    if (!showGrid) return null;

    const lines = [];

    // Vertical lines
    for (let i = 0; i <= gridSize; i++) {
      lines.push(
        <Line
          key={`v-line-${i}`}
          points={[i * cellSize, 0, i * cellSize, gridHeight]}
          stroke='rgba(255, 255, 255, 0.3)'
          strokeWidth={i % 5 === 0 ? 1 : 0.5}
          listening={false}
        />
      );
    }

    // Horizontal lines
    for (let i = 0; i <= gridSize; i++) {
      lines.push(
        <Line
          key={`h-line-${i}`}
          points={[0, i * cellSize, gridWidth, i * cellSize]}
          stroke='rgba(255, 255, 255, 0.3)'
          strokeWidth={i % 5 === 0 ? 1 : 0.5}
          listening={false}
        />
      );
    }

    return lines;
  };

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Controls */}
      <Paper
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          p: 2,
          zIndex: 1000,
          minWidth: 200,
        }}
      >
        <Typography variant='h6' gutterBottom>
          Grid Controls
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography gutterBottom>
            Zoom: {Math.round(stageScale * 100)}%
          </Typography>
          <Slider
            value={stageScale}
            onChange={(_, value) => setStageScale(value as number)}
            min={0.1}
            max={3}
            step={0.1}
            valueLabelDisplay='auto'
            valueLabelFormat={value => `${Math.round(value * 100)}%`}
          />
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={showGrid}
              onChange={e => setShowGrid(e.target.checked)}
            />
          }
          label='Show Grid Lines'
        />

        {hoveredCell && (
          <Box sx={{ mt: 2 }}>
            <Typography variant='body2'>
              Hovered: {formatCoordinate(hoveredCell.x, hoveredCell.y)}
            </Typography>
          </Box>
        )}

        {selectedCell && (
          <Box sx={{ mt: 1 }}>
            <Typography variant='body2'>
              Selected: {formatCoordinate(selectedCell.x, selectedCell.y)}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Canvas Container */}
      <Box
        id='grid-container'
        sx={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          cursor: interactive ? 'crosshair' : 'default',
        }}
      >
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePosition.x}
          y={stagePosition.y}
          onWheel={handleWheel}
          draggable={interactive}
          onDragEnd={e => {
            setStagePosition({
              x: e.target.x(),
              y: e.target.y(),
            });
          }}
        >
          <Layer>
            {/* Grid background */}
            <Rect
              x={0}
              y={0}
              width={gridWidth}
              height={gridHeight}
              fill='rgba(0, 10, 25, 0.8)'
              listening={false}
            />

            {/* Grid lines */}
            {renderGridLines()}

            {/* Grid cells */}
            <Group>{renderGridCells()}</Group>
          </Layer>
        </Stage>
      </Box>
    </Box>
  );
};

export default GridCanvas;
