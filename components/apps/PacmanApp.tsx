
import React, { useEffect, useRef, useState, useCallback } from 'react';

const TILE_SIZE = 16;
const MAZE_WIDTH = 28;
const MAZE_HEIGHT = 31;

// Configuración de velocidades balanceadas
const PACMAN_SPEED = 2.1;
const GHOST_SPEED_NORMAL = 1.6; 
const GHOST_SPEED_TUNNEL = 0.9; 
const GHOST_SPEED_FRIGHTENED = 0.8; 
const GHOST_SPEED_EATEN = 5.0;

type Direction = { x: number, y: number, angle: number, name: string };
const DIRS: Record<string, Direction> = {
  UP: { x: 0, y: -1, angle: 1.5 * Math.PI, name: 'UP' },
  DOWN: { x: 0, y: 1, angle: 0.5 * Math.PI, name: 'DOWN' },
  LEFT: { x: -1, y: 0, angle: Math.PI, name: 'LEFT' },
  RIGHT: { x: 1, y: 0, angle: 0, name: 'RIGHT' },
  NONE: { x: 0, y: 0, angle: 0, name: 'NONE' }
};

type GhostType = 'BLINKY' | 'PINKY' | 'INKY' | 'CLYDE';
type GhostMode = 'CHASE' | 'SCATTER' | 'FRIGHTENED' | 'EATEN';
type HouseState = 'WAITING' | 'EXITING' | 'OUTSIDE';

interface Ghost {
  type: GhostType;
  x: number;
  y: number;
  dir: Direction;
  color: string;
  mode: GhostMode;
  houseState: HouseState;
  releaseTime: number; 
  scatterTarget: { x: number, y: number };
  lastTile: { x: number, y: number };
  bounceY: number;
  bounceDir: number;
}

