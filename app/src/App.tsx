import { useState, useEffect, useRef, useMemo } from 'react';
import './App.css';

// Utilities
import { GameAudio } from './utils/gameAudio';
import { checkWin, CELL_NAMES } from './utils/gameLogic';
import type { ConfettiParticle } from './utils/gameLogic';
import { getAiMove } from './utils/ai';

// Components
import { RulesOverlay } from './components/RulesOverlay';
import { Scoreboard } from './components/Scoreboard';
import { GameBoard } from './components/GameBoard';
import { GameSettings } from './components/GameSettings';
import { GameLogs } from './components/GameLogs';
import { MatchHistory } from './components/MatchHistory';

export default function App() {
  // Game States
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [xMoves, setXMoves] = useState<number[]>([]);
  const [oMoves, setOMoves] = useState<number[]>([]);
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [playerSide, setPlayerSide] = useState<'X' | 'O'>('X');
  
  const [gameMode, setGameMode] = useState<'pvp' | 'ai'>('ai');
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'impossible'>('impossible');
  const [scores, setScores] = useState<{ x: number; o: number; draws: number }>(() => {
    const saved = localStorage.getItem('infinite_ttt_scores');
    return saved ? JSON.parse(saved) : { x: 0, o: 0, draws: 0 };
  });
  
  const [moveLog, setMoveLog] = useState<string[]>([]);
  const [rulesOpen, setRulesOpen] = useState<boolean>(false);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState<boolean>(false);
  const [mobileLogsOpen, setMobileLogsOpen] = useState<boolean>(false);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [matchHistory, setMatchHistory] = useState<{ id: number; winner: string; mode: string }[]>(() => {
    const saved = localStorage.getItem('infinite_ttt_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync History changes to localStorage
  useEffect(() => {
    localStorage.setItem('infinite_ttt_history', JSON.stringify(matchHistory));
  }, [matchHistory]);

  // Theme & Mute persistence states
  const audio = useMemo(() => new GameAudio(), []);
  const [isMuted, setIsMuted] = useState<boolean>(() => audio.getMuted());
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    return localStorage.getItem('infinite_ttt_theme') === 'light';
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const aiTimeoutRef = useRef<number | null>(null);

  // Sync Score Card changes to localStorage
  useEffect(() => {
    localStorage.setItem('infinite_ttt_scores', JSON.stringify(scores));
  }, [scores]);

  // Sync HTML Theme attributes
  useEffect(() => {
    if (isLightMode) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('infinite_ttt_theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('infinite_ttt_theme', 'dark');
    }
  }, [isLightMode]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, []);

  // Determine current win status
  const { winner, line: winningLine } = useMemo(() => checkWin(board), [board]);

  // Canvas confetti animation on winning state
  useEffect(() => {
    if (winner) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      let animationFrameId: number;
      
      const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      
      handleResize();
      window.addEventListener('resize', handleResize);
      
      const colors = ['#00f0ff', '#ff007f', '#aa3bff', '#ffffff', '#ffd700'];
      const particles: ConfettiParticle[] = [];
      
      // Instantiate from bottom left
      for (let i = 0; i < 90; i++) {
        particles.push({
          x: 0,
          y: canvas.height * 0.85,
          size: Math.random() * 8 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: Math.random() * 14 + 6,
          speedY: -Math.random() * 20 - 8,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2
        });
      }
      
      // Instantiate from bottom right
      for (let i = 0; i < 90; i++) {
        particles.push({
          x: canvas.width,
          y: canvas.height * 0.85,
          size: Math.random() * 8 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: -Math.random() * 14 - 6,
          speedY: -Math.random() * 20 - 8,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2
        });
      }
      
      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;
        
        particles.forEach(p => {
          p.x += p.speedX;
          p.y += p.speedY;
          p.speedY += 0.45; // gravity
          p.speedX *= 0.98; // drag
          p.rotation += p.rotationSpeed;
          
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
          
          if (p.y < canvas.height && p.x > -50 && p.x < canvas.width + 50) {
            active = true;
          }
        });
        
        if (active) {
          animationFrameId = requestAnimationFrame(render);
        }
      };
      
      render();
      
      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [winner]);

  // Sound triggers
  const triggerClickSound = () => audio.playClick();
  const toggleMuted = () => {
    triggerClickSound();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audio.setMuted(nextMuted);
  };

  // Handle cell clicks by player
  const handleCellClick = (index: number) => {
    if (board[index] || winner || isAiThinking) return;
    
    // In AI mode, restrict clicks if it's the AI's turn
    if (gameMode === 'ai') {
      const isPlayerTurn = (playerSide === 'X' && isXNext) || (playerSide === 'O' && !isXNext);
      if (!isPlayerTurn) return;
    }

    makeMove(index);
  };

  // The core move maker logic
  const makeMove = (index: number) => {
    const activePlayer = isXNext ? 'X' : 'O';
    const newBoard = [...board];
    const newXMoves = [...xMoves];
    const newOMoves = [...oMoves];
    const logs: string[] = [];

    // Apply Infinite rule: 4th move removes oldest mark
    if (activePlayer === 'X') {
      if (newXMoves.length === 3) {
        const oldestIndex = newXMoves.shift()!;
        newBoard[oldestIndex] = null;
        logs.push(`FADE: X's oldest mark at ${CELL_NAMES[oldestIndex]} faded.`);
        audio.playFade();
      }
      newXMoves.push(index);
      newBoard[index] = 'X';
      setXMoves(newXMoves);
      audio.playPlace();
    } else {
      if (newOMoves.length === 3) {
        const oldestIndex = newOMoves.shift()!;
        newBoard[oldestIndex] = null;
        logs.push(`FADE: O's oldest mark at ${CELL_NAMES[oldestIndex]} faded.`);
        audio.playFade();
      }
      newOMoves.push(index);
      newBoard[index] = 'O';
      setOMoves(newOMoves);
      audio.playPlace();
    }

    logs.push(`PLAY: ${activePlayer} placed at ${CELL_NAMES[index]}.`);
    setBoard(newBoard);
    setMoveLog(prev => [...prev, ...logs]);

    // Check Win
    const nextWin = checkWin(newBoard);
    if (nextWin.winner) {
      setMoveLog(prev => [...prev, `WIN: Player ${nextWin.winner} won the game!`]);
      audio.playWin();
      setScores(prev => ({
        ...prev,
        x: nextWin.winner === 'X' ? prev.x + 1 : prev.x,
        o: nextWin.winner === 'O' ? prev.o + 1 : prev.o
      }));
      setMatchHistory(prev => [
        ...prev,
        {
          id: prev.length + 1,
          winner: nextWin.winner!,
          mode: gameMode === 'ai' ? `vs CPU (${aiDifficulty})` : 'Vs Person'
        }
      ]);
    } else {
      // Toggle turns
      setIsXNext(!isXNext);
    }
  };

  // AI turn trigger
  useEffect(() => {
    const isAiTurn = gameMode === 'ai' && !winner && !isAiThinking && (
      (playerSide === 'X' && !isXNext) ||
      (playerSide === 'O' && isXNext)
    );

    if (isAiTurn) {
      setIsAiThinking(true);
      
      const delay = Math.random() * 300 + 400; // Natural delay 400ms-700ms
      aiTimeoutRef.current = window.setTimeout(() => {
        const bestMoveIndex = getAiMove(board, xMoves, oMoves, aiDifficulty, playerSide);
        makeMove(bestMoveIndex);
        setIsAiThinking(false);
      }, delay);
    }
  }, [isXNext, gameMode, winner, playerSide, board, xMoves, oMoves, aiDifficulty]);

  // Restart, mode, difficulty, and stats handlers
  const restartGame = () => {
    triggerClickSound();
    setBoard(Array(9).fill(null));
    setXMoves([]);
    setOMoves([]);
    setIsXNext(true);
    setMoveLog(prev => [...prev, '--- MATCH RESTARTED ---']);
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    setIsAiThinking(false);
  };

  const resetStats = () => {
    triggerClickSound();
    const cleanScores = { x: 0, o: 0, draws: 0 };
    setScores(cleanScores);
    setMatchHistory([]);
    localStorage.setItem('infinite_ttt_scores', JSON.stringify(cleanScores));
    localStorage.setItem('infinite_ttt_history', JSON.stringify([]));
    setMoveLog(prev => [...prev, '--- SCORES & HISTORY RESET ---']);
  };

  const selectMode = (mode: 'pvp' | 'ai') => {
    triggerClickSound();
    setGameMode(mode);
    setBoard(Array(9).fill(null));
    setXMoves([]);
    setOMoves([]);
    setIsXNext(true);
    setMoveLog(prev => [...prev, `--- MODE CHANGED TO ${mode.toUpperCase()} ---`]);
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    setIsAiThinking(false);
  };

  const selectPlayerSide = (side: 'X' | 'O') => {
    triggerClickSound();
    setPlayerSide(side);
    setBoard(Array(9).fill(null));
    setXMoves([]);
    setOMoves([]);
    setIsXNext(true);
    setMoveLog(prev => [...prev, `--- PLAYER SIDE CHANGED TO ${side} ---`]);
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    setIsAiThinking(false);
  };

  const selectDifficulty = (diff: 'easy' | 'medium' | 'impossible') => {
    triggerClickSound();
    setAiDifficulty(diff);
    setBoard(Array(9).fill(null));
    setXMoves([]);
    setOMoves([]);
    setIsXNext(true);
    setMoveLog(prev => [...prev, `--- AI LEVEL CHANGED TO ${diff.toUpperCase()} ---`]);
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    setIsAiThinking(false);
  };

  return (
    <>
      <canvas ref={canvasRef} className="confetti-canvas" />
      
      <header className="header">
        <div className="logo-container ">
          <svg className="logo-icon" viewBox="0 0 100 100" width="36" height="36" aria-hidden="true">
            <rect x="10" y="10" width="80" height="80" rx="15" fill="rgba(255, 255, 255, 0.03)" stroke="var(--accent)" strokeWidth="3" />
            <line x1="36" y1="20" x2="36" y2="80" stroke="var(--panel-border)" strokeWidth="3" />
            <line x1="64" y1="20" x2="64" y2="80" stroke="var(--panel-border)" strokeWidth="3" />
            <line x1="20" y1="36" x2="80" y2="36" stroke="var(--panel-border)" strokeWidth="3" />
            <line x1="20" y1="64" x2="80" y2="64" stroke="var(--panel-border)" strokeWidth="3" />
            
            <circle cx="50" cy="50" r="8" fill="none" stroke="var(--color-o)" strokeWidth="3" />
            <line x1="23" y1="23" x2="33" y2="33" stroke="var(--color-x)" strokeWidth="3" />
            <line x1="33" y1="23" x2="23" y2="33" stroke="var(--color-x)" strokeWidth="3" />
          </svg>
          <h1 className="logo-title">Infinite Tic Tac Toe</h1>
        </div>
        
        <div className="theme-controls">
          {/* Help Overlay Button */}
          <button
            type="button"
            className="icon-btn"
            onClick={() => { triggerClickSound(); setRulesOpen(true); }}
            title="How to Play"
            aria-label="Show rules info overlay"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </button>

          {/* Sound Mute Toggle */}
          <button 
            type="button" 
            className="icon-btn" 
            onClick={toggleMuted}
            title={isMuted ? 'Unmute Sounds' : 'Mute Sounds'}
            aria-label="Toggle sound mute"
          >
            {isMuted ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25M9.375 9H5.625c-.621 0-1.125.504-1.125 1.125v3.75c0 .621.504 1.125 1.125 1.125h3.75m5.306-11l-5.306 5.306m5.306-5.306v16.5m0-16.5L14 3m0 0L9.375 7.625" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            )}
          </button>
          
          {/* Light/Dark Mode Switch */}
          <button 
            type="button" 
            className="icon-btn" 
            onClick={() => { triggerClickSound(); setIsLightMode(!isLightMode); }}
            title={isLightMode ? 'Dark Mode' : 'Light Mode'}
            aria-label="Toggle color theme"
          >
            {isLightMode ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m8.94-9h-2.25M4.14 12H1.89m14.94-7.06l-1.59 1.59m-9.38 9.38l-1.59 1.59M18.36 18.36l-1.59-1.59M5.64 5.64L4.05 7.23M12 9a3 3 0 100 6 3 3 0 000-6z" />
              </svg>
            )}
          </button>
        </div>
      </header>
      
      <main className="app-container">
        {/* Left Side: Game Settings & History — desktop only */}
        <div className="side-panel desktop-only">
          <GameSettings
            gameMode={gameMode}
            playerSide={playerSide}
            aiDifficulty={aiDifficulty}
            onSelectMode={selectMode}
            onSelectPlayerSide={selectPlayerSide}
            onSelectDifficulty={selectDifficulty}
            onRestartGame={restartGame}
            onResetStats={resetStats}
          />
          <MatchHistory history={matchHistory} />
        </div>
        
        {/* Right Side: Board & Game Event Logs in dynamic grid (side-by-side on desktop) */}
        <div className="game-layout-right">
          <div className="glass-panel board-card">
            <Scoreboard
              scores={scores}
              gameMode={gameMode}
              playerSide={playerSide}
              isXNext={isXNext}
              winner={winner}
            />

            <div className="board-container">
              <div className={`turn-banner ${isXNext ? 'x' : 'o'}`}>
                <span className={`turn-dot ${isXNext ? 'x' : 'o'}`} />
                {winner ? (
                  <strong>Game Over!</strong>
                ) : isAiThinking ? (
                  <span>CPU is calculating...</span>
                ) : (
                  <span>
                    Turn: <strong>{isXNext ? 'X' : 'O'}</strong> 
                    {gameMode === 'ai' && (
                      (isXNext && playerSide === 'O') || (!isXNext && playerSide === 'X')
                    ) ? ' (CPU)' : ' (You)'}
                  </span>
                )}
              </div>

              <div className="board-wrapper">
                <GameBoard
                  board={board}
                  winningLine={winningLine}
                  xMoves={xMoves}
                  oMoves={oMoves}
                  isXNext={isXNext}
                  winner={winner}
                  onCellClick={handleCellClick}
                />
              </div>
            </div>
          </div>

          <div className="mobile-hidden">
            <GameLogs
              logs={moveLog}
              onClearLogs={() => setMoveLog([])}
            />
          </div>
        </div>
      </main>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <nav className="mobile-nav" aria-label="Mobile Navigation">
        <button
          type="button"
          className="mobile-nav-btn"
          onClick={() => { setMobileSettingsOpen(true); setMobileLogsOpen(false); }}
          aria-label="Open Settings"
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Settings</span>
        </button>

        <button
          type="button"
          className="mobile-nav-btn mobile-nav-restart"
          onClick={restartGame}
          aria-label="Restart Game"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>

        <button
          type="button"
          className="mobile-nav-btn"
          onClick={() => { setMobileLogsOpen(true); setMobileSettingsOpen(false); }}
          aria-label="Open Logs"
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>Logs</span>
        </button>
      </nav>

      {/* ── Mobile Settings Drawer ── */}
      {(mobileSettingsOpen || mobileLogsOpen) && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => { setMobileSettingsOpen(false); setMobileLogsOpen(false); }}
          aria-hidden="true"
        />
      )}

      <div className={`mobile-drawer ${mobileSettingsOpen ? 'open' : ''}`} aria-hidden={!mobileSettingsOpen}>
        <div className="mobile-drawer-handle" />
        <div className="mobile-drawer-content">
          <GameSettings
            gameMode={gameMode}
            playerSide={playerSide}
            aiDifficulty={aiDifficulty}
            onSelectMode={selectMode}
            onSelectPlayerSide={selectPlayerSide}
            onSelectDifficulty={selectDifficulty}
            onRestartGame={() => { restartGame(); setMobileSettingsOpen(false); }}
            onResetStats={resetStats}
            onClose={() => setMobileSettingsOpen(false)}
          />
          <MatchHistory history={matchHistory} />
        </div>
      </div>

      <div className={`mobile-drawer ${mobileLogsOpen ? 'open' : ''}`} aria-hidden={!mobileLogsOpen}>
        <div className="mobile-drawer-handle" />
        <div className="mobile-drawer-content">
          <GameLogs
            logs={moveLog}
            onClearLogs={() => setMoveLog([])}
            onClose={() => setMobileLogsOpen(false)}
          />
        </div>
      </div>

      <footer className="footer">
        <div>
          <span>Infinite Tic Tac Toe © 2026. Refactored with React Subcomponents.</span>
        </div>
      </footer>

      {/* Rules Info Overlay */}
      <RulesOverlay
        isOpen={rulesOpen}
        onClose={() => setRulesOpen(false)}
      />
    </>
  );
}

