import { GameState, Piece, PieceColor, PieceType, Position } from './types';

const BOARD_DIMS = { x: 8, y: 4, z: 8 };

export const initialGameState: GameState = {
  pieces: initializePieces(),
  currentTurn: 'cyan',
  selectedPieceId: null,
  validMoves: [],
  winner: null,
  history: [],
};

function initializePieces(): Piece[] {
  const pieces: Piece[] = [];
  let idCounter = 0;

  const addPiece = (type: PieceType, color: PieceColor, x: number, y: number, z: number) => {
    pieces.push({
      id: `${color}-${type}-${idCounter++}`,
      type,
      color,
      position: { x, y, z },
    });
  };

  // Cyan Pieces (Bottom - Level 0 & 1)
  // Level 0: Officers (back row) - Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook
  addPiece('rook', 'cyan', 0, 0, 0);
  addPiece('knight', 'cyan', 1, 0, 0);
  addPiece('bishop', 'cyan', 2, 0, 0);
  addPiece('queen', 'cyan', 3, 0, 0);
  addPiece('king', 'cyan', 4, 0, 0);
  addPiece('bishop', 'cyan', 5, 0, 0);
  addPiece('knight', 'cyan', 6, 0, 0);
  addPiece('rook', 'cyan', 7, 0, 0);

  // Level 1: Pawns (front row - 8 pawns)
  for (let x = 0; x < 8; x++) {
    addPiece('pawn', 'cyan', x, 1, 0);
  }

  // Magenta Pieces (Top - Level 3 & 2)
  // Level 2: Pawns (front row for magenta, 8 pawns)
  for (let x = 0; x < 8; x++) {
    addPiece('pawn', 'magenta', x, 2, 7);
  }

  // Level 3: Officers (back row for magenta) - mirrored: Rook, Knight, Bishop, King, Queen, Bishop, Knight, Rook
  addPiece('rook', 'magenta', 0, 3, 7);
  addPiece('knight', 'magenta', 1, 3, 7);
  addPiece('bishop', 'magenta', 2, 3, 7);
  addPiece('king', 'magenta', 3, 3, 7);
  addPiece('queen', 'magenta', 4, 3, 7);
  addPiece('bishop', 'magenta', 5, 3, 7);
  addPiece('knight', 'magenta', 6, 3, 7);
  addPiece('rook', 'magenta', 7, 3, 7);

  // Cyan Pawns (Level 0, z=1) - from 1aB to 8aB
  for (let x = 0; x < 8; x++) {
    addPiece('pawn', 'cyan', x, 0, 1);
  }

  // Magenta Pawns (Level 3, z=6) - from 1dG to 8dG
  for (let x = 0; x < 8; x++) {
    addPiece('pawn', 'magenta', x, 3, 6);
  }

  return pieces;
}

export function isValidMove(gameState: GameState, from: Position, to: Position): boolean {
  const piece = gameState.pieces.find(p => p.position.x === from.x && p.position.y === from.y && p.position.z === from.z);
  if (!piece) return false;

  // Check bounds
  if (to.x < 0 || to.x >= BOARD_DIMS.x || to.y < 0 || to.y >= BOARD_DIMS.y || to.z < 0 || to.z >= BOARD_DIMS.z) return false;

  // Check if destination is occupied by friendly piece
  const destPiece = gameState.pieces.find(p => p.position.x === to.x && p.position.y === to.y && p.position.z === to.z);
  if (destPiece && destPiece.color === piece.color) return false;

  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  const dz = Math.abs(to.z - from.z);

  // Simplified Movement Logic for 3D
  switch (piece.type) {
    case 'pawn': {
      // Only move "forward" in Y (layers) or Z (across board)? 
      // Let's define "forward" as towards the opponent's starting layer (Y axis mainly)
      // Cyan moves Y+, Magenta moves Y-
      const direction = piece.color === 'cyan' ? 1 : -1;
      
      // Simple move: 1 step vertical (Y) or 1 step forward (Z) depending on strategy?
      // Let's make pawns move primarily in Y (vertical/layer) direction for this 3D variant
      // Or towards the opponent in Z if on same layer? 
      // Let's stick to a simpler rule: Pawns move towards opposite Y end.
      
      // Move 1 step
      if (dx === 0 && dz === 0 && (to.y - from.y === direction)) {
        return !destPiece; // Cannot capture forward
      }
      // Capture (Diagonal in Y-X or Y-Z plane)
      if ((dx === 1 || dz === 1) && (to.y - from.y === direction)) {
        // Must be diagonal 1 step
        if (dx + dz + Math.abs(to.y - from.y) === 2) { // 1 step Y + 1 step X/Z
             return !!destPiece; // Must capture
        }
      }
      return false;
    }
    case 'rook':
      // Move along any single axis
      return (dx > 0 && dy === 0 && dz === 0) || (dx === 0 && dy > 0 && dz === 0) || (dx === 0 && dy === 0 && dz > 0);
    
    case 'bishop':
      // Move along diagonals (2 axes change equal amount, 3rd is 0 OR all 3 change equal amount)
      // Face diagonals: (1,1,0), (1,0,1), (0,1,1)
      // Space diagonal: (1,1,1)
      if (dx === dy && dz === 0) return true;
      if (dx === dz && dy === 0) return true;
      if (dy === dz && dx === 0) return true;
      if (dx === dy && dy === dz) return true;
      return false;

    case 'knight':
      // (2, 1, 0) permutation
      const dists = [dx, dy, dz].sort((a, b) => a - b);
      return dists[0] === 0 && dists[1] === 1 && dists[2] === 2;

    case 'queen':
      // Rook + Bishop
      const isRook = (dx > 0 && dy === 0 && dz === 0) || (dx === 0 && dy > 0 && dz === 0) || (dx === 0 && dy === 0 && dz > 0);
      const isBishop = (dx === dy && dz === 0) || (dx === dz && dy === 0) || (dy === dz && dx === 0) || (dx === dy && dy === dz);
      return isRook || isBishop;

    case 'king':
      // 1 step in any direction (max delta is 1)
      return dx <= 1 && dy <= 1 && dz <= 1 && (dx + dy + dz > 0);
      
    default:
      return false;
  }
}

export function getValidMoves(gameState: GameState, pieceId: string): Position[] {
  const piece = gameState.pieces.find(p => p.id === pieceId);
  if (!piece) return [];

  const moves: Position[] = [];
  for (let x = 0; x < BOARD_DIMS.x; x++) {
    for (let y = 0; y < BOARD_DIMS.y; y++) {
      for (let z = 0; z < BOARD_DIMS.z; z++) {
        const target = { x, y, z };
        if (isValidMove(gameState, piece.position, target)) {
          // Need to check path collision for sliding pieces (Rook, Bishop, Queen)
          if (isPathClear(gameState, piece.position, target, piece.type)) {
             moves.push(target);
          }
        }
      }
    }
  }
  return moves;
}

function isPathClear(gameState: GameState, from: Position, to: Position, type: PieceType): boolean {
  if (type === 'knight' || type === 'king' || type === 'pawn') return true; // Jumping/Single step

  const dx = Math.sign(to.x - from.x);
  const dy = Math.sign(to.y - from.y);
  const dz = Math.sign(to.z - from.z);

  let cx = from.x + dx;
  let cy = from.y + dy;
  let cz = from.z + dz;

  while (cx !== to.x || cy !== to.y || cz !== to.z) {
    const occupied = gameState.pieces.some(p => p.position.x === cx && p.position.y === cy && p.position.z === cz);
    if (occupied) return false;
    cx += dx;
    cy += dy;
    cz += dz;
  }
  return true;
}
