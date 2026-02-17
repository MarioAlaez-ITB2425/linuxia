
import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Building2, Factory, Home, Trees, Zap, Wallet, 
  Users, Smile, Plus, Hammer, ChevronRight, Info, MousePointer2 
} from 'lucide-react';

type TileType = 'empty' | 'road' | 'factory' | 'house' | 'apartment' | 'park' | 'power';

interface TileData {
  id: string;
  type: TileType;
  mesh?: THREE.Group;
}

interface BuildingInfo {
  type: TileType;
  name: string;
  cost: number;
  icon: any;
  color: number;
  desc: string;
  income?: number;
  happiness?: number;
  population?: number;
}

const BUILDINGS: BuildingInfo[] = [
  { type: 'road', name: 'Carretera', cost: 20, icon: ChevronRight, color: 0x333333, desc: 'Permite el tránsito de vehículos.' },
  { type: 'factory', name: 'Fábrica', cost: 0, icon: Factory, color: 0xea580c, desc: 'Genera ingresos pasivos. La primera es gratis.', income: 60 },
  { type: 'house', name: 'Casa', cost: 150, icon: Home, color: 0x059669, desc: 'Zona residencial básica.', population: 5, happiness: 2 },
  { type: 'apartment', name: 'Apartamento', cost: 600, icon: Building2, color: 0x2563eb, desc: 'Alta densidad de población.', population: 25, happiness: 5 },
  { type: 'park', name: 'Parque', cost: 300, icon: Trees, color: 0x10b981, desc: 'Aumenta mucho la felicidad.', happiness: 15 },
  { type: 'power', name: 'Central', cost: 1200, icon: Zap, color: 0xeab308, desc: 'Necesaria para el desarrollo.', happiness: -5, income: 120 },
];

const GRID_SIZE = 12;

