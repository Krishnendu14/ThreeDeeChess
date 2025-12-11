import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, Group } from 'three';
import { Piece, PieceColor, PieceType, Position } from '../../game/types';
import { Html } from '@react-three/drei';

interface Piece3DProps {
  piece: Piece;
  isSelected: boolean;
  onClick: (e: any) => void;
}

const PIECE_COLORS = {
  cyan: '#00f0ff', // Cyan
  magenta: '#ff00aa', // Magenta
};

const PIECE_EMISSIVE = {
  cyan: '#00a0aa',
  magenta: '#aa0077',
};

const PieceMesh = ({ type, color, emissive, emissiveIntensity }: { type: PieceType; color: string; emissive: string; emissiveIntensity: number }) => {
  const Mat = () => <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} roughness={0.2} metalness={0.8} />;
  
  switch (type) {
    case 'pawn':
      return (
        <group>
          <mesh position={[0, -0.4, 0]}><cylinderGeometry args={[0.5, 0.6, 0.3, 32]} /><Mat /></mesh>
          <mesh position={[0, 0.1, 0]}><sphereGeometry args={[0.5, 32, 32]} /><Mat /></mesh>
          <mesh position={[0, 0.9, 0]}><sphereGeometry args={[0.35, 32, 32]} /><Mat /></mesh>
        </group>
      );
    case 'rook':
      return (
        <group>
          <mesh position={[0, -0.5, 0]}><cylinderGeometry args={[0.55, 0.6, 0.3, 8]} /><Mat /></mesh>
          <mesh position={[0, 0.2, 0]}><boxGeometry args={[0.8, 1.0, 0.8]} /><Mat /></mesh>
          <mesh position={[-0.3, 0.9, 0]}><boxGeometry args={[0.25, 0.35, 0.25]} /><Mat /></mesh>
          <mesh position={[0.3, 0.9, 0]}><boxGeometry args={[0.25, 0.35, 0.25]} /><Mat /></mesh>
          <mesh position={[0, 0.9, -0.3]}><boxGeometry args={[0.25, 0.35, 0.25]} /><Mat /></mesh>
          <mesh position={[0, 0.9, 0.3]}><boxGeometry args={[0.25, 0.35, 0.25]} /><Mat /></mesh>
        </group>
      );
    case 'bishop':
      return (
        <group>
          <mesh position={[0, -0.45, 0]}><cylinderGeometry args={[0.5, 0.6, 0.3, 32]} /><Mat /></mesh>
          <mesh position={[0, 0, 0]}><coneGeometry args={[0.55, 0.6, 32]} /><Mat /></mesh>
          <mesh position={[0, 0.5, 0]}><sphereGeometry args={[0.45, 32, 32]} /><Mat /></mesh>
          <mesh position={[0, 1.1, 0]}><coneGeometry args={[0.35, 0.8, 32]} /><Mat /></mesh>
        </group>
      );
    case 'knight':
      return (
        <group>
          <mesh position={[0, -0.45, 0]}><cylinderGeometry args={[0.5, 0.6, 0.3, 32]} /><Mat /></mesh>
          <mesh position={[0, 0.1, 0]}><boxGeometry args={[0.5, 0.7, 0.8]} /><Mat /></mesh>
          <mesh position={[0, 0.6, -0.3]}><boxGeometry args={[0.4, 0.6, 0.3]} /><Mat /></mesh>
          <mesh position={[0, 1.0, -0.4]}><sphereGeometry args={[0.3, 32, 32]} /><Mat /></mesh>
          <mesh position={[0, 1.35, -0.35]}><coneGeometry args={[0.1, 0.4, 16]} /><Mat /></mesh>
        </group>
      );
    case 'queen':
      return (
        <group>
          <mesh position={[0, -0.5, 0]}><cylinderGeometry args={[0.55, 0.65, 0.3, 32]} /><Mat /></mesh>
          <mesh position={[0, 0.05, 0]}><sphereGeometry args={[0.5, 32, 32]} /><Mat /></mesh>
          <mesh position={[0, 0.6, 0]}><coneGeometry args={[0.45, 0.6, 32]} /><Mat /></mesh>
          <mesh position={[-0.25, 1.3, 0]}><coneGeometry args={[0.15, 0.5, 16]} /><Mat /></mesh>
          <mesh position={[0.25, 1.3, 0]}><coneGeometry args={[0.15, 0.5, 16]} /><Mat /></mesh>
          <mesh position={[0, 1.3, -0.25]}><coneGeometry args={[0.15, 0.5, 16]} /><Mat /></mesh>
          <mesh position={[0, 1.3, 0.25]}><coneGeometry args={[0.15, 0.5, 16]} /><Mat /></mesh>
          <mesh position={[0, 1.15, 0]}><sphereGeometry args={[0.2, 32, 32]} /><Mat /></mesh>
        </group>
      );
    case 'king':
      return (
        <group>
          <mesh position={[0, -0.5, 0]}><cylinderGeometry args={[0.55, 0.65, 0.3, 32]} /><Mat /></mesh>
          <mesh position={[0, 0.05, 0]}><sphereGeometry args={[0.5, 32, 32]} /><Mat /></mesh>
          <mesh position={[0, 0.65, 0]}><coneGeometry args={[0.4, 0.7, 32]} /><Mat /></mesh>
          <mesh position={[0, 1.3, 0]}><coneGeometry args={[0.25, 0.6, 32]} /><Mat /></mesh>
          <mesh position={[0, 1.7, 0]}><sphereGeometry args={[0.2, 32, 32]} /><Mat /></mesh>
          <mesh position={[0, 1.75, 0]}><boxGeometry args={[0.35, 0.08, 0.08]} /><Mat /></mesh>
          <mesh position={[0, 1.9, 0]}><boxGeometry args={[0.08, 0.2, 0.08]} /><Mat /></mesh>
        </group>
      );
    default:
      return <mesh><boxGeometry args={[1, 1, 1]} /><Mat /></mesh>;
  }
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

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      position={[piece.position.x * 1.2 - 4.8, piece.position.y * 2 - 3, piece.position.z * 1.2 - 4.8]}
    >
      <PieceMesh type={piece.type} color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} />
    </group>
  );
}
