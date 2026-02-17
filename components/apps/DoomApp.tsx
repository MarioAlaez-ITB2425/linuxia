import React, { useRef, useState, useEffect, useCallback } from 'react';

const MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 3, 0, 3, 0, 3, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 2, 2, 0, 2, 2, 0, 0, 0, 0, 3, 0, 3, 0, 3, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 4, 0, 4, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 4, 0, 0, 0, 0, 5, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 4, 0, 4, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 4, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const WALL_COLORS: Record<number, string> = {
  1: '#7f8c8d', // Gray
  2: '#c0392b', // Red
  3: '#2980b9', // Blue
  4: '#f1c40f', // Yellow
  5: '#27ae60', // Green
};

const INITIAL_PLAYER = { x: 12, y: 12, dirX: -1, dirY: 0, planeX: 0, planeY: 0.66 };

interface Entity {
  x: number;
  y: number;
  type: 'enemy' | 'item';
  health?: number;
  isDead?: boolean;
  deathTime?: number;
}

const DoomApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [player, setPlayer] = useState(INITIAL_PLAYER);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [health, setHealth] = useState(100);
  const [weapon, setWeapon] = useState<'pistol' | 'shotgun'>('pistol');
  const [shotgunAmmo, setShotgunAmmo] = useState(8);
  const [muzzleFlash, setMuzzleFlash] = useState(0); // Time remaining for flash
  const [isGameOver, setIsGameOver] = useState(false);

  const keysRef = useRef<Record<string, boolean>>({});
  const lastUpdateRef = useRef(Date.now());
  const requestRef = useRef<number>(0);

  // Initialize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.code] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const resetGame = useCallback(() => {
    setPlayer(INITIAL_PLAYER);
    setEntities([]);
    setHealth(100);
    setWeapon('pistol');
    setShotgunAmmo(8);
    setMuzzleFlash(0);
    setIsGameOver(false);
    lastUpdateRef.current = Date.now();
  }, []);

  const shoot = useCallback(() => {
    if (weapon === 'shotgun' && shotgunAmmo <= 0) return;
    if (weapon === 'shotgun') setShotgunAmmo(a => a - 1);

    setMuzzleFlash(5); // Show flash for 5 frames

    // Hitscan logic
    setEntities(prev => {
      let hitIdx = -1;
      let closestDist = 4.0; // ALCANCE DOBLADO (Antes 2.0)

      prev.forEach((ent, idx) => {
        if (ent.type !== 'enemy' || ent.isDead) return;
        
        // Simple hit box check relative to player aim
        const dx = ent.x - player.x;
        const dy = ent.y - player.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        // Angle comparison
        const dot = (dx/dist * player.dirX) + (dy/dist * player.dirY);
        if (dot > 0.98 && dist < closestDist) {
          closestDist = dist;
          hitIdx = idx;
        }
      });

      if (hitIdx !== -1) {
        const newEntities = [...prev];
        const damage = weapon === 'shotgun' ? 2 : 1;
        const ent = newEntities[hitIdx];
        if (ent.health !== undefined) {
          ent.health -= damage;
          if (ent.health <= 0) {
            ent.isDead = true;
            ent.deathTime = Date.now();
          }
        }
        return newEntities;
      }
      return prev;
    });
  }, [player, weapon, shotgunAmmo]);

  const update = useCallback(() => {
    const now = Date.now();
    const dt = (now - lastUpdateRef.current) / 1000;
    lastUpdateRef.current = now;

    if (isGameOver) return;

    // Movement
    const moveSpeed = 4.0 * dt;
    const rotSpeed = 3.0 * dt;

    setPlayer(p => {
      // Fixed: Destructure from p directly to avoid initialization issues in some TypeScript configurations
      let { x, y, dirX, dirY, planeX, planeY } = p;

      if (keysRef.current['ArrowUp'] || keysRef.current['KeyW']) {
        if (MAP[Math.floor(x + dirX * moveSpeed)][Math.floor(y)] === 0) x += dirX * moveSpeed;
        if (MAP[Math.floor(x)][Math.floor(y + dirY * moveSpeed)] === 0) y += dirY * moveSpeed;
      }
      if (keysRef.current['ArrowDown'] || keysRef.current['KeyS']) {
        if (MAP[Math.floor(x - dirX * moveSpeed)][Math.floor(y)] === 0) x -= dirX * moveSpeed;
        if (MAP[Math.floor(x)][Math.floor(y + dirY * moveSpeed)] === 0) y -= dirY * moveSpeed;
      }
      if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) {
        const oldDirX = dirX;
        dirX = dirX * Math.cos(-rotSpeed) - dirY * Math.sin(-rotSpeed);
        dirY = oldDirX * Math.sin(-rotSpeed) + dirY * Math.cos(-rotSpeed);
        const oldPlaneX = planeX;
        planeX = planeX * Math.cos(-rotSpeed) - planeY * Math.sin(-rotSpeed);
        planeY = oldPlaneX * Math.sin(-rotSpeed) + planeY * Math.cos(-rotSpeed);
      }
      if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) {
        const oldDirX = dirX;
        dirX = dirX * Math.cos(rotSpeed) - dirY * Math.sin(rotSpeed);
        dirY = oldDirX * Math.sin(rotSpeed) + dirY * Math.cos(rotSpeed);
        const oldPlaneX = planeX;
        planeX = planeX * Math.cos(rotSpeed) - planeY * Math.sin(rotSpeed);
        planeY = oldPlaneX * Math.sin(rotSpeed) + planeY * Math.cos(rotSpeed);
      }

      return { x, y, dirX, dirY, planeX, planeY };
    });

    // Weapon Swapping
    if (keysRef.current['Digit1']) setWeapon('pistol');
    if (keysRef.current['Digit2']) setWeapon('shotgun');

    // Shooting
    if (keysRef.current['Space']) {
      shoot();
      keysRef.current['Space'] = false; // Prevents continuous firing every frame
    }

    // Entity Logic
    setEntities(prev => {
      const next = prev.filter(e => !e.isDead || (Date.now() - (e.deathTime || 0) < 1000));
      
      // Spawning enemies
      if (Math.random() < 0.01 && next.filter(e => e.type === 'enemy').length < 5) {
        next.push({ x: 2 + Math.random() * 20, y: 2 + Math.random() * 20, type: 'enemy', health: 2 });
      }
      // Spawning ammo
      if (Math.random() < 0.005 && next.filter(e => e.type === 'item').length < 3) {
        next.push({ x: 2 + Math.random() * 20, y: 2 + Math.random() * 20, type: 'item' });
      }

      return next.map(ent => {
        if (ent.isDead) return ent;
        
        if (ent.type === 'enemy') {
          const dx = player.x - ent.x;
          const dy = player.y - ent.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          if (dist < 0.5) {
             setHealth(h => {
               const newH = Math.max(0, h - 1);
               if (newH === 0) setIsGameOver(true);
               return newH;
             });
          }

          const ex = ent.x + (dx/dist) * moveSpeed * 0.5;
          const ey = ent.y + (dy/dist) * moveSpeed * 0.5;
          if (MAP[Math.floor(ex)][Math.floor(ey)] === 0) {
            return { ...ent, x: ex, y: ey };
          }
        } else if (ent.type === 'item') {
          const dist = Math.sqrt((player.x - ent.x)**2 + (player.y - ent.y)**2);
          if (dist < 0.5) {
            setShotgunAmmo(a => a + 4);
            return { ...ent, isDead: true, deathTime: 0 };
          }
        }
        return ent;
      });
    });

    if (muzzleFlash > 0) setMuzzleFlash(f => f - 1);

    requestRef.current = requestAnimationFrame(update);
  }, [isGameOver, muzzleFlash, player, shoot]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [update]);

  // Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Background
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, w, h / 2);
    ctx.fillStyle = '#333';
    ctx.fillRect(0, h / 2, w, h / 2);

    const zBuffer = new Array(w).fill(0);

    // Raycasting Walls
    for (let x = 0; x < w; x++) {
      const cameraX = 2 * x / w - 1;
      const rayDirX = player.dirX + player.planeX * cameraX;
      const rayDirY = player.dirY + player.planeY * cameraX;

      let mapX = Math.floor(player.x);
      let mapY = Math.floor(player.y);

      const deltaDistX = Math.abs(1 / rayDirX);
      const deltaDistY = Math.abs(1 / rayDirY);

      let stepX, stepY, sideDistX, sideDistY;

      if (rayDirX < 0) { stepX = -1; sideDistX = (player.x - mapX) * deltaDistX; }
      else { stepX = 1; sideDistX = (mapX + 1.0 - player.x) * deltaDistX; }
      if (rayDirY < 0) { stepY = -1; sideDistY = (player.y - mapY) * deltaDistY; }
      else { stepY = 1; sideDistY = (mapY + 1.0 - player.y) * deltaDistY; }

      let hit = 0, side = 0;
      while (hit === 0) {
        if (sideDistX < sideDistY) { sideDistX += deltaDistX; mapX += stepX; side = 0; }
        else { sideDistY += deltaDistY; mapY += stepY; side = 1; }
        if (MAP[mapX][mapY] > 0) hit = MAP[mapX][mapY];
      }

      let perpWallDist;
      if (side === 0) perpWallDist = (mapX - player.x + (1 - stepX) / 2) / rayDirX;
      else perpWallDist = (mapY - player.y + (1 - stepY) / 2) / rayDirY;

      zBuffer[x] = perpWallDist;

      const lineHeight = Math.floor(h / perpWallDist);
      let drawStart = -lineHeight / 2 + h / 2;
      let drawEnd = lineHeight / 2 + h / 2;

      ctx.strokeStyle = side === 1 ? WALL_COLORS[hit] : WALL_COLORS[hit].replace('3', '1'); // Simple shading
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, drawStart);
      ctx.lineTo(x, drawEnd);
      ctx.stroke();
    }

    // Render Entities (Enemies & Items)
    const sortedEntities = entities
      .map((ent, i) => ({ ...ent, dist: (player.x - ent.x)**2 + (player.y - ent.y)**2 }))
      .sort((a, b) => b.dist - a.dist);

    sortedEntities.forEach(ent => {
      const spriteX = ent.x - player.x;
      const spriteY = ent.y - player.y;

      const invDet = 1.0 / (player.planeX * player.dirY - player.dirX * player.planeY);
      const transformX = invDet * (player.dirY * spriteX - player.dirX * spriteY);
      const transformY = invDet * (-player.planeY * spriteX + player.planeX * spriteY);

      if (transformY <= 0) return;

      const spriteScreenX = Math.floor((w / 2) * (1 + transformX / transformY));
      
      // TAMAÑO DIFERENCIADO: Los items son cajas más pequeñas y bajas
      const scaleFactor = ent.type === 'item' ? 0.35 : 1.0;
      const spriteHeight = Math.abs(Math.floor(h / transformY)) * scaleFactor;
      const spriteWidth = spriteHeight;

      if (spriteScreenX + spriteWidth / 2 < 0 || spriteScreenX - spriteWidth / 2 > w) return;

      // Color base
      const color = ent.isDead ? '#550000' : (ent.type === 'enemy' ? '#ff0000' : '#00ffcc');
      
      const drawX = spriteScreenX - spriteWidth / 2;
      // Los items "están en el suelo", así que ajustamos su posición vertical
      const yOffset = ent.type === 'item' ? (Math.abs(Math.floor(h / transformY)) * 0.3) : 0;
      const drawY = h / 2 - spriteHeight / 2 + yOffset;

      // Vertical strip clipping against Z-Buffer
      for (let stripe = Math.floor(drawX); stripe < drawX + spriteWidth; stripe++) {
        if (stripe >= 0 && stripe < w && transformY < zBuffer[stripe]) {
          ctx.fillStyle = color;
          ctx.fillRect(stripe, drawY, 1, spriteHeight);
          
          // Detalles visuales
          if (ent.type === 'enemy') {
            // Highlight cabeza o detalle del enemigo
            ctx.fillStyle = ent.isDead ? '#330000' : '#000';
            ctx.fillRect(stripe, drawY + spriteHeight * 0.1, 1, spriteHeight * 0.1);
          } else {
            // Detalle de "caja" de munición
            ctx.fillStyle = '#006666';
            ctx.fillRect(stripe, drawY + spriteHeight * 0.4, 1, 1);
          }
        }
      }
    });

  }, [player, entities]);

  return (
    <div className="flex flex-col h-full bg-black text-white font-mono overflow-hidden relative">
      <canvas 
        ref={canvasRef} 
        width={1000} 
        height={700} 
        className="w-full h-full object-cover"
      />

      {/* Muzzle Flash Overlay */}
      {muzzleFlash > 0 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
           <div className={`w-32 h-32 rounded-full bg-yellow-400 blur-2xl opacity-50 ${weapon === 'shotgun' ? 'scale-150' : ''}`} />
        </div>
      )}

      {/* Weapon View */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-64 pointer-events-none flex items-end justify-center">
        {weapon === 'pistol' ? (
          <svg viewBox="0 0 100 100" className={`w-full h-full transform ${muzzleFlash > 0 ? '-translate-y-4' : ''}`}>
            <rect x="40" y="50" width="20" height="50" fill="#333" />
            <rect x="35" y="40" width="30" height="20" fill="#222" />
          </svg>
        ) : (
          <svg viewBox="0 0 100 100" className={`w-full h-full transform ${muzzleFlash > 0 ? '-translate-y-8 rotate-3' : ''}`}>
            <rect x="35" y="40" width="30" height="60" fill="#1a1a1a" />
            <rect x="40" y="30" width="10" height="70" fill="#222" />
            <rect x="50" y="30" width="10" height="70" fill="#222" />
          </svg>
        )}
      </div>

      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-4 h-4 border-2 border-emerald-500/50 rounded-full" />
      </div>

      {/* HUD */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-zinc-900 border-t-4 border-zinc-800 flex items-center justify-around px-10">
        <div className="flex flex-col items-center">
          <span className="text-zinc-500 text-[10px] uppercase font-bold">Health</span>
          <span className={`text-4xl font-black italic ${health < 30 ? 'text-rose-600 animate-pulse' : 'text-zinc-200'}`}>{health}%</span>
        </div>
        
        <div className="w-16 h-16 bg-zinc-800 rounded flex items-center justify-center border-2 border-zinc-700">
           {/* Face approximation */}
           <div className="w-8 h-8 relative">
              <div className="absolute top-2 left-1 w-2 h-1 bg-white" />
              <div className="absolute top-2 right-1 w-2 h-1 bg-white" />
              <div className="absolute bottom-2 left-2 right-2 h-1 bg-rose-500/50" />
           </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-zinc-500 text-[10px] uppercase font-bold">Weapon</span>
          <span className="text-xl font-black text-blue-400 uppercase italic">{weapon}</span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-zinc-500 text-[10px] uppercase font-bold">Ammo</span>
          <span className="text-4xl font-black italic text-zinc-200">
            {weapon === 'pistol' ? '∞' : shotgunAmmo}
          </span>
        </div>
      </div>

      {isGameOver && (
        <div className="absolute inset-0 bg-rose-950/80 backdrop-blur-md flex flex-col items-center justify-center z-[100] animate-in fade-in duration-500">
          <h2 className="text-8xl font-black italic text-white drop-shadow-[0_0_20px_rgba(255,0,0,0.5)] mb-4">YOU DIED</h2>
          <button 
            onClick={resetGame}
            className="px-12 py-4 bg-white text-black font-black text-xl hover:bg-zinc-200 transition-all transform active:scale-95"
          >
            RESTART GAME
          </button>
        </div>
      )}

      {/* Controls Hint */}
      <div className="absolute top-6 left-6 text-[10px] text-zinc-500 bg-black/50 p-3 rounded-lg border border-white/10 uppercase tracking-widest font-bold">
        Arrows: Move/Look<br/>
        Space: Shoot<br/>
        1 / 2: Swap Weapon
      </div>
    </div>
  );
};

export default DoomApp;