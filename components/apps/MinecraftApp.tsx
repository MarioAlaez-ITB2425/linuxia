
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

type BlockType = 'grass' | 'dirt' | 'stone' | 'wood' | 'leaves' | 'brick' | 'glass' | 'diamond';

interface BlockData {
  type: BlockType;
  mesh: THREE.Mesh;
}

const BLOCK_COLORS: Record<BlockType, number> = {
  grass: 0x4ade80,
  dirt: 0x78350f,
  stone: 0x71717a,
  wood: 0x451a03,
  leaves: 0x166534,
  brick: 0x991b1b,
  glass: 0xbae6fd,
  diamond: 0x06b6d4,
};

const BLOCK_LIST: BlockType[] = ['grass', 'dirt', 'stone', 'wood', 'leaves', 'brick', 'glass', 'diamond'];
const PLAYER_HEIGHT = 1.7;
const MINING_TIME = 1000; // 1 segundo para romper

const MinecraftApp: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedBlockIdx, setSelectedBlockIdx] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  
  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<PointerLockControls | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  
  // Game Logic refs
  const blocksRef = useRef<Map<string, BlockData>>(new Map());
  const miningRef = useRef<{ id: string, mesh: THREE.Mesh, startTime: number, crackOverlay: THREE.Mesh } | null>(null);
  const moveRef = useRef({ forward: false, backward: false, left: false, right: false, jump: false });
  const velocityRef = useRef(new THREE.Vector3());

  const getPosKey = (pos: THREE.Vector3) => `${Math.round(pos.x)},${Math.round(pos.y)},${Math.round(pos.z)}`;

  const addBlock = useCallback((pos: THREE.Vector3, type: BlockType) => {
    if (!sceneRef.current) return;
    const key = getPosKey(pos);
    if (blocksRef.current.has(key)) return;

    const geometry = new THREE.BoxGeometry(1.001, 1.001, 1.001);
    const material = new THREE.MeshStandardMaterial({ 
      color: BLOCK_COLORS[type],
      transparent: type === 'glass',
      opacity: type === 'glass' ? 0.6 : 1,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(Math.round(pos.x), Math.round(pos.y), Math.round(pos.z));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { key, type };
    
    sceneRef.current.add(mesh);
    blocksRef.current.set(key, { type, mesh });
  }, []);

  const initWorld = useCallback(() => {
    // Suelo más amplio
    for (let x = -15; x <= 15; x++) {
      for (let z = -15; z <= 15; z++) {
        addBlock(new THREE.Vector3(x, 0, z), 'grass');
        addBlock(new THREE.Vector3(x, -1, z), 'dirt');
      }
    }

    // Bosque de árboles
    const treePositions = [
      new THREE.Vector3(5, 1, 5),
      new THREE.Vector3(-8, 1, -4),
      new THREE.Vector3(3, 1, -10),
      new THREE.Vector3(-12, 1, 8),
      new THREE.Vector3(10, 1, -2),
    ];

    treePositions.forEach(base => {
      for (let h = 0; h < 4; h++) addBlock(base.clone().add(new THREE.Vector3(0, h, 0)), 'wood');
      const top = base.clone().add(new THREE.Vector3(0, 4, 0));
      for (let x = -2; x <= 2; x++) {
        for (let y = 0; y <= 1; y++) {
          for (let z = -2; z <= 2; z++) {
            if (Math.abs(x) + Math.abs(z) < 4) addBlock(top.clone().add(new THREE.Vector3(x, y, z)), 'leaves');
          }
        }
      }
    });
  }, [addBlock]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 10, 50);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, PLAYER_HEIGHT, 5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new PointerLockControls(camera, renderer.domElement);
    controlsRef.current = controls;

    controls.addEventListener('lock', () => setIsLocked(true));
    controls.addEventListener('unlock', () => setIsLocked(false));

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(10, 20, 10);
    sunLight.castShadow = true;
    scene.add(sunLight);

    initWorld();

    let prevTime = performance.now();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = performance.now();
      const delta = (time - prevTime) / 1000;

      if (controls.isLocked) {
        // Fricción/Damping
        velocityRef.current.x -= velocityRef.current.x * 10.0 * delta;
        velocityRef.current.z -= velocityRef.current.z * 10.0 * delta;

        const direction = new THREE.Vector3();
        direction.z = Number(moveRef.current.forward) - Number(moveRef.current.backward);
        direction.x = Number(moveRef.current.right) - Number(moveRef.current.left);
        direction.normalize();

        // Velocidad reducida a menos de la mitad (antes 400.0)
        const acceleration = 160.0;
        if (moveRef.current.forward || moveRef.current.backward) velocityRef.current.z -= direction.z * acceleration * delta;
        if (moveRef.current.left || moveRef.current.right) velocityRef.current.x -= direction.x * acceleration * delta;

        controls.moveRight(-velocityRef.current.x * delta);
        controls.moveForward(-velocityRef.current.z * delta);
      }

      // Lógica de Minado Visual
      if (miningRef.current) {
        const elapsed = Date.now() - miningRef.current.startTime;
        const progress = Math.min(elapsed / MINING_TIME, 1.0);
        
        const mesh = miningRef.current.mesh;
        const crack = miningRef.current.crackOverlay;
        
        mesh.position.x = Math.round(mesh.position.x) + (Math.random() - 0.5) * 0.05 * progress;
        mesh.position.z = Math.round(mesh.position.z) + (Math.random() - 0.5) * 0.05 * progress;
        
        crack.scale.set(1.02, 1.02, 1.02);
        (crack.material as THREE.MeshBasicMaterial).opacity = progress * 0.8;

        if (progress >= 1.0) {
          const key = mesh.userData.key;
          scene.remove(mesh);
          scene.remove(crack);
          blocksRef.current.delete(key);
          miningRef.current = null;
        }
      }

      renderer.render(scene, camera);
      prevTime = time;
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [initWorld]);

  // Controles de teclado
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': moveRef.current.forward = true; break;
        case 'KeyS': moveRef.current.backward = true; break;
        case 'KeyA': moveRef.current.left = true; break;
        case 'KeyD': moveRef.current.right = true; break;
        case 'Space': moveRef.current.jump = true; break;
        case 'Digit1': setSelectedBlockIdx(0); break;
        case 'Digit2': setSelectedBlockIdx(1); break;
        case 'Digit3': setSelectedBlockIdx(2); break;
        case 'Digit4': setSelectedBlockIdx(3); break;
        case 'Digit5': setSelectedBlockIdx(4); break;
        case 'Digit6': setSelectedBlockIdx(5); break;
        case 'Digit7': setSelectedBlockIdx(6); break;
        case 'Digit8': setSelectedBlockIdx(7); break;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': moveRef.current.forward = false; break;
        case 'KeyS': moveRef.current.backward = false; break;
        case 'KeyA': moveRef.current.left = false; break;
        case 'KeyD': moveRef.current.right = false; break;
        case 'Space': moveRef.current.jump = false; break;
      }
    };
    const onWheel = (e: WheelEvent) => {
      setSelectedBlockIdx(prev => {
        const next = e.deltaY > 0 ? prev + 1 : prev - 1;
        if (next < 0) return BLOCK_LIST.length - 1;
        if (next >= BLOCK_LIST.length) return 0;
        return next;
      });
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    containerRef.current?.addEventListener('wheel', onWheel);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      containerRef.current?.removeEventListener('wheel', onWheel);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!controlsRef.current?.isLocked) {
      controlsRef.current?.lock();
      return;
    }

    if (!sceneRef.current || !cameraRef.current) return;

    raycasterRef.current.setFromCamera(new THREE.Vector2(0, 0), cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      const object = intersect.object as THREE.Mesh;
      if (object.userData.key === undefined) return; // No es un bloque

      if (e.button === 0) { // Clic Izquierdo - Minar
        const crackGeo = new THREE.BoxGeometry(1.01, 1.01, 1.01);
        const crackMat = new THREE.MeshBasicMaterial({ 
          color: 0x000000, 
          transparent: true, 
          opacity: 0, 
          wireframe: true 
        });
        const crackOverlay = new THREE.Mesh(crackGeo, crackMat);
        crackOverlay.position.copy(object.position);
        sceneRef.current.add(crackOverlay);

        miningRef.current = {
          id: object.userData.key,
          mesh: object,
          startTime: Date.now(),
          crackOverlay
        };
      } else if (e.button === 2) { // Clic Derecho - Poner
        if (intersect.face) {
          const normal = intersect.face.normal.clone();
          const newPos = object.position.clone().add(normal);
          addBlock(newPos, BLOCK_LIST[selectedBlockIdx]);
        }
      }
    }
  };

  const handleMouseUp = () => {
    if (miningRef.current) {
      const { mesh, crackOverlay } = miningRef.current;
      mesh.position.set(Math.round(mesh.position.x), Math.round(mesh.position.y), Math.round(mesh.position.z));
      mesh.scale.set(1, 1, 1);
      if (sceneRef.current) sceneRef.current.remove(crackOverlay);
      miningRef.current = null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#87ceeb] text-white overflow-hidden select-none">
      <div 
        ref={containerRef} 
        className="flex-1 cursor-crosshair relative"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        {!isLocked && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-6">
            <h2 className="text-4xl font-black italic text-emerald-400 mb-4 drop-shadow-lg">MARIOCRAFT SURVIVAL</h2>
            <div className="bg-zinc-900/80 p-8 rounded-3xl border border-emerald-500/30 max-w-md">
              <p className="text-zinc-300 mb-6 leading-relaxed">
                Pulsa en cualquier lugar para entrar al mundo.<br/>
                <span className="text-emerald-500 font-bold">WASD</span> para moverte, <span className="text-emerald-500 font-bold">Ratón</span> para mirar.
              </p>
              <button 
                onClick={() => controlsRef.current?.lock()}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-full font-bold transition-all transform active:scale-95"
              >
                ENTRAR AL JUEGO
              </button>
            </div>
            <p className="mt-8 text-zinc-500 text-xs uppercase tracking-widest font-bold">Pulsa ESC para salir de la cámara</p>
          </div>
        )}

        {isLocked && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
            <div className="w-4 h-4 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-white/70"></div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-white/70"></div>
            </div>
          </div>
        )}

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/50 backdrop-blur-xl p-1.5 border border-white/10 rounded-xl shadow-2xl z-20">
          {BLOCK_LIST.map((type, idx) => (
            <div 
              key={type}
              className={`relative w-12 h-12 flex flex-col items-center justify-center rounded-lg transition-all ${selectedBlockIdx === idx ? 'bg-emerald-500/30 ring-2 ring-emerald-400 scale-110' : 'hover:bg-white/5 opacity-80'}`}
              onClick={() => setSelectedBlockIdx(idx)}
            >
              <div 
                className="w-6 h-6 rounded-sm shadow-md transform rotate-12"
                style={{ backgroundColor: `rgb(${BLOCK_COLORS[type] >> 16}, ${(BLOCK_COLORS[type] >> 8) & 0xff}, ${BLOCK_COLORS[type] & 0xff})` }}
              />
              <span className="text-[8px] mt-1 font-black text-white/40">{idx + 1}</span>
            </div>
          ))}
        </div>

        {isLocked && (
          <div className="absolute top-6 left-6 flex flex-col gap-2 pointer-events-none opacity-60">
            <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-bold">
              FPS: 60 | POS: 0.0, 1.7, 5.0
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MinecraftApp;
