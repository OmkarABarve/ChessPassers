
import { Piece, Position, PieceType } from '../types/game';

export const isPieceAt = (pieces: Piece[], position: Position): boolean => {
  return pieces.some(piece => 
    piece.position.row === position.row && piece.position.col === position.col
  );
};

export const findPieceAt = (pieces: Piece[], position: Position): Piece | null => {
  return pieces.find(piece => 
    piece.position.row === position.row && piece.position.col === position.col
  ) || null;
};

export const isValidMove = (from: Position, to: Position, pieces: Piece[]): boolean => {
  // Check bounds
  if (to.row < 0 || to.row > 6 || to.col < 0 || to.col > 6) return false;
  
  // Check if destination is occupied by friendly piece
  const targetPiece = findPieceAt(pieces, to);
  const movingPiece = findPieceAt(pieces, from);
  
  if (targetPiece && movingPiece && targetPiece.color === movingPiece.color) {
    return false;
  }
  
  return true;
};

export const getPossibleMoves = (piece: Piece, pieces: Piece[]): Position[] => {
  const moves: Position[] = [];
  const { row, col } = piece.position;

  switch (piece.type) {
    case 'king':
      // King moves one square in any direction
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const newPos = { row: row + dr, col: col + dc };
          if (isValidMove(piece.position, newPos, pieces)) {
            moves.push(newPos);
          }
        }
      }
      break;

    case 'queen':
      // Queen moves like rook + bishop
      moves.push(...getRookMoves(piece, pieces));
      moves.push(...getBishopMoves(piece, pieces));
      break;

    case 'rook':
      moves.push(...getRookMoves(piece, pieces));
      break;

    case 'bishop':
      moves.push(...getBishopMoves(piece, pieces));
      break;

    case 'knight':
      // Knight moves in L-shape
      const knightMoves = [
        { row: row + 2, col: col + 1 },
        { row: row + 2, col: col - 1 },
        { row: row - 2, col: col + 1 },
        { row: row - 2, col: col - 1 },
        { row: row + 1, col: col + 2 },
        { row: row + 1, col: col - 2 },
        { row: row - 1, col: col + 2 },
        { row: row - 1, col: col - 2 },
      ];
      
      knightMoves.forEach(move => {
        if (isValidMove(piece.position, move, pieces)) {
          moves.push(move);
        }
      });
      break;
  }

  // Add goal positions for ball passing
  if (piece.color === 'white') {
    // Can score on black's goal (row 7, cols 2,3,4)
    [2, 3, 4].forEach(goalCol => {
      moves.push({ row: 7, col: goalCol });
    });
  } else {
    // Can score on white's goal (row -1, cols 2,3,4)
    [2, 3, 4].forEach(goalCol => {
      moves.push({ row: -1, col: goalCol });
    });
  }

  return moves;
};

const getRookMoves = (piece: Piece, pieces: Piece[]): Position[] => {
  const moves: Position[] = [];
  const { row, col } = piece.position;
  
  // Horizontal and vertical directions
  const directions = [
    { dr: 0, dc: 1 },   // right
    { dr: 0, dc: -1 },  // left
    { dr: 1, dc: 0 },   // down
    { dr: -1, dc: 0 },  // up
  ];

  directions.forEach(({ dr, dc }) => {
    for (let i = 1; i < 7; i++) {
      const newPos = { row: row + dr * i, col: col + dc * i };
      
      if (newPos.row < 0 || newPos.row > 6 || newPos.col < 0 || newPos.col > 6) break;
      
      const pieceAtPos = findPieceAt(pieces, newPos);
      if (pieceAtPos) {
        if (pieceAtPos.color !== piece.color) {
          moves.push(newPos); // Can capture
        }
        break; // Can't move further
      }
      
      moves.push(newPos);
    }
  });

  return moves;
};

const getBishopMoves = (piece: Piece, pieces: Piece[]): Position[] => {
  const moves: Position[] = [];
  const { row, col } = piece.position;
  
  // Diagonal directions
  const directions = [
    { dr: 1, dc: 1 },   // down-right
    { dr: 1, dc: -1 },  // down-left
    { dr: -1, dc: 1 },  // up-right
    { dr: -1, dc: -1 }, // up-left
  ];

  directions.forEach(({ dr, dc }) => {
    for (let i = 1; i < 7; i++) {
      const newPos = { row: row + dr * i, col: col + dc * i };
      
      if (newPos.row < 0 || newPos.row > 6 || newPos.col < 0 || newPos.col > 6) break;
      
      const pieceAtPos = findPieceAt(pieces, newPos);
      if (pieceAtPos) {
        if (pieceAtPos.color !== piece.color) {
          moves.push(newPos); // Can capture
        }
        break; // Can't move further
      }
      
      moves.push(newPos);
    }
  });

  return moves;
};
