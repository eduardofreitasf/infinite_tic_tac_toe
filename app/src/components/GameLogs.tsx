import React from 'react';

interface GameLogsProps {
  logs: string[];
  onClearLogs: () => void;
}

export const GameLogs: React.FC<GameLogsProps> = ({ logs, onClearLogs }) => {
  return (
    <div className="glass-panel log-panel">
      <div className="log-header">
        <span>Event Logs</span>
        <button 
          type="button" 
          className="clear-log-btn" 
          onClick={onClearLogs}
          style={{ background: 'none', border: 'none', padding: 0 }}
        >
          Clear
        </button>
      </div>
      <div className="log-list">
        {logs.length === 0 ? (
          <div className="log-item" style={{ fontStyle: 'italic' }}>
            No moves yet. Play a mark!
          </div>
        ) : (
          logs.map((log, i) => {
            let cls = '';
            if (log.startsWith('PLAY: X') || log.startsWith('FADE: X')) cls = 'highlight-x';
            else if (log.startsWith('PLAY: O') || log.startsWith('FADE: O')) cls = 'highlight-o';
            else if (log.startsWith('WIN:')) cls = 'highlight-win';
            
            return (
              <div key={i} className={`log-item ${cls}`}>
                {log}
              </div>
            );
          }).reverse()
        )}
      </div>
    </div>
  );
};
