import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, Group } from 'three';
import { Piece, PieceColor, PieceType } from '../../game/types';

interface Piece3DProps {
  piece: Piece;
  isSelected: boolean;
  onClick: (e: any) => void;
}

const PIECE_COLORS = {
  cyan: '#00f0ff',
  magenta: '#ff00aa',
};

const PIECE_EMISSIVE = {
  cyan: '#00a0aa',
  magenta: '#aa0077',
};

export function Piece3D({ piece, isSelected, onClick }: Piece3DProps) {
  const groupRef = useRef<Group>(null);
  
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    const targetPos = new Vector3(
      piece.position.x * 1.2 - 4.8,
      piece.position.y * 2 - 3,
      piece.position.z * 1.2 - 4.8
    );
    
    groupRef.current.position.lerp(targetPos, 10 * delta);
    
    if (isSelected) {
      groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 5) * 0.1;
    }
  });

  const color = PIECE_COLORS[piece.color];
  const emissive = isSelected ? '#ffffff' : PIECE_EMISSIVE[piece.color];
  const emissiveIntensity = isSelected ? 2 : 0.5;

  const renderPieceGeometry = () => {
    switch (piece.type) {
      case 'pawn':
        return (
          <mesh castShadow>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial
              color={color}
              emissive={emissive}
              emissiveIntensity={emissiveIntensity}
              roughness={0.3}
              metalness={0.7}
            />
          </mesh>
        );
      case 'rook':
        return (
          <mesh castShadow>
            <boxGeometry args={[1.0, 1.4, 1.0]} />
            <meshStandardMaterial
              color={color}
              emissive={emissive}
              emissiveIntensity={emissiveIntensity}
              roughness={0.3}
              metalness={0.7}
            />
          </mesh>
        );
      case 'knight':
        return (
          <mesh castShadow>
            <cylinderGeometry args={[0.5, 0.5, 1.2, 8]} />
            <meshStandardMaterial
              color={color}
              emissive={emissive}
              emissiveIntensity={emissiveIntensity}
              roughness={0.3}
              metalness={0.7}
            />
          </mesh>
        );
      case 'bishop':
        return (
          <mesh castShadow>
            <coneGeometry args={[0.55, 1.6, 16]} />
            <meshStandardMaterial
              color={color}
              emissive={emissive}
              emissiveIntensity={emissiveIntensity}
              roughness={0.3}
              metalness={0.7}
            />
          </mesh>
        );
      case 'queen':
        return (
          <mesh castShadow>
            <dodecahedronGeometry args={[0.7]} />
            <meshStandardMaterial
              color={color}
              emissive={emissive}
              emissiveIntensity={emissiveIntensity}
              roughness={0.3}
              metalness={0.7}
            />
          </mesh>
        );
      case 'king':
        return (
          <mesh castShadow>
            <icosahedronGeometry args={[0.75]} />
            <meshStandardMaterial
              color={color}
              emissive={emissive}
              emissiveIntensity={emissiveIntensity}
              roughness={0.3}
              metalness={0.7}
            />
          </mesh>
        );
      default:
        return null;
    }
  };

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      position={[piece.position.x * 1.2 - 4.8, piece.position.y * 2 - 3, piece.position.z * 1.2 - 4.8]}
    >
      {renderPieceGeometry()}
    </group>
  );
}
