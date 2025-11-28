import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, PerspectiveCamera } from '@react-three/drei';
import { Board3D } from './Board3D';
import { Piece3D } from './Piece3D';
import { GameState, Position } from '../../game/types';
import { Suspense } from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

interface GameSceneProps {
  gameState: GameState;
  onPieceClick: (id: string) => void;
  onCellClick: (pos: Position) => void;
  selectedPieceId?: string | null;
}

export function GameScene({ gameState, onPieceClick, onCellClick }: GameSceneProps) {
  // Rotate board 180 degrees when it's black's turn
  const rotation = gameState.currentTurn === 'black' ? Math.PI : 0;
  
  return (
    <Canvas className="w-full h-full bg-black">
      <PerspectiveCamera makeDefault position={[12, 8, 12]} fov={50} />
      <OrbitControls 
        enablePan={false} 
        minDistance={10} 
        maxDistance={30}
        autoRotate={false}
        autoRotateSpeed={0.5}
      />
      
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4400ff" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <group rotation={[0, rotation, 0]}>
        <Board3D 
          validMoves={gameState.validMoves} 
          pieces={gameState.pieces}
          currentTurn={gameState.currentTurn}
          selectedPieceId={gameState.selectedPieceId}
          onCellClick={onCellClick}
        />
        
        {gameState.pieces.map(piece => (
          <Piece3D 
            key={piece.id} 
            piece={piece} 
            isSelected={piece.id === gameState.selectedPieceId}
            onClick={() => onPieceClick(piece.id)}
          />
        ))}
      </group>

      <EffectComposer>
        <Bloom luminanceThreshold={1} luminanceSmoothing={0.9} height={300} intensity={1.5} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
}
