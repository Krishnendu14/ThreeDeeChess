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
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null); // null = all layers, 0-3 = specific layers
  
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
      
      // Check if pawn reached promotion zone
      const movedPiece = newPieces.find(p => p.id === selectedPiece.id);
      let promotionPending = null;
      if (movedPiece && movedPiece.type === 'pawn') {
        if ((movedPiece.color === 'cyan' && movedPiece.position.z === 7) ||
            (movedPiece.color === 'magenta' && movedPiece.position.z === 0)) {
          promotionPending = movedPiece.id;
        }
      }
      
      const nextTurn = promotionPending ? gameState.currentTurn : (gameState.currentTurn === 'cyan' ? 'magenta' : 'cyan');
      
      setGameState({
        pieces: newPieces,
        currentTurn: nextTurn,
        selectedPieceId: null,
        validMoves: [],
        winner: null,
        history: [...gameState.history, { from: selectedPiece.position, to: targetPos, pieceId: selectedPiece.id }],
        promotionPending
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

  const handlePawnPromotion = (newType: 'rook' | 'knight' | 'bishop' | 'queen') => {
    setGameState(prev => {
      const newPieces = prev.pieces.map(p => {
        if (p.id === prev.promotionPending) {
          return { ...p, type: newType };
        }
        return p;
      });

      const nextTurn = prev.currentTurn === 'cyan' ? 'magenta' : 'cyan';

      return {
        ...prev,
        pieces: newPieces,
        promotionPending: null,
        currentTurn: nextTurn
      };
    });
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
          selectedLayer={selectedLayer}
        />
      </div>

      {/* HUD Interface */}
      <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <h1 className="text-4xl font-bold font-display tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
            QUANTUM CHESS 3D
          </h1>
        </div>

        <Card className="pointer-events-auto bg-black/40 backdrop-blur-md border-cyan-900/50 p-4 min-w-[200px] box-glow-primary">
          <div className="flex flex-col gap-2">
            <div className="text-xs text-cyan-500 uppercase tracking-widest font-bold">Current Turn</div>
            <div className={`text-2xl font-display uppercase tracking-wider ${gameState.currentTurn === 'cyan' ? 'text-cyan-400 text-glow-primary' : 'text-pink-500 text-glow-secondary'}`}>
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

      {/* Layer Filter Buttons */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-20 pointer-events-auto flex flex-col gap-2">
        <div className="text-xs text-cyan-500 uppercase tracking-widest font-bold mb-2">Layer View</div>
        <Button
          onClick={() => setSelectedLayer(null)}
          variant={selectedLayer === null ? "default" : "outline"}
          className={`uppercase tracking-widest font-mono text-xs h-10 px-4 backdrop-blur-sm transition-all duration-300 ${
            selectedLayer === null 
              ? 'bg-cyan-600 border-cyan-400 text-black' 
              : 'bg-black/60 border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/50'
          }`}
        >
          All
        </Button>
        {['a', 'b', 'c', 'd'].map((layer, idx) => (
          <Button
            key={layer}
            onClick={() => setSelectedLayer(idx)}
            variant={selectedLayer === idx ? "default" : "outline"}
            className={`uppercase tracking-widest font-mono text-xs h-10 px-4 backdrop-blur-sm transition-all duration-300 ${
              selectedLayer === idx 
                ? 'bg-cyan-600 border-cyan-400 text-black' 
                : 'bg-black/60 border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/50'
            }`}
          >
            {layer.toUpperCase()}
          </Button>
        ))}
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

      {/* Pawn Promotion Modal */}
      {gameState.promotionPending && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" />
          <Card className="relative bg-black/95 border-cyan-500 backdrop-blur-md p-8 max-w-sm">
            <h2 className="text-cyan-400 text-center text-xl font-bold uppercase tracking-widest mb-4">
              Pawn Promotion
            </h2>
            <p className="text-center text-sm text-gray-400 mb-6">
              Select piece type for promotion:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handlePawnPromotion('rook')}
                className="bg-cyan-600 hover:bg-cyan-500 text-white uppercase font-bold tracking-widest"
                data-testid="button-promote-rook"
              >
                Rook
              </Button>
              <Button
                onClick={() => handlePawnPromotion('knight')}
                className="bg-cyan-600 hover:bg-cyan-500 text-white uppercase font-bold tracking-widest"
                data-testid="button-promote-knight"
              >
                Knight
              </Button>
              <Button
                onClick={() => handlePawnPromotion('bishop')}
                className="bg-cyan-600 hover:bg-cyan-500 text-white uppercase font-bold tracking-widest"
                data-testid="button-promote-bishop"
              >
                Bishop
              </Button>
              <Button
                onClick={() => handlePawnPromotion('queen')}
                className="bg-cyan-600 hover:bg-cyan-500 text-white uppercase font-bold tracking-widest"
                data-testid="button-promote-queen"
              >
                Queen
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
