
import React, { useState, useCallback, useEffect } from 'react';
import { GameBoard } from './GameBoard';
import { ScoreBoard } from './ScoreBoard';
import { GameControls } from './GameControls';
import { PieceType, Position, GameState, Piece, Card } from '../types/game';

const INITIAL_PIECES: Piece[] = [
  // White pieces
  { id: 'w-king', type: 'king', color: 'white', position: { row: 0, col: 3 }, cards: [] },
  { id: 'w-bishop1', type: 'bishop', color: 'white', position: { row: 1, col: 2 }, cards: [] },
  { id: 'w-bishop2', type: 'bishop', color: 'white', position: { row: 1, col: 3 }, cards: [] },
  { id: 'w-bishop3', type: 'bishop', color: 'white', position: { row: 1, col: 4 }, cards: [] },
  { id: 'w-knight1', type: 'knight', color: 'white', position: { row: 2, col: 1 }, cards: [] },
  { id: 'w-knight2', type: 'knight', color: 'white', position: { row: 2, col: 5 }, cards: [] },
  { id: 'w-rook1', type: 'rook', color: 'white', position: { row: 1, col: 0 }, cards: [] },
  { id: 'w-rook2', type: 'rook', color: 'white', position: { row: 1, col: 6 }, cards: [] },
  { id: 'w-queen', type: 'queen', color: 'white', position: { row: 3, col: 3 }, cards: [] },
  
  // Black pieces
  { id: 'b-king', type: 'king', color: 'black', position: { row: 6, col: 3 }, cards: [] },
  { id: 'b-bishop1', type: 'bishop', color: 'black', position: { row: 5, col: 2 }, cards: [] },
  { id: 'b-bishop2', type: 'bishop', color: 'black', position: { row: 5, col: 3 }, cards: [] },
  { id: 'b-bishop3', type: 'bishop', color: 'black', position: { row: 5, col: 4 }, cards: [] },
  { id: 'b-knight1', type: 'knight', color: 'black', position: { row: 4, col: 1 }, cards: [] },
  { id: 'b-knight2', type: 'knight', color: 'black', position: { row: 4, col: 5 }, cards: [] },
  { id: 'b-rook1', type: 'rook', color: 'black', position: { row: 5, col: 0 }, cards: [] },
  { id: 'b-rook2', type: 'rook', color: 'black', position: { row: 5, col: 6 }, cards: [] },
  { id: 'b-queen', type: 'queen', color: 'black', position: { row: 3, col: 3 }, cards: [] },
];

const ChessFootball: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    pieces: INITIAL_PIECES,
    ballPosition: { row: 3, col: 3 }, // Start with white queen
    ballCarrier: 'w-queen',
    currentPlayer: 'white',
    selectedPiece: null,
    ballSelected: false,
    validMoves: [],
    whiteScore: 0,
    blackScore: 0,
    gameStatus: 'playing',
    lastPushedPiece: null,
  });

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      pieces: INITIAL_PIECES.map(piece => ({ ...piece, cards: [] })),
      ballPosition: { row: 3, col: 3 },
      ballCarrier: 'w-queen',
      currentPlayer: 'white',
      selectedPiece: null,
      ballSelected: false,
      validMoves: [],
      gameStatus: 'playing',
      lastPushedPiece: null,
    }));
  }, []);

  const resetToStart = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      pieces: INITIAL_PIECES.map(piece => ({ ...piece, cards: [] })),
      ballPosition: { row: 3, col: 3 },
      ballCarrier: 'w-queen',
      currentPlayer: 'white',
      selectedPiece: null,
      ballSelected: false,
      validMoves: [],
      lastPushedPiece: null,
    }));
  }, []);

  const switchTurn = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentPlayer: prev.currentPlayer === 'white' ? 'black' : 'white',
      selectedPiece: null,
      ballSelected: false,
      validMoves: [],
    }));
  }, []);

  const checkGoal = useCallback((position: Position): boolean => {
    const goalCols = [2, 3, 4]; // columns c, d, e (0-indexed)
    return (position.row === -1 || position.row === 7) && goalCols.includes(position.col);
  }, []);

  const scoreGoal = useCallback((scoringPlayer: 'white' | 'black') => {
    setGameState(prev => {
      const newWhiteScore = scoringPlayer === 'white' ? prev.whiteScore + 1 : prev.whiteScore;
      const newBlackScore = scoringPlayer === 'black' ? prev.blackScore + 1 : prev.blackScore;
      
      const gameEnded = newWhiteScore >= 3 || newBlackScore >= 3;
      
      return {
        ...prev,
        whiteScore: newWhiteScore,
        blackScore: newBlackScore,
        gameStatus: gameEnded ? 'ended' : 'playing',
      };
    });
    
    // Reset positions after goal
    setTimeout(resetToStart, 1500);
  }, [resetToStart]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Chess Football</h1>
          <p className="text-lg text-green-700">Strategic football meets chess tactics</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <GameBoard 
              gameState={gameState}
              setGameState={setGameState}
              switchTurn={switchTurn}
              checkGoal={checkGoal}
              scoreGoal={scoreGoal}
            />
          </div>
          
          <div className="space-y-4">
            <ScoreBoard 
              whiteScore={gameState.whiteScore}
              blackScore={gameState.blackScore}
              currentPlayer={gameState.currentPlayer}
              gameStatus={gameState.gameStatus}
            />
            
            <GameControls 
              onResetGame={resetGame}
              gameStatus={gameState.gameStatus}
            />
            
            {gameState.selectedPiece && (
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Selected Piece</h3>
                <p className="text-sm text-gray-600">
                  {gameState.selectedPiece.type.charAt(0).toUpperCase() + gameState.selectedPiece.type.slice(1)} 
                  ({gameState.selectedPiece.color})
                </p>
                {gameState.selectedPiece.cards.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-red-600">
                      Cards: {gameState.selectedPiece.cards.length}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessFootball;
