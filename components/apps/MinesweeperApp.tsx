
import React, { useState, useEffect, useCallback } from 'react';
import { Flag, Bomb, RefreshCw, Clock } from 'lucide-react';

const ROWS = 10;
const COLS = 10;
const MINES = 15;

interface Cell {
  isMine: boolean;
  revealed: boolean;
  flagged: boolean;
  neighborMines: number;
}

const MinesweeperApp: React.FC = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [timer, setTimer] = useState(0);

  const initGrid = useCallback(() => {
    const newGrid: Cell[][] = Array(ROWS).fill(null).map(() => 
      Array(COLS).fill(null).map(() => ({
        isMine: false,
        revealed: false,
        flagged: false,
        neighborMines: 0
      }))
    );

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      if (!newGrid[r][c].isMine) {
        newGrid[r][c].isMine = true;
        minesPlaced++;
      }
    }

    // Calc neighbor mines
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!newGrid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (r+dr >= 0 && r+dr < ROWS && c+dc >= 0 && c+dc < COLS) {
                if (newGrid[r+dr][c+dc].isMine) count++;
              }
            }
          }
          newGrid[r][c].neighborMines = count;
        }
      }
    }

    setGrid(newGrid);
    setGameOver(false);
    setWon(false);
    setTimer(0);
  }, []);

  useEffect(() => {
    initGrid();
  }, [initGrid]);

  useEffect(() => {
    if (!gameOver && !won && grid.length > 0) {
      const t = setInterval(() => setTimer(prev => prev + 1), 1000);
      return () => clearInterval(t);
    }
  }, [gameOver, won, grid.length]);

  const reveal = (r: number, c: number) => {
    if (gameOver || won || grid[r][c].revealed || grid[r][c].flagged) return;

    const newGrid = [...grid.map(row => [...row])];
    
    if (newGrid[r][c].isMine) {
      setGameOver(true);
      revealAllMines(newGrid);
      return;
    }

    const floodFill = (row: number, col: number) => {
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS || newGrid[row][col].revealed) return;
      newGrid[row][col].revealed = true;
      if (newGrid[row][col].neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            floodFill(row + dr, col + dc);
          }
        }
      }
    };

    floodFill(r, c);
    setGrid(newGrid);
    checkWin(newGrid);
  };

  const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    e.stopPropagation(); // Aseguramos que no suba al escritorio
    if (gameOver || won || grid[r][c].revealed) return;
    const newGrid = [...grid.map(row => [...row])];
    newGrid[r][c].flagged = !newGrid[r][c].flagged;
    setGrid(newGrid);
  };

  const revealAllMines = (newGrid: Cell[][]) => {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (newGrid[r][c].isMine) newGrid[r][c].revealed = true;
      }
    }
    setGrid(newGrid);
  };

  const checkWin = (newGrid: Cell[][]) => {
    let revealedCount = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (newGrid[r][c].revealed) revealedCount++;
      }
    }
    if (revealedCount === (ROWS * COLS - MINES)) {
      setWon(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-zinc-900 text-white p-6">
      <div className="flex items-center justify-between w-full max-w-[320px] mb-6 px-4 py-2 bg-zinc-800 rounded-lg border border-white/5">
        <div className="flex items-center gap-2 text-rose-500">
          <Bomb className="w-5 h-5" />
          <span className="font-mono text-xl">{MINES - grid.flat().filter(c => c.flagged).length}</span>
        </div>
        <button onClick={initGrid} className="p-2 bg-zinc-700 hover:bg-zinc-600 rounded transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-amber-500">
          <Clock className="w-5 h-5" />
          <span className="font-mono text-xl">{timer}</span>
        </div>
      </div>

      <div className="p-4 bg-zinc-800 rounded-xl shadow-2xl border border-white/10">
        <div 
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${COLS}, 30px)` }}
        >
          {grid.map((row, r) => row.map((cell, c) => (
            <div 
              key={`${r}-${c}`}
              onClick={() => reveal(r, c)}
              onContextMenu={(e) => toggleFlag(e, r, c)}
              className={`w-[30px] h-[30px] flex items-center justify-center text-xs font-bold rounded cursor-pointer transition-all ${
                cell.revealed 
                  ? cell.isMine ? 'bg-rose-600' : 'bg-zinc-700'
                  : 'bg-zinc-600 hover:bg-zinc-500 active:scale-95 shadow-inner'
              }`}
            >
              {cell.revealed ? (
                cell.isMine ? <Bomb className="w-4 h-4" /> : (cell.neighborMines > 0 ? cell.neighborMines : '')
              ) : (
                cell.flagged ? <Flag className="w-3 h-3 text-amber-400" /> : ''
              )}
            </div>
          )))}
        </div>
      </div>

      {(gameOver || won) && (
        <div className="mt-8 text-center animate-bounce">
          <h3 className={`text-2xl font-black ${won ? 'text-emerald-400' : 'text-rose-500'}`}>
            {won ? '🏆 YOU WON!' : '💥 BOOM! TRY AGAIN'}
          </h3>
        </div>
      )}
    </div>
  );
};

export default MinesweeperApp;
