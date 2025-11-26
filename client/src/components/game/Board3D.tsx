import { useRef } from 'react';
import { Position } from '../../game/types';
import { Line, Edges, Text } from '@react-three/drei';
import { DoubleSide } from 'three';

interface Board3DProps {
  validMoves: Position[];
  onCellClick: (pos: Position) => void;
}

const GRID_SIZE_X = 8;
const GRID_SIZE_Y = 6;
const GRID_SIZE_Z = 8;
const TILE_SIZE = 1;
const LAYER_SPACING = 4;

export function Board3D({ validMoves, onCellClick }: Board3DProps) {
  
  const isMoveValid = (x: number, y: number, z: number) => {
    return validMoves.some(m => m.x === x && m.y === y && m.z === z);
  };

  const tiles = [];

  for (let y = 0; y < GRID_SIZE_Y; y++) {
    for (let x = 0; x < GRID_SIZE_X; x++) {
      for (let z = 0; z < GRID_SIZE_Z; z++) {
        const isValid = isMoveValid(x, y, z);
        
        // Position calculation to center the board
        const posX = x * TILE_SIZE - 3.5;
        const posY = y * LAYER_SPACING - 10;
        const posZ = z * TILE_SIZE - 3.5;

        const isBlackTile = (x + z + y) % 2 === 1; // 3D checkerboard pattern

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
                color={isValid ? '#00ff00' : (isBlackTile ? '#1a1a2e' : '#16213e')}
                transparent
                opacity={isValid ? 0.4 : 0.1}
                side={DoubleSide}
                metalness={0.5}
                roughness={0.1}
                emissive={isValid ? '#00ff00' : '#000000'}
                emissiveIntensity={isValid ? 0.5 : 0}
              />
            </mesh>

            {/* Selection Highlight Ring */}
            {isValid && (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[0.5, 0.6, 32]} />
                <meshBasicMaterial color="#00ff00" toneMapped={false} />
              </mesh>
            )}
            
            {/* Grid Coordinates for Debug/Clarity (Optional, maybe minimal) */}
            {/* <Text position={[-0.8, 0, -0.8]} fontSize={0.3} color="white" fillOpacity={0.2} rotation={[-Math.PI/2, 0, 0]}>
              {x},{y},{z}
            </Text> */}
          </group>
        );
      }
    }
    
    // Add Layer frame/border
    const layerY = y * LAYER_SPACING - 10;
    tiles.push(
      <Line
        key={`layer-frame-${y}`}
        points={[
          [-4, layerY, -4], [4, layerY, -4],
          [4, layerY, 4], [-4, layerY, 4],
          [-4, layerY, -4]
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
    [-4, -4], [4, -4], [4, 4], [-4, 4]
  ].map(([px, pz], i) => (
    <Line
      key={`post-${i}`}
      points={[
        [px, -10, pz],
        [px, (GRID_SIZE_Y - 1) * LAYER_SPACING - 10, pz]
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
