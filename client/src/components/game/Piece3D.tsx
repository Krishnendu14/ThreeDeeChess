import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, TextureLoader } from 'three';
import { Piece, PieceColor, PieceType, Position } from '../../game/types';
import { Html } from '@react-three/drei';
import cyanPawn from '@assets/generated_images/cyan_chess_pawn_transparent.png';
import cyanRook from '@assets/generated_images/cyan_chess_rook_transparent.png';
import cyanKnight from '@assets/generated_images/cyan_chess_knight_transparent.png';
import cyanBishop from '@assets/generated_images/cyan_chess_bishop_transparent.png';
import cyanQueen from '@assets/generated_images/cyan_chess_queen_transparent.png';
import cyanKing from '@assets/generated_images/cyan_chess_king_transparent.png';
import magentaPawn from '@assets/generated_images/magenta_chess_pawn_transparent.png';
import magentaRook from '@assets/generated_images/magenta_chess_rook_transparent.png';
import magentaKnight from '@assets/generated_images/magenta_chess_knight_transparent.png';
import magentaBishop from '@assets/generated_images/magenta_chess_bishop_transparent.png';
import magentaQueen from '@assets/generated_images/magenta_chess_queen_transparent.png';
import magentaKing from '@assets/generated_images/magenta_chess_king_transparent.png';

interface Piece3DProps {
  piece: Piece;
  isSelected: boolean;
  onClick: (e: any) => void;
}

const PIECE_IMAGES: Record<PieceColor, Record<PieceType, string>> = {
  cyan: {
    pawn: cyanPawn,
    rook: cyanRook,
    knight: cyanKnight,
    bishop: cyanBishop,
    queen: cyanQueen,
    king: cyanKing,
  },
  magenta: {
    pawn: magentaPawn,
    rook: magentaRook,
    knight: magentaKnight,
    bishop: magentaBishop,
    queen: magentaQueen,
    king: magentaKing,
  },
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

  const imageSrc = PIECE_IMAGES[piece.color][piece.type];

  return (
    <group
      ref={meshRef as any}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      position={[piece.position.x * 1.2 - 4.8, piece.position.y * 2 - 3, piece.position.z * 1.2 - 4.8]}
    >
      {/* Front facing plane */}
      <mesh rotation={[0, 0, 0]}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshBasicMaterial
          map={new TextureLoader().load(imageSrc)}
          transparent={true}
          fog={false}
          side={2}
        />
      </mesh>
      
      {/* Back facing plane (rotated 180 degrees) for visibility when board rotates */}
      <mesh rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshBasicMaterial
          map={new TextureLoader().load(imageSrc)}
          transparent={true}
          fog={false}
          side={2}
        />
      </mesh>

      {/* Glow effect for selected pieces */}
      {isSelected && (
        <>
          <mesh scale={1.15} rotation={[0, 0, 0]}>
            <planeGeometry args={[1.5, 1.5]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent={true}
              opacity={0.3}
              fog={false}
              side={2}
            />
          </mesh>
          <mesh scale={1.15} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[1.5, 1.5]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent={true}
              opacity={0.3}
              fog={false}
              side={2}
            />
          </mesh>
        </>
      )}
    </group>
  );
}
