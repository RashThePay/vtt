import React, { useState, useCallback } from 'react';
import { Rect, Text, Group, Circle } from 'react-konva';

export interface GridCellData {
  x: number;
  y: number;
  type?: 'water' | 'island' | 'port' | 'reef' | 'ship' | 'treasure';
  content?: string;
  color?: string;
  occupied?: boolean;
  visible?: boolean;
  selected?: boolean;
  highlighted?: boolean;
}

interface InteractiveGridCellProps {
  data: GridCellData;
  cellSize: number;
  onCellClick?: (data: GridCellData) => void;
  onCellHover?: (data: GridCellData) => void;
  onCellDoubleClick?: (data: GridCellData) => void;
  showCoordinates?: boolean;
  scale?: number;
}

const InteractiveGridCell: React.FC<InteractiveGridCellProps> = ({
  data,
  cellSize,
  onCellClick,
  onCellHover,
  onCellDoubleClick,
  showCoordinates = true,
  scale = 1,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Cell type colors
  const getCellColor = useCallback(() => {
    if (data.color) return data.color;

    switch (data.type) {
      case 'water':
        return 'rgba(30, 144, 255, 0.3)';
      case 'island':
        return 'rgba(139, 69, 19, 0.7)';
      case 'port':
        return 'rgba(255, 215, 0, 0.6)';
      case 'reef':
        return 'rgba(255, 69, 0, 0.5)';
      case 'ship':
        return 'rgba(128, 128, 128, 0.8)';
      case 'treasure':
        return 'rgba(255, 215, 0, 0.8)';
      default:
        return 'rgba(0, 0, 0, 0)';
    }
  }, [data.color, data.type]);

  // Get border color based on state
  const getBorderColor = useCallback(() => {
    if (data.selected) return '#1976d2';
    if (data.highlighted) return '#ff9800';
    if (isHovered) return '#ffffff';
    return 'rgba(255, 255, 255, 0.2)';
  }, [data.selected, data.highlighted, isHovered]);

  // Get border width based on state
  const getBorderWidth = useCallback(() => {
    if (data.selected) return 3;
    if (data.highlighted) return 2;
    if (isHovered) return 1.5;
    return 0.5;
  }, [data.selected, data.highlighted, isHovered]);

  // Handle mouse events
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    onCellHover?.(data);
  }, [data, onCellHover]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleClick = useCallback(() => {
    onCellClick?.(data);
  }, [data, onCellClick]);

  const handleDoubleClick = useCallback(() => {
    onCellDoubleClick?.(data);
  }, [data, onCellDoubleClick]);

  // Calculate positions
  const x = data.x * cellSize;
  const y = data.y * cellSize;

  // Format coordinate display
  const coordinateText = String.fromCharCode(65 + data.x) + (data.y + 1);

  return (
    <Group>
      {/* Main cell rectangle */}
      <Rect
        x={x}
        y={y}
        width={cellSize}
        height={cellSize}
        fill={getCellColor()}
        stroke={getBorderColor()}
        strokeWidth={getBorderWidth()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onDblClick={handleDoubleClick}
        opacity={data.visible !== false ? 1 : 0.3}
      />

      {/* Coordinate label */}
      {showCoordinates && scale > 0.6 && (
        <Text
          x={x + 2}
          y={y + 2}
          text={coordinateText}
          fontSize={Math.max(6, cellSize * 0.25)}
          fill={data.type === 'island' ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'}
          listening={false}
        />
      )}

      {/* Content text */}
      {data.content && scale > 0.8 && (
        <Text
          x={x + cellSize / 2}
          y={y + cellSize / 2}
          text={data.content}
          fontSize={Math.max(8, cellSize * 0.3)}
          fill='#ffffff'
          align='center'
          verticalAlign='middle'
          offsetX={data.content.length * 3}
          offsetY={5}
          listening={false}
        />
      )}

      {/* Special indicators */}
      {data.type === 'ship' && (
        <Circle
          x={x + cellSize / 2}
          y={y + cellSize / 2}
          radius={Math.min(cellSize * 0.3, 8)}
          fill='#ffffff'
          stroke='#000000'
          strokeWidth={1}
          listening={false}
        />
      )}

      {data.type === 'treasure' && (
        <Text
          x={x + cellSize / 2}
          y={y + cellSize / 2}
          text='💰'
          fontSize={Math.min(cellSize * 0.6, 16)}
          align='center'
          verticalAlign='middle'
          offsetX={8}
          offsetY={8}
          listening={false}
        />
      )}

      {data.type === 'reef' && (
        <Text
          x={x + cellSize / 2}
          y={y + cellSize / 2}
          text='⚠'
          fontSize={Math.min(cellSize * 0.5, 14)}
          fill='#ff4444'
          align='center'
          verticalAlign='middle'
          offsetX={6}
          offsetY={7}
          listening={false}
        />
      )}

      {data.occupied && (
        <Rect
          x={x + cellSize - 6}
          y={y + 2}
          width={4}
          height={4}
          fill='#ff4444'
          listening={false}
        />
      )}
    </Group>
  );
};

export default InteractiveGridCell;
