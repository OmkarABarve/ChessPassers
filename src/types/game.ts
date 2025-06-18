
export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight';
export type Color = 'white' | 'black';

export interface Position {
  row: number;
  col: number;
}

export interface Card {
  type: 'yellow' | 'red';
  turn: number;
}

export interface Piece {
  id: string;
  type: PieceType;
  color: Color;
  position: Position;
  cards: Card[];
}

export interface GameState {
  pieces: Piece[];
  ballPosition: Position;
  ballCarrier: string | null;
  currentPlayer: Color;
  selectedPiece: Piece | null;
  ballSelected: boolean;
  validMoves: Position[];
  whiteScore: number;
  blackScore: number;
  gameStatus: 'playing' | 'ended';
  lastPushedPiece: string | null;
}
