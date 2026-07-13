import React from 'react';

interface GameBoardProps {
  board: (string | null)[];
  winningLine: number[] | null;
  xMoves: number[];
  oMoves: number[];
  isXNext: boolean;
  winner: string | null;
  onCellClick: (index: number) => void;
}

const XSymbol: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`cell-symbol player-x ${className}`} viewBox="0 0 100 100" aria-hidden="true">
    <line x1="20" y1="20" x2="80" y2="80" />
    <line x1="80" y1="20" x2="20" y2="80" />
  </svg>
);

const OSymbol: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`cell-symbol player-o ${className}`} viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="30" />
  </svg>
);

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  winningLine,
  xMoves,
  oMoves,
  isXNext,
  winner,
  onCellClick,
}) => {
  const getAgeClass = (index: number, player: 'X' | 'O') => {
    const list = player === 'X' ? xMoves : oMoves;
    const pos = list.indexOf(index);
    if (pos === -1) return '';
    const age = list.length - 1 - pos;
    if (age === 0) return 'symbol-age-newest';
    if (age === 1) return 'symbol-age-middle';
    return 'symbol-age-oldest';
  };

  return (
    <div className="board">
      {Array(9).fill(null).map((_, index) => {
        const symbol = board[index];
        const isWinning = winningLine?.includes(index) || false;
        
        let ageClass = '';
        let isOldest = false;
        
        if (symbol === 'X') {
          ageClass = getAgeClass(index, 'X');
          isOldest = xMoves[0] === index && xMoves.length === 3;
        } else if (symbol === 'O') {
          ageClass = getAgeClass(index, 'O');
          isOldest = oMoves[0] === index && oMoves.length === 3;
        }
        
        const showFadeBadge = isOldest && (
          (symbol === 'X' && isXNext) ||
          (symbol === 'O' && !isXNext)
        ) && !winner;

        return (
          <button
            key={index}
            type="button"
            className={`cell ${isWinning ? 'winning-cell' : ''} ${showFadeBadge ? `next-to-fade ${symbol?.toLowerCase()}` : ''}`}
            onClick={() => onCellClick(index)}
            disabled={!!winner}
            aria-label={`Cell ${index + 1}${symbol ? `, contains ${symbol}` : ', empty'}`}
          >
            {symbol === 'X' && <XSymbol className={ageClass} />}
            {symbol === 'O' && <OSymbol className={ageClass} />}
            
            {showFadeBadge && (
              <span className="fade-warning-badge" aria-label="This mark will fade on the next turn">
                Fade
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
