import { checkWin, WINNING_COMBINATIONS } from './gameLogic';

export const getAiMove = (
  currentBoard: (string | null)[],
  currentXMoves: number[],
  currentOMoves: number[],
  aiDifficulty: 'easy' | 'medium' | 'impossible',
  playerSide: 'X' | 'O'
): number => {
  const emptyCells = currentBoard.map((c, i) => c === null ? i : -1).filter(i => i !== -1);
  const aiSymbol = playerSide === 'X' ? 'O' : 'X';
  const playerSymbol = playerSide === 'X' ? 'X' : 'O';
  const aiMovesList = aiSymbol === 'X' ? currentXMoves : currentOMoves;
  const playerMovesList = playerSymbol === 'X' ? currentXMoves : currentOMoves;

  if (aiDifficulty === 'easy') {
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }
  
  if (aiDifficulty === 'medium') {
    // 1. Try to win in this turn
    for (const idx of emptyCells) {
      const tempBoard = [...currentBoard];
      const tempAiMoves = [...aiMovesList];
      if (tempAiMoves.length === 3) {
        const oldest = tempAiMoves.shift()!;
        tempBoard[oldest] = null;
      }
      tempBoard[idx] = aiSymbol;
      if (checkWin(tempBoard).winner === aiSymbol) return idx;
    }
    
    // 2. Try to block player from winning on player's next turn
    for (const idx of emptyCells) {
      const tempBoard = [...currentBoard];
      const tempPlayerMoves = [...playerMovesList];
      if (tempPlayerMoves.length === 3) {
        const oldest = tempPlayerMoves.shift()!;
        tempBoard[oldest] = null;
      }
      tempBoard[idx] = playerSymbol;
      if (checkWin(tempBoard).winner === playerSymbol) return idx;
    }
    
    // 3. Fallback: Center first, then Corners, then random
    if (emptyCells.includes(4)) return 4;
    const corners = [0, 2, 6, 8].filter(c => emptyCells.includes(c));
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  // 4. IMPOSSIBLE (Minimax with Alpha-Beta and Move-Ages evaluation)
  let bestScore = -Infinity;
  let bestMove = emptyCells[0];

  for (const idx of emptyCells) {
    const tempBoard = [...currentBoard];
    const tempAiMoves = [...aiMovesList];
    if (tempAiMoves.length === 3) {
      const oldest = tempAiMoves.shift()!;
      tempBoard[oldest] = null;
    }
    tempBoard[idx] = aiSymbol;
    
    const nextXMoves = aiSymbol === 'X' ? [...tempAiMoves, idx] : currentXMoves;
    const nextOMoves = aiSymbol === 'O' ? [...tempAiMoves, idx] : currentOMoves;

    const score = minimax(tempBoard, nextXMoves, nextOMoves, 0, -Infinity, Infinity, false, aiSymbol, playerSymbol);
    if (score > bestScore) {
      bestScore = score;
      bestMove = idx;
    }
  }
  return bestMove;
};

const minimax = (
  tempBoard: (string | null)[],
  tempXMoves: number[],
  tempOMoves: number[],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiSymbol: string,
  playerSymbol: string
): number => {
  const winState = checkWin(tempBoard);
  if (winState.winner === aiSymbol) return 1000 - depth;
  if (winState.winner === playerSymbol) return -1000 + depth;
  
  if (depth >= 6) {
    return evaluateBoard(tempBoard, tempXMoves, tempOMoves, aiSymbol, playerSymbol);
  }

  const empty = tempBoard.map((c, i) => c === null ? i : -1).filter(i => i !== -1);
  if (empty.length === 0) return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const idx of empty) {
      const nextBoard = [...tempBoard];
      const nextOMoves = aiSymbol === 'O' ? [...tempOMoves] : tempOMoves;
      const nextXMoves = aiSymbol === 'X' ? [...tempXMoves] : tempXMoves;
      const targetMoves = aiSymbol === 'X' ? nextXMoves : nextOMoves;
      
      if (targetMoves.length === 3) {
        const oldest = targetMoves.shift()!;
        nextBoard[oldest] = null;
      }
      nextBoard[idx] = aiSymbol;
      targetMoves.push(idx);

      const score = minimax(nextBoard, nextXMoves, nextOMoves, depth + 1, alpha, beta, false, aiSymbol, playerSymbol);
      maxEval = Math.max(maxEval, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const idx of empty) {
      const nextBoard = [...tempBoard];
      const nextOMoves = playerSymbol === 'O' ? [...tempOMoves] : tempOMoves;
      const nextXMoves = playerSymbol === 'X' ? [...tempXMoves] : tempXMoves;
      const targetMoves = playerSymbol === 'X' ? nextXMoves : nextOMoves;
      
      if (targetMoves.length === 3) {
        const oldest = targetMoves.shift()!;
        nextBoard[oldest] = null;
      }
      nextBoard[idx] = playerSymbol;
      targetMoves.push(idx);

      const score = minimax(nextBoard, nextXMoves, nextOMoves, depth + 1, alpha, beta, true, aiSymbol, playerSymbol);
      minEval = Math.min(minEval, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

const evaluateBoard = (
  tempBoard: (string | null)[],
  tempXMoves: number[],
  tempOMoves: number[],
  aiSymbol: string,
  playerSymbol: string
): number => {
  let score = 0;

  const getWeight = (index: number, movesList: number[]) => {
    const pos = movesList.indexOf(index);
    if (pos === -1) return 0;
    return 3 - (movesList.length - 1 - pos);
  };

  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    const cells = [tempBoard[a], tempBoard[b], tempBoard[c]];
    const hasAi = cells.includes(aiSymbol);
    const hasPlayer = cells.includes(playerSymbol);

    if (hasAi && !hasPlayer) {
      const sum = [a, b, c].reduce((acc, idx) => acc + getWeight(idx, aiSymbol === 'X' ? tempXMoves : tempOMoves), 0);
      score += sum * 10;
    } else if (hasPlayer && !hasAi) {
      const sum = [a, b, c].reduce((acc, idx) => acc + getWeight(idx, playerSymbol === 'X' ? tempXMoves : tempOMoves), 0);
      score -= sum * 10;
    }
  }

  const center = tempBoard[4];
  if (center === aiSymbol) score += getWeight(4, aiSymbol === 'X' ? tempXMoves : tempOMoves) * 5;
  if (center === playerSymbol) score -= getWeight(4, playerSymbol === 'X' ? tempXMoves : tempOMoves) * 5;

  const corners = [0, 2, 6, 8];
  for (const corner of corners) {
    const mark = tempBoard[corner];
    if (mark === aiSymbol) score += getWeight(corner, aiSymbol === 'X' ? tempXMoves : tempOMoves) * 2;
    if (mark === playerSymbol) score -= getWeight(corner, playerSymbol === 'X' ? tempXMoves : tempOMoves) * 2;
  }

  return score;
};
