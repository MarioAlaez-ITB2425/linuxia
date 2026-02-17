
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Grid3X3, Play, RefreshCw, Trophy, ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

const COLS = 10;
const ROWS = 20;

const TETROMINOS: Record<string, { shape: number[][], color: string }> = {
  I: { shape: [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], color: '#00f2ff' },
  J: { shape: [[1,0,0], [1,1,1], [0,0,0]], color: '#3b82f6' },
  L: { shape: [[0,0,1], [1,1,1], [0,0,0]], color: '#f59e0b' },
  O: { shape: [[1,1], [1,1]], color: '#fbbf24' },
  S: { shape: [[0,1,1], [1,1,0], [0,0,0]], color: '#10b981' },
  T: { shape: [[0,1,0], [1,1,1], [0,0,0]], color: '#8b5cf6' },
  Z: { shape: [[1,1,0], [0,1,1], [0,0,0]], color: '#ef4444' },
};

const TetrisApp: React.FC = () => {
  const [grid, setGrid] = useState<string[][]>(Array(ROWS).fill(null).map(() => Array(COLS).fill('')));
  const [activePiece, setActivePiece] = useState<{ x: number, y: number, type: string, shape: number[][] } | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  const checkCollision = useCallback((nx: number, ny: number, nshape: number[][], currentGrid = grid) => {
    for (let y = 0; y < nshape.length; y++) {
      for (let x = 0; x < nshape[y].length; x++) {
        if (nshape[y][x]) {
          const targetX = nx + x;
          const targetY = ny + y;
          if (targetX < 0 || targetX >= COLS || targetY >= ROWS || (targetY >= 0 && currentGrid[targetY][targetX])) {
            return true;
          }
        }
      }
    }
    return false;
  }, [grid]);

  const spawnPiece = useCallback(() => {
    const keys = Object.keys(TETROMINOS);
    const type = keys[Math.floor(Math.random() * keys.length)];
    const shape = TETROMINOS[type].shape;
    const piece = {
      type,
      shape,
      x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
      y: 0
    };
    if (checkCollision(piece.x, piece.y, piece.shape)) {
      setGameOver(true);
      setIsPaused(true);
    }
    setActivePiece(piece);
  }, [checkCollision]);

  const lockPiece = useCallback(() => {
    if (!activePiece) return;
    
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => [...row]);
      activePiece.shape.forEach((row, y) => {
        row.forEach((val, x) => {
          if (val) {
            const targetY = activePiece.y + y;
            const targetX = activePiece.x + x;
            if (targetY >= 0 && targetY < ROWS) {
              newGrid[targetY][targetX] = TETROMINOS[activePiece.type].color;
            }
          }
        });
      });

      // Clear rows
      let rowsCleared = 0;
      for (let y = ROWS - 1; y >= 0; y--) {
        if (newGrid[y].every(cell => cell !== '')) {
          newGrid.splice(y, 1);
          newGrid.unshift(Array(COLS).fill(''));
          rowsCleared++;
          y++;
        }
      }
      if (rowsCleared > 0) {
        setScore(s => s + [0, 100, 300, 500, 800][rowsCleared]);
      }
      return newGrid;
    });

    setActivePiece(null);
    spawnPiece();
  }, [activePiece, spawnPiece]);

  const move = useCallback((dx: number, dy: number) => {
    if (!activePiece || isPaused || gameOver) return;
    if (!checkCollision(activePiece.x + dx, activePiece.y + dy, activePiece.shape)) {
      setActivePiece(prev => prev ? { ...prev, x: prev.x + dx, y: prev.y + dy } : null);
    } else if (dy > 0) {
      lockPiece();
    }
  }, [activePiece, isPaused, gameOver, checkCollision, lockPiece]);

  const rotate = useCallback(() => {
    if (!activePiece || isPaused || gameOver) return;
    const flipped = activePiece.shape[0].map((_, i) => activePiece.shape.map(row => row[i]).reverse());
    if (!checkCollision(activePiece.x, activePiece.y, flipped)) {
      setActivePiece(prev => prev ? { ...prev, shape: flipped } : null);
    }
  }, [activePiece, isPaused, gameOver, checkCollision]);

  // Cálculo de la Sombra (Ghost Piece)
  const ghostY = useMemo(() => {
    if (!activePiece) return 0;
    let y = activePiece.y;
    while (!checkCollision(activePiece.x, y + 1, activePiece.shape)) {
      y++;
    }
    return y;
  }, [activePiece, grid, checkCollision]);

  // Tablero combinado final para evitar "parpadeos"
  const displayGrid = useMemo(() => {
    const combined = grid.map(row => [...row]);
    if (activePiece) {
      // Dibujar sombra primero
      activePiece.shape.forEach((row, y) => {
        row.forEach((val, x) => {
          if (val) {
            const targetY = ghostY + y;
            const targetX = activePiece.x + x;
            if (targetY >= 0 && targetY < ROWS && !combined[targetY][targetX]) {
              combined[targetY][targetX] = 'rgba(255,255,255,0.1)'; // Color de la sombra
            }
          }
        });
      });
      // Dibujar pieza activa
      activePiece.shape.forEach((row, y) => {
        row.forEach((val, x) => {
          if (val) {
            const targetY = activePiece.y + y;
            const targetX = activePiece.x + x;
            if (targetY >= 0 && targetY < ROWS) {
              combined[targetY][targetX] = TETROMINOS[activePiece.type].color;
            }
          }
        });
      });
    }
    return combined;
  }, [grid, activePiece, ghostY]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;
      if (e.key === 'ArrowLeft') move(-1, 0);
      if (e.key === 'ArrowRight') move(1, 0);
      if (e.key === 'ArrowDown') move(0, 1);
      if (e.key === 'ArrowUp') rotate();
      if (e.key === ' ') { // Hard drop
        e.preventDefault();
        if (activePiece) {
            setActivePiece(prev => prev ? { ...prev, y: ghostY } : null);
            // El siguiente tick de lockPiece se encargará de fijarla
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, move, rotate, activePiece, ghostY]);

  useEffect(() => {
    if (isPaused || gameOver) return;
    const interval = setInterval(() => move(0, 1), Math.max(100, 800 - (score / 10)));
    return () => clearInterval(interval);
  }, [isPaused, gameOver, move, score]);

  const startGame = () => {
    setGrid(Array(ROWS).fill(null).map(() => Array(COLS).fill('')));
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    spawnPiece();
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white font-mono p-4 overflow-hidden select-none">
      <div className="flex justify-between items-center mb-4 bg-zinc-900/50 p-4 rounded-xl border border-white/5 shadow-lg">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Neural Score</span>
          <span className="text-2xl font-black italic text-emerald-500">{score.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-3">
           <Trophy className="text-amber-500 w-5 h-5" />
           <button 
            onClick={() => setIsPaused(!isPaused)} 
            className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90 bg-white/5"
           >
              {isPaused ? <Play className="w-5 h-5 fill-emerald-500 text-emerald-500" /> : <RefreshCw className="w-5 h-5 text-zinc-400" />}
           </button>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center gap-8 overflow-hidden">
        {/* El tablero */}
        <div className="bg-black border-4 border-emerald-900/20 rounded-lg p-1 relative shadow-[0_0_50px_rgba(16,185,129,0.05)]">
           <div className="grid grid-cols-10 gap-[2px] bg-zinc-900/10">
              {displayGrid.map((row, y) => row.map((cell, x) => (
                <div 
                  key={`${x}-${y}`} 
                  className="w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-75 rounded-[1px]"
                  style={{ 
                    backgroundColor: cell ? cell : 'rgba(16,185,129,0.02)',
                    border: cell ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                    boxShadow: cell && cell !== 'rgba(255,255,255,0.1)' ? `0 0 8px ${cell}66` : 'none'
                  }}
                />
              )))}
           </div>

           {(gameOver || (isPaused && !activePiece)) && (
             <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-50 rounded-md">
                <h3 className="text-3xl font-black italic text-emerald-500 mb-6 tracking-tighter text-center">
                  {gameOver ? 'SYSTEM CRASH' : 'NEURAL LINK'}
                </h3>
                <button 
                  onClick={startGame}
                  className="px-10 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-black transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
                >
                  {gameOver ? 'REBOOT' : 'INITIALIZE'}
                </button>
             </div>
           )}
        </div>

        {/* Panel lateral de ayuda */}
        <div className="hidden md:flex flex-col gap-4 w-36">
           <div className="p-4 bg-zinc-900/40 rounded-2xl border border-white/5 backdrop-blur-sm">
              <span className="text-[10px] text-zinc-500 uppercase font-black mb-3 block tracking-widest">Input Map</span>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 bg-zinc-800 rounded flex items-center justify-center border border-white/10"><ArrowUp className="w-3 h-3" /></div>
                   <span className="text-[9px] text-zinc-400">Rotate</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 bg-zinc-800 rounded flex items-center justify-center border border-white/10"><ArrowDown className="w-3 h-3" /></div>
                   <span className="text-[9px] text-zinc-400">Drop</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-10 h-6 bg-zinc-800 rounded flex items-center justify-center border border-white/10 text-[8px]">SPACE</div>
                   <span className="text-[9px] text-zinc-400">Instant</span>
                </div>
              </div>
           </div>
           
           <div className="p-4 bg-zinc-900/40 rounded-2xl border border-white/5 backdrop-blur-sm">
              <span className="text-[10px] text-zinc-500 uppercase font-black mb-1 block tracking-widest">Level</span>
              <span className="text-xl font-black text-blue-500">{(Math.floor(score / 500) + 1).toString().padStart(2, '0')}</span>
           </div>
        </div>
      </div>
      
      <div className="mt-4 text-center text-[9px] text-zinc-600 uppercase tracking-[0.3em] font-black pointer-events-none opacity-40">
        Matrix Engine v4.5 // Stable Rendering Active
      </div>
    </div>
  );
};

export default TetrisApp;
