import { useState } from 'react';
import { initialGameState, getValidMoves, isValidMove } from '../game/logic';
import { GameState, Position, PieceColor } from '../game/types';
import { GameScene } from '../components/game/GameScene';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, RotateCcw } from 'lucide-react';
import generatedBackground from '@assets/generated_images/sci-fi_holographic_nebula_background.png';

export default function Game() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  
  const handlePieceClick = (id: string) => {
    const piece = gameState.pieces.find(p => p.id === id);
    if (!piece) return;

    // If it's not current player's turn, ignore unless capturing (but capturing is handled by cell click usually)
    // Actually, in typical chess UI, clicking an enemy piece might mean capture if a piece is already selected.
    // Here we'll simplify: 
    // 1. If current turn piece clicked -> Select it.
    // 2. If enemy piece clicked -> If selected piece can capture it -> Capture.
    
    if (piece.color === gameState.currentTurn) {
      const moves = getValidMoves(gameState, id);
      setGameState(prev => ({
        ...prev,
        selectedPieceId: id,
        validMoves: moves
      }));
    } else if (gameState.selectedPieceId) {
      // Try to capture
      handleCellClick(piece.position);
    }
  };

  const handleCellClick = (targetPos: Position) => {
    if (!gameState.selectedPieceId) return;

    const selectedPiece = gameState.pieces.find(p => p.id === gameState.selectedPieceId);
    if (!selectedPiece) return;

    // Check if move is in valid moves
    const isValid = gameState.validMoves.some(m => m.x === targetPos.x && m.y === targetPos.y && m.z === targetPos.z);
    
    if (isValid) {
      // Execute Move
      const newPieces = gameState.pieces
        .filter(p => !(p.position.x === targetPos.x && p.position.y === targetPos.y && p.position.z === targetPos.z)) // Remove captured
        .map(p => {
          if (p.id === gameState.selectedPieceId) {
            return { ...p, position: targetPos };
          }
          return p;
        });
      
      const nextTurn = gameState.currentTurn === 'white' ? 'black' : 'white';
      
      setGameState({
        pieces: newPieces,
        currentTurn: nextTurn,
        selectedPieceId: null,
        validMoves: [],
        winner: null, // TODO: Check win condition
        history: [...gameState.history, { from: selectedPiece.position, to: targetPos, pieceId: selectedPiece.id }]
      });
    } else {
      // Deselect if clicking invalid empty cell
      setGameState(prev => ({
        ...prev,
        selectedPieceId: null,
        validMoves: []
      }));
    }
  };

  const resetGame = () => {
    setGameState(initialGameState);
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black text-white font-sans">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `url(${generatedBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* 3D Scene */}
      <div className="absolute inset-0 z-10">
        <GameScene 
          gameState={gameState} 
          onPieceClick={handlePieceClick}
          onCellClick={handleCellClick}
        />
      </div>

      {/* HUD Interface */}
      <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <h1 className="text-4xl font-bold font-display tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
            QUANTUM CHESS 3D
          </h1>
          <p className="text-cyan-200/60 text-sm mt-1 tracking-wider font-mono uppercase">
            Tactical Command Interface // v4.0.4
          </p>
        </div>

        <Card className="pointer-events-auto bg-black/40 backdrop-blur-md border-cyan-900/50 p-4 min-w-[200px] box-glow-primary">
          <div className="flex flex-col gap-2">
            <div className="text-xs text-cyan-500 uppercase tracking-widest font-bold">Current Turn</div>
            <div className={`text-2xl font-display uppercase tracking-wider ${gameState.currentTurn === 'white' ? 'text-cyan-400 text-glow-primary' : 'text-pink-500 text-glow-secondary'}`}>
              {gameState.currentTurn}
            </div>
            
            <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-900 to-transparent my-2" />
            
            <div className="flex justify-between items-center text-xs text-gray-400 font-mono">
              <span>MOVES</span>
              <span>{gameState.history.length}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex gap-4">
        <Button 
          onClick={resetGame}
          variant="outline" 
          className="bg-black/60 border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/50 hover:text-cyan-200 backdrop-blur-sm uppercase tracking-widest font-mono text-xs h-12 px-8 box-glow-primary transition-all duration-300 hover:border-cyan-400"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset System
        </Button>
      </div>

      {/* Instructions Overlay */}
      <div className="absolute bottom-8 right-8 z-20 pointer-events-none max-w-xs text-right">
        <div className="text-[10px] text-cyan-500/50 font-mono uppercase tracking-widest mb-2">Controls</div>
        <p className="text-xs text-cyan-100/60 leading-relaxed">
          Left Click to Select/Move<br/>
          Right Click to Rotate Camera<br/>
          Scroll to Zoom
        </p>
      </div>
    </div>
  );
}
