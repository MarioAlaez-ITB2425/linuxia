
import React, { useState, useEffect, useCallback } from 'react';
import { Hash, RefreshCw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

type Grid = number[][];

const Cyber2048App: React.FC = () => {
  const [grid, setGrid] = useState<Grid>(Array(4).fill(0).map(() => Array(4).fill(0)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const initGame = useCallback(() => {
    let newGrid = Array(4).fill(0).map(() => Array(4).fill(0));
    newGrid = addRandomTile(addRandomTile(newGrid));
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
  }, []);

  const addRandomTile = (g: Grid) => {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (g[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return g;
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newGrid = [...g.map(row => [...row])];
    newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newGrid;
  };

  const move = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameOver) return;
    let newGrid = [...grid.map(row => [...row])];
    let changed = false;
    let newScore = score;

    const rotate = (g: Grid) => g[0].map((_, i) => g.map(row => row[i]).reverse());

    if (direction === 'UP') newGrid = rotate(rotate(rotate(newGrid)));
    if (direction === 'RIGHT') newGrid = rotate(rotate(newGrid));
    if (direction === 'DOWN') newGrid = rotate(newGrid);

    // Slide and merge left
    for (let r = 0; r < 4; r++) {
      let row = newGrid[r].filter(c => c !== 0);
      for (let i = 0; i < row.length - 1; i++) {
        if (row[i] === row[i + 1]) {
          row[i] *= 2;
          newScore += row[i];
          row.splice(i + 1, 1);
          changed = true;
        }
      }
      while (row.length < 4) row.push(0);
      if (JSON.stringify(newGrid[r]) !== JSON.stringify(row)) changed = true;
      newGrid[r] = row;
    }

    if (direction === 'UP') newGrid = rotate(newGrid);
    if (direction === 'RIGHT') newGrid = rotate(rotate(newGrid));
    if (direction === 'DOWN') newGrid = rotate(rotate(rotate(newGrid)));

    if (changed) {
      newGrid = addRandomTile(newGrid);
      setGrid(newGrid);
      setScore(newScore);
      checkGameOver(newGrid);
    }
  }, [grid, score, gameOver]);

  const checkGameOver = (g: Grid) => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (g[r][c] === 0) return;
        if (r < 3 && g[r][c] === g[r + 1][c]) return;
        if (c < 3 && g[r][c] === g[r][c + 1]) return;
      }
    }
    setGameOver(true);
  };

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') move('UP');
      if (e.key === 'ArrowDown') move('DOWN');
      if (e.key === 'ArrowLeft') move('LEFT');
      if (e.key === 'ArrowRight') move('RIGHT');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [move]);

  const getTileColor = (val: number) => {
    switch (val) {
      case 2: return 'bg-zinc-800 text-zinc-400';
      case 4: return 'bg-zinc-700 text-zinc-200';
      case 8: return 'bg-blue-900 text-blue-100';
      case 16: return 'bg-blue-700 text-white';
      case 32: return 'bg-emerald-800 text-emerald-100';
      case 64: return 'bg-emerald-600 text-white';
      case 128: return 'bg-amber-800 text-amber-100';
      case 256: return 'bg-amber-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]';
      case 512: return 'bg-rose-800 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
      case 1024: return 'bg-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]';
      case 2048: return 'bg-purple-600 text-white shadow-[0_0_30px_rgba(139,92,246,0.6)]';
      default: return 'bg-zinc-900/50';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] text-white font-mono p-6 select-none overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Hash className="text-amber-500" />
          <h1 className="text-3xl font-black italic tracking-tighter">2048_MOD</h1>
        </div>
        <div className="flex gap-4">
          <div className="bg-zinc-900/80 px-6 py-2 rounded-xl border border-white/5 text-center">
            <div className="text-[10px] text-zinc-500 uppercase font-bold">Score</div>
            <div className="text-xl font-black text-amber-500">{score}</div>
          </div>
          <button onClick={initGame} className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all">
            <RefreshCw className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="grid grid-cols-4 gap-3 bg-zinc-900/40 p-3 rounded-2xl border border-white/10 relative shadow-2xl">
          {grid.map((row, r) => row.map((val, c) => (
            <div 
              key={`${r}-${c}`}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black transition-all duration-150 ${getTileColor(val)}`}
            >
              {val > 0 ? val : ''}
            </div>
          )))}

          {gameOver && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center z-10">
               <h2 className="text-3xl font-black italic text-rose-500 mb-6">GAME OVER</h2>
               <button onClick={initGame} className="px-10 py-3 bg-white text-black font-black rounded-full transition-all active:scale-95">RESTART</button>
            </div>
          )}
        </div>

        <div className="mt-12 grid grid-cols-3 gap-2 opacity-20">
           <div></div>
           <button onClick={() => move('UP')} className="p-2 border border-white/20 rounded"><ChevronUp /></button>
           <div></div>
           <button onClick={() => move('LEFT')} className="p-2 border border-white/20 rounded"><ChevronLeft /></button>
           <button onClick={() => move('DOWN')} className="p-2 border border-white/20 rounded"><ChevronDown /></button>
           <button onClick={() => move('RIGHT')} className="p-2 border border-white/20 rounded"><ChevronRight /></button>
        </div>
      </div>
      
      <div className="h-10 border-t border-white/5 flex items-center justify-center text-[9px] text-zinc-600 uppercase tracking-widest font-bold">
        Slide Tiles to Merge // Reach 2048 to Win
      </div>
    </div>
  );
};

export default Cyber2048App;
