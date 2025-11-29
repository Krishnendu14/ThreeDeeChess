import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { Piece, PieceColor, PieceType, Position } from '../../game/types';
import { Html } from '@react-three/drei';

interface Piece3DProps {
  piece: Piece;
  isSelected: boolean;
  onClick: (e: any) => void;
}

const PIECE_COLORS = {
  white: '#00f0ff', // Cyan
  black: '#ff00aa', // Magenta
  cyan: '#00f0ff', // Cyan
  magenta: '#ff00aa', // Magenta
};

const PIECE_EMISSIVE = {
  white: '#00a0aa',
  black: '#aa0077',
  cyan: '#00a0aa',
  magenta: '#aa0077',
};

export function Piece3D({ piece, isSelected, onClick }: Piece3DProps) {
  const meshRef = useRef<Mesh>(null);
  
  // Animate position
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const targetPos = new Vector3(
      piece.position.x * 1.2 - 4.8, // Scale 1.2, Offset center
      piece.position.y * 2 - 3, // Vertical spacing 2
      piece.position.z * 1.2 - 4.8
    );
    
    // Smooth lerp
    meshRef.current.position.lerp(targetPos, 10 * delta);
    
    // Hover float effect
    if (isSelected) {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 5) * 0.1;
    }
  });

  const color = PIECE_COLORS[piece.color];
  const emissive = isSelected ? '#ffffff' : PIECE_EMISSIVE[piece.color];
  const emissiveIntensity = isSelected ? 2 : 0.5;

  const Geometry = useMemo(() => {
    switch (piece.type) {
      case 'pawn': return <sphereGeometry args={[0.6, 32, 32]} />;
      case 'rook': return <boxGeometry args={[1.2, 1.2, 1.2]} />;
      case 'bishop': return <coneGeometry args={[0.6, 1.5, 32]} />;
      case 'knight': return <cylinderGeometry args={[0.6, 0.6, 1.2, 6]} />; // Hexagonal prism
      case 'queen': return <dodecahedronGeometry args={[0.8]} />;
      case 'king': return <icosahedronGeometry args={[0.9]} />;
      default: return <boxGeometry args={[1, 1, 1]} />;
    }
  }, [piece.type]);

  return (
    <mesh
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      position={[piece.position.x * 1.2 - 4.8, piece.position.y * 2 - 3, piece.position.z * 1.2 - 4.8]}
    >
      {Geometry}
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        roughness={0.2}
        metalness={0.8}
      />
      {/* Label for clarity */}
      <Html position={[0, 1.5, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div className={`text-[10px] font-bold tracking-widest uppercase ${piece.color === 'white' ? 'text-cyan-400' : 'text-pink-500'} opacity-50`}>
          {piece.type}
        </div>
      </Html>
    </mesh>
  );
}
