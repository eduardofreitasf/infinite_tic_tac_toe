import React from 'react';

interface MatchHistoryProps {
  history: { id: number; winner: string; mode: string }[];
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({ history }) => {
  return (
    <div className="glass-panel history-panel">
      <div className="history-header">
        <span>Match History</span>
        <span className="history-count">{history.length} Games</span>
      </div>
      <div className="history-list">
        {history.length === 0 ? (
          <div className="history-empty">No games completed yet.</div>
        ) : (
          history.map((match) => (
            <div key={match.id} className="history-item">
              <span className="history-game-num">Game #{match.id}</span>
              <span className={`history-winner ${match.winner.toLowerCase()}`}>
                {match.winner} Won
              </span>
              <span className="history-mode">{match.mode}</span>
            </div>
          )).reverse()
        )}
      </div>
    </div>
  );
};
