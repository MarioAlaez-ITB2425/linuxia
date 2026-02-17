
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Trophy, RefreshCcw } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 5, y: 5 };

const SnakeApp: React.FC = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [direction, setDirection] = useState({ x: 0, y: -1 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  // Fix: Provided initial value null to satisfy useRef expected arguments.
  const gameLoopRef = useRef<number | null>(null);

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    setSnake(prevSnake => {
      const newHead = {
        x: prevSnake[0].x + direction.x,
        y: prevSnake[0].y + direction.y,
      };

      // Check collision (Wall or Self)
      if (
        newHead.x < 0 || 
        newHead.x >= GRID_SIZE || 
        newHead.y < 0 || 
        newHead.y >= GRID_SIZE ||
        prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
      ) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => {
          const newScore = s + 10;
          if (newScore > highScore) setHighScore(newScore);
          return newScore;
        });
        setFood({
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE),
        });
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, highScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction.y === 0) setDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown': if (direction.y === 0) setDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft': if (direction.x === 0) setDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (direction.x === 0) setDirection({ x: 1, y: 0 }); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    const interval = setInterval(moveSnake, 150 - Math.min(100, score / 2));
    return () => clearInterval(interval);
  }, [moveSnake, score]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection({ x: 0, y: -1 });
    setGameOver(false);
    setScore(0);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-zinc-950 p-6">
      <div className="w-full max-w-sm mb-4 flex items-center justify-between text-zinc-300">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold opacity-50">SCORE:</span>
          <span className="text-xl font-mono text-emerald-400">{score}</span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-bold opacity-50">BEST:</span>
          <span className="text-xl font-mono text-amber-500">{highScore}</span>
        </div>
      </div>

      <div 
        className="relative bg-zinc-900 border-4 border-rose-500/30 rounded-xl overflow-hidden shadow-2xl"
        style={{ width: 400, height: 400, display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isSnake = snake.some(s => s.x === x && s.y === y);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isFood = food.x === x && food.y === y;

          return (
            <div key={i} className="relative w-full h-full border border-white/5">
              {isSnake && (
                <div className={`absolute inset-0.5 rounded-sm transition-all duration-200 ${isHead ? 'bg-emerald-400 scale-110 shadow-lg' : 'bg-emerald-600 opacity-80'}`} />
              )}
              {isFood && (
                <div className="absolute inset-1 bg-rose-500 rounded-full animate-pulse shadow-lg shadow-rose-500/50" />
              )}
            </div>
          );
        })}

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95">
            <h3 className="text-4xl font-black text-white mb-2 italic">GAME OVER</h3>
            <p className="text-zinc-400 mb-6 font-medium">¡Chocaste contra la pared del Kernel!</p>
            <button 
              onClick={resetGame}
              className="flex items-center gap-2 px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-full font-bold transition-all transform active:scale-95 shadow-lg shadow-rose-900/20"
            >
              <RefreshCcw className="w-5 h-5" /> RESTART
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 text-zinc-500 text-[10px] font-bold uppercase tracking-widest text-center">
        LAS PAREDES SON MORTALES. USA LAS FLECHAS PARA MANIOBRAR.
      </div>
    </div>
  );
};

export default SnakeApp;
