
import React from 'react';
import { Position, GameState, Piece, PieceType, Card } from '../types/game';
import { getPossibleMoves, isPieceAt, isValidMove, findPieceAt } from '../utils/gameLogic';

interface GameBoardProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  switchTurn: () => void;
  checkGoal: (position: Position) => boolean;
  scoreGoal: (player: 'white' | 'black') => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  gameState, 
  setGameState, 
  switchTurn, 
  checkGoal, 
  scoreGoal 
}) => {
  const handleSquareClick = (row: number, col: number) => {
    if (gameState.gameStatus === 'ended') return;

    const clickedPosition = { row, col };
    const clickedPiece = findPieceAt(gameState.pieces, clickedPosition);
    const isBallPosition = gameState.ballPosition.row === row && gameState.ballPosition.col === col;

    // If ball is selected for passing
    if (gameState.ballSelected) {
      const ballCarrier = gameState.pieces.find(p => p.id === gameState.ballCarrier);
      if (ballCarrier && ballCarrier.color === gameState.currentPlayer) {
        const possibleMoves = getPossibleMoves(ballCarrier, gameState.pieces);
        
        if (possibleMoves.some(move => move.row === row && move.col === col)) {
          // Pass the ball
          setGameState(prev => {
            const newBallCarrier = clickedPiece?.id || null;
            return {
              ...prev,
              ballPosition: clickedPosition,
              ballCarrier: newBallCarrier,
              ballSelected: false,
              selectedPiece: null,
              validMoves: [],
            };
          });

          // Check for goal
          if (checkGoal(clickedPosition)) {
            scoreGoal(gameState.currentPlayer);
          } else {
            switchTurn();
          }
          return;
        }
      }
      
      // If clicking elsewhere while ball is selected, deselect ball
      setGameState(prev => ({
        ...prev,
        ballSelected: false,
        selectedPiece: null,
        validMoves: [],
      }));
      return;
    }

    // If clicking on ball to select it for passing
    if (isBallPosition && gameState.ballCarrier) {
      const ballCarrier = gameState.pieces.find(p => p.id === gameState.ballCarrier);
      if (ballCarrier && ballCarrier.color === gameState.currentPlayer) {
        const possibleMoves = getPossibleMoves(ballCarrier, gameState.pieces);
        setGameState(prev => ({
          ...prev,
          selectedPiece: ballCarrier,
          ballSelected: true,
          validMoves: possibleMoves,
        }));
        return;
      }
    }

    // If a piece is selected for moving
    if (gameState.selectedPiece && !gameState.ballSelected) {
      // Check if clicking on opponent piece (push)
      if (clickedPiece && clickedPiece.color !== gameState.currentPlayer) {
        if (clickedPiece.type === 'king') return; // Can't push king
        
        handlePush(gameState.selectedPiece, clickedPiece);
        return;
      }

      // Regular move
      if (gameState.validMoves.some(move => move.row === row && move.col === col)) {
        const wasBallCarrier = gameState.ballCarrier === gameState.selectedPiece.id;
        
        setGameState(prev => {
          const updatedPieces = prev.pieces.map(piece =>
            piece.id === prev.selectedPiece?.id
              ? { ...piece, position: clickedPosition }
              : piece
          );

          return {
            ...prev,
            pieces: updatedPieces,
            ballPosition: wasBallCarrier ? clickedPosition : prev.ballPosition,
            selectedPiece: null,
            validMoves: [],
          };
        });

        // Check for goal if ball moved
        if (wasBallCarrier && checkGoal(clickedPosition)) {
          scoreGoal(gameState.currentPlayer);
        } else {
          switchTurn();
        }
        return;
      }
    }

    // Select piece
    if (clickedPiece && clickedPiece.color === gameState.currentPlayer) {
      const possibleMoves = getPossibleMoves(clickedPiece, gameState.pieces);
      setGameState(prev => ({
        ...prev,
        selectedPiece: clickedPiece,
        ballSelected: false,
        validMoves: possibleMoves,
      }));
    } else {
      // Deselect
      setGameState(prev => ({
        ...prev,
        selectedPiece: null,
        ballSelected: false,
        validMoves: [],
      }));
    }
  };

  const handlePush = (pusher: Piece, pushed: Piece) => {
    // Calculate push direction
    const direction = {
      row: pushed.position.row - pusher.position.row,
      col: pushed.position.col - pusher.position.col,
    };

    // Normalize direction
    const normalizedDir = {
      row: direction.row === 0 ? 0 : direction.row / Math.abs(direction.row),
      col: direction.col === 0 ? 0 : direction.col / Math.abs(direction.col),
    };

    const pushDestination = {
      row: pushed.position.row + normalizedDir.row,
      col: pushed.position.col + normalizedDir.col,
    };

    // Check if push destination is valid
    if (pushDestination.row < 0 || pushDestination.row > 7 || 
        pushDestination.col < 0 || pushDestination.col > 7 ||
        isPieceAt(gameState.pieces, pushDestination)) {
      // Find alternative push location
      const alternatives = [
        { row: pushed.position.row + 1, col: pushed.position.col },
        { row: pushed.position.row - 1, col: pushed.position.col },
        { row: pushed.position.row, col: pushed.position.col + 1 },
        { row: pushed.position.row, col: pushed.position.col - 1 },
      ].filter(pos => 
        pos.row >= 0 && pos.row <= 7 && 
        pos.col >= 0 && pos.col <= 7 && 
        !isPieceAt(gameState.pieces, pos)
      );

      if (alternatives.length === 0) return; // Can't push
      pushDestination.row = alternatives[0].row;
      pushDestination.col = alternatives[0].col;
    }

    // Handle yellow card logic
    const wasPushedHoldingBall = gameState.ballCarrier === pushed.id;
    const isPusherHoldingBall = gameState.ballCarrier === pusher.id;

    setGameState(prev => {
      const updatedPieces = prev.pieces.map(piece => {
        if (piece.id === pushed.id) {
          return { ...piece, position: pushDestination };
        }
        if (piece.id === pusher.id && !isPusherHoldingBall) {
          // Add yellow card
          const newCards = [...piece.cards, { type: 'yellow' as Card['type'], turn: 1 }];
          if (newCards.filter(card => card.type === 'yellow').length >= 2) {
            // Red card - remove piece
            return null;
          }
          return { ...piece, cards: newCards };
        }
        return piece;
      }).filter(Boolean) as Piece[];

      return {
        ...prev,
        pieces: updatedPieces,
        ballPosition: wasPushedHoldingBall ? pushDestination : prev.ballPosition,
        ballCarrier: wasPushedHoldingBall ? pushed.id : prev.ballCarrier,
        selectedPiece: null,
        validMoves: [],
        lastPushedPiece: pushed.id,
      };
    });

    // Return ball to pushed piece if they weren't holding it
    if (!wasPushedHoldingBall && !isPusherHoldingBall) {
      setGameState(prev => ({
        ...prev,
        ballPosition: pushDestination,
        ballCarrier: pushed.id,
      }));
    }

    switchTurn();
  };

  const getPieceSymbol = (piece: Piece): string => {
    const symbols = {
      king: piece.color === 'white' ? '♔' : '♚',
      queen: piece.color === 'white' ? '♕' : '♛',
      rook: piece.color === 'white' ? '♖' : '♜',
      bishop: piece.color === 'white' ? '♗' : '♝',
      knight: piece.color === 'white' ? '♘' : '♞',
    };
    return symbols[piece.type];
  };

  const isSquareHighlighted = (row: number, col: number): boolean => {
    return gameState.validMoves.some(move => move.row === row && move.col === col);
  };

  const isGoalZone = (row: number, col: number): boolean => {
    return (row === 0 || row === 7) && [2, 3, 4].includes(col);
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <div className="grid grid-cols-8 gap-1 aspect-square max-w-2xl mx-auto">
        {Array.from({ length: 8 }, (_, row) =>
          Array.from({ length: 8 }, (_, col) => {
            const piece = findPieceAt(gameState.pieces, { row, col });
            const hasBall = gameState.ballPosition.row === row && gameState.ballPosition.col === col;
            const isSelected = gameState.selectedPiece?.position.row === row && 
                             gameState.selectedPiece?.position.col === col;
            const isHighlighted = isSquareHighlighted(row, col);
            const isGoal = isGoalZone(row, col);

            return (
              <div
                key={`${row}-${col}`}
                className={`
                  aspect-square flex items-center justify-center cursor-pointer
                  border-2 border-green-300 relative text-3xl font-bold
                  transition-all duration-200 hover:scale-105
                  ${(row + col) % 2 === 0 ? 'bg-green-50' : 'bg-green-100'}
                  ${isSelected ? 'ring-4 ring-blue-400' : ''}
                  ${isHighlighted ? 'bg-yellow-200 ring-2 ring-yellow-400' : ''}
                  ${isGoal ? 'bg-red-100 border-red-400' : ''}
                `}
                onClick={() => handleSquareClick(row, col)}
              >
                {piece && (
                  <div className="relative">
                    <span className={piece.color === 'white' ? 'text-gray-800' : 'text-gray-900'}>
                      {getPieceSymbol(piece)}
                    </span>
                    {piece.cards.length > 0 && (
                      <div className="absolute -top-1 -right-1">
                        {piece.cards.map((card, index) => (
                          <div
                            key={index}
                            className={`w-2 h-2 rounded-full ${
                              card.type === 'yellow' ? 'bg-yellow-400' : 'bg-red-500'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {hasBall && (
                  <div className={`
                    absolute cursor-pointer
                    ${piece ? 'top-1 right-1' : 'inset-0 flex items-center justify-center'}
                  `}>
                    <div className={`
                      ${piece ? 'w-4 h-4' : 'w-5 h-5'} rounded-full bg-gradient-to-br from-orange-400 to-orange-600
                      shadow-lg border-2 border-orange-800
                      ${gameState.ballSelected ? 'ring-2 ring-blue-400 animate-pulse' : ''}
                      hover:scale-110 transition-transform
                    `} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-600 space-y-2">
        <div>
          Current turn: <span className="font-semibold capitalize">{gameState.currentPlayer}</span>
        </div>
        
        <div className="flex justify-center items-center space-x-4">
          <div className="bg-gray-100 px-3 py-1 rounded-lg">
            <span className="text-xs font-medium text-gray-700">Ball Selected: </span>
            <span className={`font-bold ${gameState.ballSelected ? 'text-green-600' : 'text-red-600'}`}>
              {gameState.ballSelected ? 'YES' : 'NO'}
            </span>
          </div>
          
          {gameState.ballSelected && (
            <div className="text-blue-600 font-medium">
              ⚽ Click to pass the ball
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
