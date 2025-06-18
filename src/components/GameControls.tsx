
import React from 'react';
import { Button } from '@/components/ui/button';

interface GameControlsProps {
  onResetGame: () => void;
  gameStatus: 'playing' | 'ended';
}

export const GameControls: React.FC<GameControlsProps> = ({ onResetGame, gameStatus }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Game Controls</h3>
      
      <div className="space-y-3">
        <Button 
          onClick={onResetGame}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {gameStatus === 'ended' ? 'New Game' : 'Reset Game'}
        </Button>
      </div>

      <div className="mt-6 text-xs text-gray-600 space-y-2">
        <h4 className="font-semibold">How to Play:</h4>
        <ul className="space-y-1">
          <li>• Click piece to select/move</li>
          <li>• Click ball to pass</li>
          <li>• Push opponents by clicking them</li>
          <li>• Score in goal columns (c,d,e)</li>
          <li>• Yellow cards for unfair pushes</li>
        </ul>
      </div>
    </div>
  );
};
