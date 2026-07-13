import React from 'react';

interface GameSettingsProps {
  gameMode: 'pvp' | 'ai';
  playerSide: 'X' | 'O';
  aiDifficulty: 'easy' | 'medium' | 'impossible';
  onSelectMode: (mode: 'pvp' | 'ai') => void;
  onSelectPlayerSide: (side: 'X' | 'O') => void;
  onSelectDifficulty: (diff: 'easy' | 'medium' | 'impossible') => void;
  onRestartGame: () => void;
  onResetStats: () => void;
}

export const GameSettings: React.FC<GameSettingsProps> = ({
  gameMode,
  playerSide,
  aiDifficulty,
  onSelectMode,
  onSelectPlayerSide,
  onSelectDifficulty,
  onRestartGame,
  onResetStats,
}) => {
  return (
    <div className="glass-panel settings-section">
      <div className="setting-group">
        <span className="setting-label">Game Mode</span>
        <div className="button-group">
          <button 
            type="button" 
            className={`group-btn ${gameMode === 'ai' ? 'active' : ''}`}
            onClick={() => onSelectMode('ai')}
          >
            Vs Computer
          </button>
          <button 
            type="button" 
            className={`group-btn ${gameMode === 'pvp' ? 'active' : ''}`}
            onClick={() => onSelectMode('pvp')}
          >
            Vs Person
          </button>
        </div>
      </div>

      {gameMode === 'ai' && (
        <>
          <div className="setting-group">
            <span className="setting-label">Play As</span>
            <div className="button-group">
              <button 
                type="button" 
                className={`group-btn ${playerSide === 'X' ? 'active' : ''}`}
                onClick={() => onSelectPlayerSide('X')}
              >
                Player X
              </button>
              <button 
                type="button" 
                className={`group-btn ${playerSide === 'O' ? 'active' : ''}`}
                onClick={() => onSelectPlayerSide('O')}
              >
                Player O
              </button>
            </div>
          </div>

          <div className="setting-group">
            <span className="setting-label">AI Level</span>
            <div className="button-group button-group-3">
              <button 
                type="button" 
                className={`group-btn ${aiDifficulty === 'easy' ? 'active' : ''}`}
                onClick={() => onSelectDifficulty('easy')}
              >
                Easy
              </button>
              <button 
                type="button" 
                className={`group-btn ${aiDifficulty === 'medium' ? 'active' : ''}`}
                onClick={() => onSelectDifficulty('medium')}
              >
                Medium
              </button>
              <button 
                type="button" 
                className={`group-btn ${aiDifficulty === 'impossible' ? 'active' : ''}`}
                onClick={() => onSelectDifficulty('impossible')}
              >
                Unbeatable
              </button>
            </div>
          </div>
        </>
      )}
      
      <div className="controls-row">
        <button type="button" className="primary-btn" onClick={onRestartGame}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Restart Game
        </button>
      </div>

      <button 
        type="button" 
        style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} 
        onClick={onResetStats}
      >
        Reset Match Records
      </button>
    </div>
  );
};
