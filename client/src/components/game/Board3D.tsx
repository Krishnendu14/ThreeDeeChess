import { useRef } from 'react';
import { Position, Piece, PieceColor } from '../../game/types';
import { Line, Edges, Text } from '@react-three/drei';
import { DoubleSide } from 'three';

interface Board3DProps {
  validMoves: Position[];
  pieces: Piece[];
  currentTurn: PieceColor;
  selectedPieceId: string | null;
  onCellClick: (pos: Position) => void;
}

const GRID_SIZE_X = 8;
const GRID_SIZE_Y = 4;
const GRID_SIZE_Z = 8;
const TILE_SIZE = 1.2;
const LAYER_SPACING = 2;

export function Board3D({ validMoves, pieces, currentTurn, selectedPieceId, onCellClick }: Board3DProps) {
  
  const isMoveValid = (x: number, y: number, z: number) => {
    return validMoves.some(m => m.x === x && m.y === y && m.z === z);
  };

  const isCapture = (x: number, y: number, z: number) => {
    // Check if there's an enemy piece at this position
    return pieces.some(p => 
      p.position.x === x && 
      p.position.y === y && 
      p.position.z === z && 
      p.color !== currentTurn
    );
  };

  const tiles = [];

  for (let y = 0; y < GRID_SIZE_Y; y++) {
    for (let x = 0; x < GRID_SIZE_X; x++) {
      for (let z = 0; z < GRID_SIZE_Z; z++) {
        const isValid = isMoveValid(x, y, z);
        
        // Position calculation to center the board
        const posX = x * TILE_SIZE - 4.8;
        const posY = y * LAYER_SPACING - 3;
        const posZ = z * TILE_SIZE - 4.8;

        const isBlackTile = (x + z + y) % 2 === 1; // 3D checkerboard pattern

        const xLabel = (x + 1).toString();
        const yLabel = String.fromCharCode(97 + y);
        const zLabel = String.fromCharCode(65 + z);
        const coordLabel = `${xLabel}${yLabel}${zLabel}`;
        
        const isCapturingMove = isValid && isCapture(x, y, z);
        const moveColor = isCapturingMove ? '#ff0000' : '#00ff00';
        const edgeColor = isCapturingMove ? '#ff6666' : '#00ccff';

        tiles.push(
          <group key={`${x}-${y}-${z}`} position={[posX, posY, posZ]}>
            {/* The Glass Tile */}
            <mesh 
              onClick={(e) => {
                e.stopPropagation();
                onCellClick({ x, y, z });
              }}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[TILE_SIZE * 0.95, TILE_SIZE * 0.95]} />
              <meshPhysicalMaterial 
                color={isValid ? moveColor : (isBlackTile ? '#1a1a2e' : '#16213e')}
                transparent
                opacity={isValid ? 0.4 : 0.1}
                side={DoubleSide}
                metalness={0.5}
                roughness={0.1}
                emissive={isValid ? moveColor : '#000000'}
                emissiveIntensity={isValid ? 0.5 : 0}
              />
              <Edges scale={1.01} threshold={15} color={edgeColor} linewidth={1.5} />
            </mesh>

            {/* Selection Highlight Ring */}
            {isValid && (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[0.5, 0.6, 32]} />
                <meshBasicMaterial color={moveColor} toneMapped={false} />
              </mesh>
            )}
            
            {/* Coordinate Label */}
            <Text 
              position={[0, 0.15, 0]} 
              fontSize={0.25} 
              color="#00ccff" 
              fillOpacity={0.8}
              rotation={[-Math.PI / 2, 0, 0]}
              anchorX="center"
              anchorY="middle"
            >
              {coordLabel}
            </Text>
          </group>
        );
      }
    }
    
    // Add Layer frame/border
    const layerY = y * LAYER_SPACING - 3;
    tiles.push(
      <Line
        key={`layer-frame-${y}`}
        points={[
          [-5, layerY, -5], [5, layerY, -5],
          [5, layerY, 5], [-5, layerY, 5],
          [-5, layerY, -5]
        ]}
        color="#4444ff"
        opacity={0.2}
        transparent
        lineWidth={1}
      />
    );
  }

  // Vertical Connectors (Corner posts to visualize the stack)
  const posts = [
    [-5, -5], [5, -5], [5, 5], [-5, 5]
  ].map(([px, pz], i) => (
    <Line
      key={`post-${i}`}
      points={[
        [px, -3, pz],
        [px, (GRID_SIZE_Y - 1) * LAYER_SPACING - 3, pz]
      ]}
      color="#4444ff"
      opacity={0.1}
      transparent
      lineWidth={1}
    />
  ));

  return (
    <group>
      {tiles}
      {posts}
    </group>
  );
}
