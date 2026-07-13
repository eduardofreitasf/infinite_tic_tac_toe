import React from 'react';

interface ScoreboardProps {
  scores: { x: number; o: number; draws: number };
  gameMode: 'pvp' | 'ai';
  playerSide: 'X' | 'O';
  isXNext: boolean;
  winner: string | null;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  scores,
  gameMode,
  playerSide,
  isXNext,
  winner,
}) => {
  return (
    <div className="scoreboard">
      <div className={`score-card player-x ${isXNext && !winner ? 'active-player' : ''}`}>
        <span className="score-label">
          {gameMode === 'ai' ? (playerSide === 'X' ? 'X (You)' : 'X (CPU)') : 'Player X'}
        </span>
        <span className="score-value">{scores.x}</span>
      </div>
      <div className="score-card">
        <span className="score-label">Draws</span>
        <span className="score-value">{scores.draws}</span>
      </div>
      <div className={`score-card player-o ${!isXNext && !winner ? 'active-player' : ''}`}>
        <span className="score-label">
          {gameMode === 'ai' ? (playerSide === 'O' ? 'O (You)' : 'O (CPU)') : 'Player O'}
        </span>
        <span className="score-value">{scores.o}</span>
      </div>
    </div>
  );
};
