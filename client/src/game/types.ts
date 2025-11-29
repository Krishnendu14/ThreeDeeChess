export type Position = { x: number; y: number; z: number };
export type PieceColor = 'white' | 'black' | 'magenta' | 'cyan';
export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';

export interface Piece {
  id: string;
  type: PieceType;
  color: PieceColor;
  position: Position;
}

export interface GameState {
  pieces: Piece[];
  currentTurn: PieceColor;
  selectedPieceId: string | null;
  validMoves: Position[];
  winner: PieceColor | null;
  history: { from: Position; to: Position; pieceId: string }[];
}
