import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, TextureLoader } from 'three';
import { Piece, PieceColor, PieceType, Position } from '../../game/types';
import { Billboard } from '@react-three/drei';
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
  const groupRef = useRef<any>(null);
  const animationTimeRef = useRef(0);
  
  // Animate position
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    animationTimeRef.current += delta;
    
    const targetPos = new Vector3(
      piece.position.x * 1.2 - 4.8,
      piece.position.y * 2 - 3,
      piece.position.z * 1.2 - 4.8
    );
    
    // Smooth lerp with easing
    groupRef.current.position.lerp(targetPos, Math.min(8 * delta, 1));
    
    // Enhanced selection effect: pulsing glow
    if (isSelected) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.15 + 0.85;
      groupRef.current.scale.set(pulse, pulse, pulse);
      
      // Vertical bobbing animation
      groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 4) * 0.08;
    } else {
      // Reset scale smoothly
      groupRef.current.scale.lerp(new Vector3(1, 1, 1), 5 * delta);
    }
  });

  const imageSrc = PIECE_IMAGES[piece.color][piece.type];
  const textureLoader = useMemo(() => new TextureLoader(), []);
  const texture = useMemo(() => textureLoader.load(imageSrc), [imageSrc, textureLoader]);

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      position={[piece.position.x * 1.2 - 4.8, piece.position.y * 2 - 3, piece.position.z * 1.2 - 4.8]}
    >
      {/* Billboard piece - always faces camera */}
      <Billboard>
        <mesh>
          <planeGeometry args={[1.5, 1.5]} />
          <meshBasicMaterial
            map={texture}
            transparent={true}
            fog={false}
          />
        </mesh>
      </Billboard>

      {/* Enhanced glow effect for selected pieces */}
      {isSelected && (
        <Billboard>
          <mesh scale={1.25} position={[0, 0, -0.01]}>
            <planeGeometry args={[1.5, 1.5]} />
            <meshBasicMaterial
              color={piece.color === 'cyan' ? '#00f0ff' : '#ff00aa'}
              transparent={true}
              opacity={0.4}
              fog={false}
            />
          </mesh>
          <mesh scale={1.1} position={[0, 0, -0.02]}>
            <planeGeometry args={[1.5, 1.5]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent={true}
              opacity={0.2}
              fog={false}
            />
          </mesh>
        </Billboard>
      )}
    </group>
  );
}
