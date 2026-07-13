import React from 'react';

interface RulesOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesOverlay: React.FC<RulesOverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="glass-panel overlay-card" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-header">
          <h2>How To Play</h2>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close rules overlay">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="overlay-content">
          <p>Enjoy standard Tic Tac Toe, but with an <strong>infinite</strong> twist designed to prevent ties and keep the game moving:</p>
          
          <ol className="rules-list">
            <li>
              <strong>The 3-Mark Limit:</strong> Each player can have a maximum of <strong>3 active marks</strong> on the board at any time.
            </li>
            <li>
              <strong>Oldest Move Fade:</strong> Placing your 4th mark automatically unmounts (removes) your <strong>oldest active mark</strong>.
            </li>
            <li>
              <strong>Visual Age Indicators:</strong> Keep track of move order using symbol opacity:
              <ul className="age-sublist">
                <li><span className="badge x-badge">Newest</span> 100% full neon brightness.</li>
                <li><span className="badge middle-badge">Middle</span> 65% neon opacity.</li>
                <li><span className="badge oldest-badge">Oldest</span> 30% pulsing opacity.</li>
              </ul>
            </li>
            <li>
              <strong>Fade Warning:</strong> When it is your turn, your oldest active symbol will show a flashing <strong>Fade</strong> badge, notifying you of what is leaving next!
            </li>
          </ol>
        </div>
        
        <div className="overlay-footer">
          <button type="button" className="primary-btn" onClick={onClose}>
            Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
