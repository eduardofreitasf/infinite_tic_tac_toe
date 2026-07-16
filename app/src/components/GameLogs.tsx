import React from 'react';

interface GameLogsProps {
  logs: string[];
  onClearLogs: () => void;
  onClose?: () => void;
}

export const GameLogs: React.FC<GameLogsProps> = ({ logs, onClearLogs, onClose }) => {
  return (
    <div className="glass-panel log-panel">
      <div className="log-header">
        <span>Event Logs</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            type="button" 
            className="clear-log-btn" 
            onClick={onClearLogs}
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            Clear
          </button>
          {onClose && (
            <button type="button" className="close-btn" onClick={onClose} aria-label="Close Logs">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
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
