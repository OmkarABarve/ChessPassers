
import React from 'react';

interface ScoreBoardProps {
  whiteScore: number;
  blackScore: number;
  currentPlayer: 'white' | 'black';
  gameStatus: 'playing' | 'ended';
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  whiteScore,
  blackScore,
  currentPlayer,
  gameStatus,
}) => {
  const winner = gameStatus === 'ended' ? (whiteScore > blackScore ? 'White' : 'Black') : null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Score</h2>
      
      <div className="space-y-4">
        <div className={`
          flex justify-between items-center p-3 rounded-lg transition-colors
          ${currentPlayer === 'white' && gameStatus === 'playing' ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-50'}
        `}>
          <span className="font-semibold text-gray-800">White Team</span>
          <span className="text-2xl font-bold text-gray-900">{whiteScore}</span>
        </div>
        
        <div className="text-center text-gray-500 font-medium">VS</div>
        
        <div className={`
          flex justify-between items-center p-3 rounded-lg transition-colors
          ${currentPlayer === 'black' && gameStatus === 'playing' ? 'bg-gray-200 border-2 border-gray-400' : 'bg-gray-50'}
        `}>
          <span className="font-semibold text-gray-800">Black Team</span>
          <span className="text-2xl font-bold text-gray-900">{blackScore}</span>
        </div>
      </div>

      {gameStatus === 'ended' && winner && (
        <div className="mt-6 text-center">
          <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4">
            <h3 className="text-xl font-bold text-green-800">🏆 {winner} Wins!</h3>
            <p className="text-green-700 mt-1">First to 3 goals!</p>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        First team to score 3 goals wins
      </div>
    </div>
  );
};