const CitySimApp: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [money, setMoney] = useState(1000);
  const [population, setPopulation] = useState(0);
  const [happiness, setHappiness] = useState(50);
  const [selectedTool, setSelectedTool] = useState<TileType>('house');
  const [isFactoryFree, setIsFactoryFree] = useState(true);

  // Refs para Three.js
  const sceneRef = useRef<THREE.Scene | null>(null);
  const gridRef = useRef<TileData[][]>([]);
  const carsRef = useRef<THREE.Group[]>([]);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const selectorRef = useRef<THREE.Mesh | null>(null);

  // Crear edificios 3D procedurales
  const createBuildingMesh = (type: TileType): THREE.Group => {
    const group = new THREE.Group();
    const info = BUILDINGS.find(b => b.type === type);
    const color = info?.color || 0xffffff;

    switch(type) {
      case 'road':
        const roadBase = new THREE.Mesh(
          new THREE.PlaneGeometry(0.98, 0.98),
          new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 })
        );
        roadBase.rotation.x = -Math.PI / 2;
        roadBase.position.y = 0.01;
        group.add(roadBase);
        // Se ha eliminado la línea amarilla central solicitada
        break;

      case 'house':
        const body = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.4, 0.6),
          new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
        );
        body.position.y = 0.2;
        group.add(body);
        const roof = new THREE.Mesh(
          new THREE.ConeGeometry(0.5, 0.3, 4),
          new THREE.MeshStandardMaterial({ color: 0x451a03 })
        );
        roof.position.y = 0.55;
        roof.rotation.y = Math.PI / 4;
        group.add(roof);
        break;

      case 'apartment':
        const tower = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 1.2, 0.5),
          new THREE.MeshStandardMaterial({ color, metalness: 0.3, roughness: 0.1 })
        );
        tower.position.y = 0.6;
        group.add(tower);
        for(let i=0; i<4; i++) {
          const win = new THREE.Mesh(
            new THREE.PlaneGeometry(0.4, 0.1),
            new THREE.MeshStandardMaterial({ color: 0xffffcc, emissive: 0xffffcc, emissiveIntensity: 1.0 })
          );
          win.position.set(0, 0.3 + i*0.2, 0.251);
          group.add(win);
        }
        break;

      case 'factory':
        const fBase = new THREE.Mesh(
          new THREE.BoxGeometry(0.7, 0.4, 0.7),
          new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
        );
        fBase.position.y = 0.2;
        group.add(fBase);
        const chimney = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.1, 0.6),
          new THREE.MeshStandardMaterial({ color: 0x222222 })
        );
        chimney.position.set(0.2, 0.5, 0.2);
        group.add(chimney);
        break;

      case 'park':
        const grass = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, 0.05, 0.9),
          new THREE.MeshStandardMaterial({ color: 0x22c55e })
        );
        group.add(grass);
        const tTrunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 0.3),
          new THREE.MeshStandardMaterial({ color: 0x451a03 })
        );
        tTrunk.position.y = 0.15;
        group.add(tTrunk);
        const tLeaves = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0x064e3b })
        );
        tLeaves.position.y = 0.4;
        group.add(tLeaves);
        break;

      case 'power':
        const pBase = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.2, 0.6),
          new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 })
        );
        pBase.position.y = 0.1;
        group.add(pBase);
        const core = new THREE.Mesh(
          new THREE.SphereGeometry(0.25, 16, 16),
          new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xfacc15, emissiveIntensity: 2.0 })
        );
        core.position.y = 0.4;
        group.add(core);
        break;
    }

    return group;
  };

  // Inicialización de la escena
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f); // Azul muy oscuro tecnológico
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(12, 12, 12);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minDistance = 5;
    controls.maxDistance = 35;

    // Iluminación mejorada
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    
    const hemiLight = new THREE.HemisphereLight(0x3b82f6, 0x000000, 0.6);
    scene.add(hemiLight);

    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(15, 30, 15);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    scene.add(sun);

    // Suelo Metálico con reflejos
    const groundGeo = new THREE.PlaneGeometry(GRID_SIZE + 0.1, GRID_SIZE + 0.1);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x111111, 
      roughness: 0.3, 
      metalness: 0.8,
      emissive: 0x0a0a0f,
      emissiveIntensity: 0.2
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.name = "ground";
    scene.add(ground);

    // Cuadrícula estilo Blueprint (Brillante)
    const gridHelper = new THREE.GridHelper(GRID_SIZE, GRID_SIZE, 0x3b82f6, 0x1e293b);
    gridHelper.position.y = 0.005;
    scene.add(gridHelper);

    // Indicador de selección (Hover)
    const selectorGeo = new THREE.PlaneGeometry(1, 1);
    const selectorMat = new THREE.MeshBasicMaterial({ 
      color: 0x0ea5e9, 
      transparent: true, 
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const selector = new THREE.Mesh(selectorGeo, selectorMat);
    selector.rotation.x = -Math.PI / 2;
    selector.position.y = 0.02;
    selector.visible = false;
    scene.add(selector);
    selectorRef.current = selector;

    // Inicializar data del grid
    const initialGrid: TileData[][] = [];
    for(let z=0; z<GRID_SIZE; z++) {
      const row: TileData[] = [];
      for(let x=0; x<GRID_SIZE; x++) {
        row.push({ id: `${x}-${z}`, type: 'empty' });
      }
      initialGrid.push(row);
    }
    gridRef.current = initialGrid;

    // Loop de animación
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      if (!rendererRef.current || !cameraRef.current || !sceneRef.current || !selectorRef.current) return;
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.current.setFromCamera(mouse.current, cameraRef.current);
      const intersects = raycaster.current.intersectObject(ground);
      
      if (intersects.length > 0) {
        const x = Math.floor(intersects[0].point.x + GRID_SIZE/2);
        const z = Math.floor(intersects[0].point.z + GRID_SIZE/2);
        
        if (x >= 0 && x < GRID_SIZE && z >= 0 && z < GRID_SIZE) {
          selectorRef.current.position.set(x - GRID_SIZE/2 + 0.5, 0.02, z - GRID_SIZE/2 + 0.5);
          selectorRef.current.visible = true;
          // Cambiar color si está ocupado
          if (gridRef.current[z][x].type !== 'empty') {
            (selectorRef.current.material as THREE.MeshBasicMaterial).color.set(0xef4444);
          } else {
            (selectorRef.current.material as THREE.MeshBasicMaterial).color.set(0x0ea5e9);
          }
        } else {
          selectorRef.current.visible = false;
        }
      } else {
        selectorRef.current.visible = false;
      }
    };
    renderer.domElement.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
    };
  }, []);

  // Lógica económica
  useEffect(() => {
    const timer = setInterval(() => {
      let incomeTotal = 0;
      let popTotal = 0;
      let hapTotal = 50;

      gridRef.current.forEach(row => {
        row.forEach(tile => {
          const b = BUILDINGS.find(b => b.type === tile.type);
          if (b) {
            if (b.income) incomeTotal += b.income;
            if (b.population) popTotal += b.population;
            if (b.happiness) hapTotal += b.happiness;
          }
        });
      });

      setMoney(m => m + Math.floor(incomeTotal / 8));
      setPopulation(popTotal);
      setHappiness(Math.min(100, Math.max(0, hapTotal)));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePointerDown = (e: React.MouseEvent) => {
    if (!rendererRef.current || !cameraRef.current || !sceneRef.current) return;

    const rect = rendererRef.current.domElement.getBoundingClientRect();
    mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, cameraRef.current);
    const intersects = raycaster.current.intersectObjects(sceneRef.current.children, true);

    if (intersects.length > 0) {
      const groundIntersect = intersects.find(i => i.object.name === "ground");
      if (!groundIntersect) return;

      const x = Math.floor(groundIntersect.point.x + GRID_SIZE/2);
      const z = Math.floor(groundIntersect.point.z + GRID_SIZE/2);

      if (x < 0 || x >= GRID_SIZE || z < 0 || z >= GRID_SIZE) return;

      if (e.button === 0) { // Construir
        if (gridRef.current[z][x].type !== 'empty') return;

        const info = BUILDINGS.find(b => b.type === selectedTool);
        if (!info) return;

        const cost = (selectedTool === 'factory' && isFactoryFree) ? 0 : info.cost;
        if (money < cost) return;

        const mesh = createBuildingMesh(selectedTool);
        mesh.position.set(x - GRID_SIZE/2 + 0.5, 0, z - GRID_SIZE/2 + 0.5);
        sceneRef.current.add(mesh);

        gridRef.current[z][x].type = selectedTool;
        gridRef.current[z][x].mesh = mesh;

        setMoney(m => m - cost);
        if (selectedTool === 'factory' && isFactoryFree) setIsFactoryFree(false);
        
      } else if (e.button === 2) { // Demoler
        const tile = gridRef.current[z][x];
        if (tile.mesh) {
          sceneRef.current.remove(tile.mesh);
          tile.mesh = undefined;
          tile.type = 'empty';
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white font-mono overflow-hidden">
      {/* HUD Superior con Glassmorphism */}
      <div className="h-20 bg-zinc-900/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-around px-8 z-50">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-emerald-400">
            <Wallet className="w-4 h-4" />
            <span className="text-xl font-black italic tracking-tighter">${money.toLocaleString()}</span>
          </div>
          <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Tesorería</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-sky-400">
            <Users className="w-4 h-4" />
            <span className="text-xl font-black italic tracking-tighter">{population.toLocaleString()}</span>
          </div>
          <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Ciudadanos</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-amber-400">
            <Smile className="w-4 h-4" />
            <span className="text-xl font-black italic tracking-tighter">{happiness}%</span>
          </div>
          <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Felicidad</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Panel Lateral */}
        <div className="w-72 bg-zinc-900 border-r border-white/5 p-5 flex flex-col gap-4 overflow-y-auto no-scrollbar shadow-2xl z-40">
          <div className="flex items-center gap-2 text-sky-400 border-b border-white/5 pb-3">
            <Hammer className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Blueprint 3D Engine</span>
          </div>

          <div className="space-y-2">
            {BUILDINGS.map((b) => {
              const actualCost = (b.type === 'factory' && isFactoryFree) ? 0 : b.cost;
              return (
                <button
                  key={b.type}
                  onClick={() => setSelectedTool(b.type)}
                  className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all group border ${
                    selectedTool === b.type 
                    ? 'bg-sky-500/10 border-sky-500/50 text-sky-400 ring-1 ring-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.1)]' 
                    : 'bg-white/5 border-transparent hover:border-white/10 text-zinc-400'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform`} style={{ backgroundColor: `#${b.color.toString(16)}` }}>
                    <b.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold uppercase">{b.name}</span>
                      <span className={`text-[10px] font-mono ${money < actualCost ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {actualCost === 0 ? 'GRATIS' : `$${actualCost}`}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-auto p-4 bg-white/5 rounded-xl border border-white/10">
             <div className="flex items-start gap-2">
               <MousePointer2 className="w-4 h-4 text-sky-400 mt-0.5" />
               <p className="text-[9px] text-zinc-500 leading-relaxed uppercase font-bold">
                 L-Click: Construir<br/>R-Click: Demoler<br/>Orbit: Arrastrar Ratón
               </p>
             </div>
          </div>
        </div>

        {/* El Canvas 3D */}
        <div 
          ref={containerRef} 
          className="flex-1 relative cursor-crosshair bg-[#0a0a0f]"
          onMouseDown={handlePointerDown}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-2">
             <div className="px-3 py-1 bg-black/50 backdrop-blur-md rounded border border-white/10 text-[9px] font-bold uppercase tracking-widest text-sky-400">
                Rendering: WebGL PBR // GRID: 12x12
             </div>
             <div className="px-3 py-1 bg-black/50 backdrop-blur-md rounded border border-white/10 text-[8px] font-bold uppercase tracking-widest text-zinc-500">
                Blueprint Color: Deep Blue
             </div>
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        canvas { outline: none; }
      `}</style>
    </div>
  );
};

export default CitySimApp;