const MAZE_LAYOUT = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
  [0,3,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,3,0],
  [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0],
  [0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0],
  [0,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,1,1,0],
  [0,0,0,0,0,0,1,0,0,0,0,0,2,0,0,2,0,0,0,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,0,0,0,0,0,2,0,0,2,0,0,0,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,0,0,2,2,2,2,2,2,2,2,2,2,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,0,0,2,0,0,0,4,4,0,0,0,2,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,0,0,2,0,2,2,2,2,2,2,0,2,0,0,1,0,0,0,0,0,0],
  [2,2,2,2,2,2,1,2,2,2,0,2,2,2,2,2,2,0,2,2,2,1,2,2,2,2,2,2],
  [0,0,0,0,0,0,1,0,0,2,0,2,2,2,2,2,2,0,2,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,0,0,2,0,0,0,0,0,0,0,0,2,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,0,0,2,2,2,2,2,2,2,2,2,2,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
  [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
  [0,3,1,1,0,0,1,1,1,1,1,1,1,2,2,1,1,1,1,1,1,1,0,0,1,1,3,0],
  [0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0],
  [0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0],
  [0,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,1,1,0],
  [0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0],
  [0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

const PacmanApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const pacmanRef = useRef({ 
    x: 13.5 * TILE_SIZE, 
    y: 23.5 * TILE_SIZE, 
    dir: DIRS.LEFT, 
    nextDir: DIRS.LEFT,
    visualAngle: DIRS.LEFT.angle,
    mouth: 0, 
    mouthOpen: true 
  });
  
  const ghostsRef = useRef<Ghost[]>([]);
  const globalModeTimerRef = useRef(0);
  const powerModeTimerRef = useRef(0);
  const mazeRef = useRef(MAZE_LAYOUT.map(row => [...row]));
  const requestRef = useRef<number>(0);

  const canMoveTo = (tileX: number, tileY: number, ghost?: Ghost) => {
    if (tileY === 14 && (tileX < 0 || tileX >= MAZE_WIDTH)) return true;
    if (tileX < 0 || tileX >= MAZE_WIDTH || tileY < 0 || tileY >= MAZE_HEIGHT) return false;
    const tile = MAZE_LAYOUT[tileY][tileX];
    if (tile === 4) {
      if (!ghost) return false;
      return ghost.houseState === 'EXITING' || ghost.mode === 'EATEN';
    }
    return tile !== 0;
  };

  const getShortestDistance = (x1: number, y1: number, x2: number, y2: number) => {
    let dx = Math.abs(x1 - x2);
    if (dx > MAZE_WIDTH / 2) dx = MAZE_WIDTH - dx;
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(y1 - y2, 2));
  };

  const update = useCallback((time: number) => {
    const pac = pacmanRef.current;
    globalModeTimerRef.current++;

    if (powerModeTimerRef.current > 0) {
      powerModeTimerRef.current--;
      if (powerModeTimerRef.current === 0) {
        ghostsRef.current.forEach(g => { if (g.mode === 'FRIGHTENED') g.mode = 'CHASE'; });
      }
    }

    // PACMAN
    const curX = Math.floor(pac.x / TILE_SIZE);
    const curY = Math.floor(pac.y / TILE_SIZE);
    const centerX = (curX + 0.5) * TILE_SIZE;
    const centerY = (curY + 0.5) * TILE_SIZE;

    if (pac.nextDir.x === -pac.dir.x && pac.nextDir.y === -pac.dir.y && pac.nextDir !== DIRS.NONE) {
      pac.dir = pac.nextDir;
      pac.visualAngle = pac.dir.angle;
    }

    const dToC = Math.sqrt(Math.pow(pac.x - centerX, 2) + Math.pow(pac.y - centerY, 2));
    if (dToC <= PACMAN_SPEED) {
      if (pac.nextDir !== pac.dir && canMoveTo(curX + pac.nextDir.x, curY + pac.nextDir.y)) {
        pac.x = centerX; pac.y = centerY;
        pac.dir = pac.nextDir;
        pac.visualAngle = pac.dir.angle;
      } else if (!canMoveTo(curX + pac.dir.x, curY + pac.dir.y)) {
        pac.x = centerX; pac.y = centerY;
        pac.dir = DIRS.NONE;
      }
    }

    pac.x += pac.dir.x * PACMAN_SPEED;
    pac.y += pac.dir.y * PACMAN_SPEED;
    
    if (pac.x < -TILE_SIZE/2) pac.x = (MAZE_WIDTH - 0.5) * TILE_SIZE;
    if (pac.x > (MAZE_WIDTH - 0.5) * TILE_SIZE) pac.x = -TILE_SIZE/2;

    if (mazeRef.current[curY]?.[curX] === 1) {
      mazeRef.current[curY][curX] = 2;
      setScore(s => s + 10);
    } else if (mazeRef.current[curY]?.[curX] === 3) {
      mazeRef.current[curY][curX] = 2;
      setScore(s => s + 50);
      powerModeTimerRef.current = 480;
      ghostsRef.current.forEach(g => { 
        if (g.mode !== 'EATEN') {
          g.mode = 'FRIGHTENED'; 
          if (g.houseState === 'OUTSIDE') {
            g.dir = { x: -g.dir.x, y: -g.dir.y, angle: g.dir.angle + Math.PI, name: 'FLEERUN' };
          }
        }
      });
    }

    // GHOSTS
    ghostsRef.current.forEach(g => {
      const inTunnel = Math.floor(g.y / TILE_SIZE) === 14 && (Math.floor(g.x / TILE_SIZE) < 6 || Math.floor(g.x / TILE_SIZE) > 21);
      let gSpeed = g.mode === 'FRIGHTENED' ? GHOST_SPEED_FRIGHTENED : (g.mode === 'EATEN' ? GHOST_SPEED_EATEN : GHOST_SPEED_NORMAL);
      if (inTunnel && g.mode !== 'EATEN') gSpeed = GHOST_SPEED_TUNNEL;

      if (g.houseState === 'WAITING') {
        g.y += 0.5 * g.bounceDir;
        if (g.y > 15 * TILE_SIZE || g.y < 14 * TILE_SIZE) g.bounceDir *= -1;
        if (globalModeTimerRef.current > g.releaseTime) g.houseState = 'EXITING';
      } else if (g.houseState === 'EXITING') {
        const targetX = 13.5 * TILE_SIZE;
        const targetGateY = 11.5 * TILE_SIZE;
        const exitSpeed = 2.0;

        if (Math.abs(g.x - targetX) > 1) {
          g.x += (g.x < targetX ? exitSpeed : -exitSpeed);
        } else {
          g.x = targetX;
          g.y -= exitSpeed;
          g.dir = DIRS.UP;
          if (g.y <= targetGateY) {
            g.y = targetGateY;
            g.houseState = 'OUTSIDE';
            g.dir = DIRS.LEFT;
          }
        }
      } else {
        const gx = Math.floor(g.x / TILE_SIZE);
        const gy = Math.floor(g.y / TILE_SIZE);
        const cx = (gx + 0.5) * TILE_SIZE;
        const cy = (gy + 0.5) * TILE_SIZE;
        const dToGC = Math.sqrt(Math.pow(g.x - cx, 2) + Math.pow(g.y - cy, 2));

        if (dToGC <= gSpeed && (g.lastTile.x !== gx || g.lastTile.y !== gy)) {
          g.x = cx; g.y = cy;
          g.lastTile = { x: gx, y: gy };

          if (g.mode === 'EATEN' && gx === 13 && gy === 11) {
            g.mode = 'CHASE'; g.houseState = 'EXITING'; return;
          }

          const possible = [DIRS.UP, DIRS.LEFT, DIRS.DOWN, DIRS.RIGHT].filter(d => {
            if (d.x === -g.dir.x && d.y === -g.dir.y) return false;
            return canMoveTo(gx + d.x, gy + d.y, g);
          });

          if (possible.length > 0) {
            if (g.mode === 'FRIGHTENED') {
              let best = possible[0];
              let maxDist = -1;
              possible.forEach(d => {
                const dist = getShortestDistance(gx + d.x, gy + d.y, curX, curY);
                if (dist > maxDist) { maxDist = dist; best = d; }
              });
              g.dir = best;
            } else {
              let target = g.scatterTarget;
              const cycleTime = globalModeTimerRef.current % 1620;
              const currentGlobalMode = cycleTime < 420 ? 'SCATTER' : 'CHASE';

              if (g.mode === 'CHASE' || currentGlobalMode === 'CHASE') {
                const px = Math.floor(pac.x / TILE_SIZE);
                const py = Math.floor(pac.y / TILE_SIZE);
                switch(g.type) {
                  case 'BLINKY': target = { x: px, y: py }; break;
                  case 'PINKY': target = { x: px + pac.dir.x * 4, y: py + pac.dir.y * 4 }; break;
                  case 'INKY': {
                    const blinky = ghostsRef.current.find(h => h.type === 'BLINKY')!;
                    const bx = Math.floor(blinky.x / TILE_SIZE);
                    const by = Math.floor(blinky.y / TILE_SIZE);
                    const tx = px + pac.dir.x * 2;
                    const ty = py + pac.dir.y * 2;
                    target = { x: tx + (tx - bx), y: ty + (ty - by) };
                    break;
                  }
                  case 'CLYDE': {
                    const dist = getShortestDistance(gx, gy, px, py);
                    target = dist > 8 ? { x: px, y: py } : g.scatterTarget;
                    break;
                  }
                }
              }
              if (g.mode === 'EATEN') target = { x: 13, y: 11 };

              let best = possible[0];
              let minDist = Infinity;
              possible.forEach(d => {
                const dist = getShortestDistance(gx + d.x, gy + d.y, target.x, target.y);
                if (dist < minDist) { minDist = dist; best = d; }
              });
              g.dir = best;
            }
          } else {
            g.dir = { x: -g.dir.x, y: -g.dir.y, angle: g.dir.angle + Math.PI, name: 'REV' };
          }
        }
        g.x += g.dir.x * gSpeed;
        g.y += g.dir.y * gSpeed;
        
        if (g.x < -TILE_SIZE/2) g.x = (MAZE_WIDTH - 0.5) * TILE_SIZE;
        if (g.x > (MAZE_WIDTH - 0.5) * TILE_SIZE) g.x = -TILE_SIZE/2;
      }

      if (getShortestDistance(pac.x, pac.y, g.x, g.y) < TILE_SIZE * 0.7) {
        if (g.mode === 'FRIGHTENED') {
          g.mode = 'EATEN'; setScore(s => s + 200);
        } else if (g.mode !== 'EATEN') {
          setGameOver(true);
        }
      }
    });

    if (!mazeRef.current.some(row => row.includes(1))) setWon(true);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      mazeRef.current.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell === 0) {
            ctx.strokeStyle = '#2121ff';
            ctx.lineWidth = 1;
            ctx.strokeRect(x * TILE_SIZE + 3, y * TILE_SIZE + 3, TILE_SIZE - 6, TILE_SIZE - 6);
          } else if (cell === 1) {
            ctx.fillStyle = '#ffb8ae';
            ctx.beginPath(); ctx.arc((x + 0.5) * TILE_SIZE, (y + 0.5) * TILE_SIZE, 1.5, 0, Math.PI * 2); ctx.fill();
          } else if (cell === 3) {
            ctx.fillStyle = '#ffb8ae';
            ctx.beginPath(); ctx.arc((x + 0.5) * TILE_SIZE, (y + 0.5) * TILE_SIZE, 4 + Math.sin(time/150)*1.5, 0, Math.PI * 2); ctx.fill();
          } else if (cell === 4) {
            ctx.strokeStyle = '#ffb8ff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(x * TILE_SIZE, (y + 0.5) * TILE_SIZE); ctx.lineTo((x + 1) * TILE_SIZE, (y + 0.5) * TILE_SIZE); ctx.stroke();
          }
        });
      });

      ctx.save(); ctx.translate(pac.x, pac.y); ctx.rotate(pac.visualAngle); ctx.fillStyle = 'yellow';
      ctx.beginPath(); ctx.moveTo(0, 0); 
      const mouthOpen = 0.2 + Math.sin(time/50) * 0.2;
      ctx.arc(0, 0, TILE_SIZE / 2.2, mouthOpen, Math.PI * 2 - mouthOpen); 
      ctx.lineTo(0, 0); ctx.fill(); ctx.restore();

      ghostsRef.current.forEach(g => {
        const isFrightened = g.mode === 'FRIGHTENED';
        const isEaten = g.mode === 'EATEN';
        
        if (!isEaten) {
          const isWhitePhase = powerModeTimerRef.current < 150 && Math.floor(time/120) % 2 === 0;
          ctx.fillStyle = isFrightened ? (isWhitePhase ? 'white' : '#1919ff') : g.color;
          ctx.beginPath(); ctx.arc(g.x, g.y - 2, TILE_SIZE / 2.2, Math.PI, 0);
          ctx.lineTo(g.x + TILE_SIZE / 2.2, g.y + TILE_SIZE / 2.2);
          ctx.lineTo(g.x - TILE_SIZE / 2.2, g.y + TILE_SIZE / 2.2); ctx.fill();
          
          if (isFrightened) {
            ctx.strokeStyle = 'white'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(g.x - 4, g.y + 4); ctx.lineTo(g.x - 2, g.y + 2); ctx.lineTo(g.x, g.y + 4); ctx.lineTo(g.x + 2, g.y + 2); ctx.lineTo(g.x + 4, g.y + 4); ctx.stroke();
          }
        }

        ctx.fillStyle = 'white';
        ctx.beginPath(); ctx.arc(g.x - 3, g.y - 3, 2.5, 0, Math.PI * 2); ctx.arc(g.x + 3, g.y - 3, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = isFrightened ? 'white' : 'blue';
        ctx.beginPath(); ctx.arc(g.x - 3 + g.dir.x * 1, g.y - 3 + g.dir.y * 1, 1.2, 0, Math.PI * 2);
        ctx.arc(g.x + 3 + g.dir.x * 1, g.y - 3 + g.dir.y * 1, 1.2, 0, Math.PI * 2); ctx.fill();
      });
    }

    requestRef.current = requestAnimationFrame(update);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted) return;
      switch(e.key) {
        case 'ArrowUp': pacmanRef.current.nextDir = DIRS.UP; break;
        case 'ArrowDown': pacmanRef.current.nextDir = DIRS.DOWN; break;
        case 'ArrowLeft': pacmanRef.current.nextDir = DIRS.LEFT; break;
        case 'ArrowRight': pacmanRef.current.nextDir = DIRS.RIGHT; break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted]);

  useEffect(() => {
    if (gameStarted && !won && !gameOver) requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameStarted, won, gameOver, update]);

  const startGame = () => {
    mazeRef.current = MAZE_LAYOUT.map(row => [...row]);
    pacmanRef.current = { x: 13.5 * TILE_SIZE, y: 23.5 * TILE_SIZE, dir: DIRS.LEFT, nextDir: DIRS.LEFT, visualAngle: DIRS.LEFT.angle, mouth: 0, mouthOpen: true };
    ghostsRef.current = [
      { type: 'BLINKY', x: 13.5 * TILE_SIZE, y: 11.5 * TILE_SIZE, dir: DIRS.LEFT, color: '#ff0000', mode: 'CHASE', houseState: 'OUTSIDE', releaseTime: 0, scatterTarget: { x: 25, y: -2 }, lastTile: { x: -1, y: -1 }, bounceY: 14.5 * TILE_SIZE, bounceDir: 1 },
      { type: 'PINKY', x: 13.5 * TILE_SIZE, y: 14.5 * TILE_SIZE, dir: DIRS.UP, color: '#ffb8ff', mode: 'CHASE', houseState: 'WAITING', releaseTime: 120, scatterTarget: { x: 2, y: -2 }, lastTile: { x: -1, y: -1 }, bounceY: 14.5 * TILE_SIZE, bounceDir: 1 },
      { type: 'INKY', x: 11.5 * TILE_SIZE, y: 14.5 * TILE_SIZE, dir: DIRS.UP, color: '#00ffff', mode: 'CHASE', houseState: 'WAITING', releaseTime: 480, scatterTarget: { x: 27, y: 32 }, lastTile: { x: -1, y: -1 }, bounceY: 14.5 * TILE_SIZE, bounceDir: -1 },
      { type: 'CLYDE', x: 15.5 * TILE_SIZE, y: 14.5 * TILE_SIZE, dir: DIRS.UP, color: '#ffb852', mode: 'CHASE', houseState: 'WAITING', releaseTime: 840, scatterTarget: { x: 0, y: 32 }, lastTile: { x: -1, y: -1 }, bounceY: 14.5 * TILE_SIZE, bounceDir: 1 },
    ];
    globalModeTimerRef.current = 0; setScore(0); setWon(false); setGameOver(false); setGameStarted(true);
  };

  return (
    <div className="flex flex-col h-full bg-black text-white items-center select-none font-mono overflow-hidden">
      {!gameStarted ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in duration-500 p-4">
           <h1 className="text-4xl sm:text-6xl font-black italic tracking-tighter text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] text-center">PAC-MAN</h1>
           <button onClick={startGame} className="px-10 py-3 bg-yellow-400 text-black font-black rounded-full transition-all active:scale-95 shadow-lg">START GAME</button>
        </div>
      ) : (
        <div className="flex-1 w-full h-full flex flex-col items-center p-2 sm:p-4 overflow-hidden">
           <div className="w-full max-w-[448px] flex justify-between px-2 font-black text-lg sm:text-xl italic tracking-tighter mb-2 flex-shrink-0">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest not-italic">Score</span>
                <span className="text-yellow-400">{score.toString().padStart(6, '0')}</span>
              </div>
           </div>

           <div className="flex-1 min-h-0 w-full flex items-center justify-center relative bg-black rounded overflow-hidden">
              <canvas 
                ref={canvasRef} 
                width={MAZE_WIDTH * TILE_SIZE} 
                height={MAZE_HEIGHT * TILE_SIZE} 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                className="border-2 border-blue-900/50 rounded shadow-2xl bg-black" 
              />
              
              {(won || gameOver) && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-8 z-50 animate-in fade-in zoom-in duration-300">
                    <h2 className={`text-3xl sm:text-5xl font-black ${won ? 'text-emerald-500' : 'text-rose-500'} italic mb-6 tracking-tighter uppercase text-center`}>
                      {won ? '¡VICTORIA!' : 'GAME OVER'}
                    </h2>
                    <button onClick={startGame} className="px-8 py-3 bg-white text-black font-black rounded-full transition-all active:scale-95 shadow-xl">PLAY AGAIN</button>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default PacmanApp;
