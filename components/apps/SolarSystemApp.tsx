
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Sun, Play, Pause, Settings2, Zap, Minimize2, Eye, EyeOff, Layers } from 'lucide-react';

interface PlanetData {
  name: string;
  distance: number;
  size: number;
  speed: number;
  color: number;
  hasRings?: boolean;
}

const PLANETS: PlanetData[] = [
  { name: 'Mercurio', distance: 50, size: 0.8, speed: 0.047, color: 0xA5A5A5 },
  { name: 'Venus', distance: 75, size: 1.2, speed: 0.035, color: 0xE3BB76 },
  { name: 'Tierra', distance: 110, size: 1.3, speed: 0.029, color: 0x2233FF },
  { name: 'Marte', distance: 145, size: 1.0, speed: 0.024, color: 0xE27B58 },
  { name: 'Júpiter', distance: 210, size: 3.5, speed: 0.013, color: 0xD39C7E },
  { name: 'Saturno', distance: 280, size: 3.0, speed: 0.009, color: 0xC5AB6E, hasRings: true },
  { name: 'Urano', distance: 350, size: 2.0, speed: 0.006, color: 0xBBE1E4 },
  { name: 'Neptuno', distance: 420, size: 2.0, speed: 0.005, color: 0x6081FF },
];

function createPlanetTexture(baseColor: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const color = new THREE.Color(baseColor);
  const r = Math.floor(color.r * 255);
  const g = Math.floor(color.g * 255);
  const b = Math.floor(color.b * 255);
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 2 + 0.5;
    const opacity = Math.random() * 0.4;
    const isDark = Math.random() > 0.5;
    ctx.fillStyle = isDark ? `rgba(0,0,0,${opacity})` : `rgba(255,255,255,${opacity})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 8; i++) {
    const yPos = Math.random() * canvas.height;
    const height = Math.random() * 30 + 5;
    const opacity = Math.random() * 0.15;
    const isDark = Math.random() > 0.5;
    ctx.fillStyle = isDark ? `rgba(0,0,0,${opacity})` : `rgba(255,255,255,${opacity})`;
    ctx.fillRect(0, yPos, canvas.width, height);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

const SolarSystemApp: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [timeScale, setTimeScale] = useState(1.0);
  const [planetScale, setPlanetScale] = useState(1.0);
  const [sunScale, setSunScale] = useState(1.0);
  const [showOrbits, setShowOrbits] = useState(true);
  const [paused, setPaused] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const timeScaleRef = useRef(timeScale);
  const pausedRef = useRef(paused);
  const planetScaleRef = useRef(planetScale);
  const cumulativeTimeRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const planetsRef = useRef<Map<string, THREE.Group>>(new Map());
  const orbitsRef = useRef<THREE.Line[]>([]);
  const sunRef = useRef<THREE.Group | null>(null);

  useEffect(() => { timeScaleRef.current = timeScale; }, [timeScale]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { planetScaleRef.current = planetScale; }, [planetScale]);

  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000002);
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 1, 100000);
    camera.position.set(0, 500, 1000);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0; 
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);
    const starCount = 60000;
    const starGeo = new THREE.BufferGeometry();
    const posArr = new Float32Array(starCount * 3);
    const colorArr = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 4000 + Math.random() * 15000;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      posArr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      posArr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      posArr[i * 3 + 2] = r * Math.cos(phi);
      const starType = Math.random();
      if (starType > 0.9) {
        colorArr[i * 3] = 0.7; colorArr[i * 3 + 1] = 0.7; colorArr[i * 3 + 2] = 1.0;
      } else if (starType > 0.8) {
        colorArr[i * 3] = 1.0; colorArr[i * 3 + 1] = 0.9; colorArr[i * 3 + 2] = 0.6;
      } else {
        colorArr[i * 3] = 1.0; colorArr[i * 3 + 1] = 1.0; colorArr[i * 3 + 2] = 1.0;
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colorArr, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ 
      size: 3.2, 
      vertexColors: true, 
      transparent: true, 
      opacity: 1.0, 
      sizeAttenuation: true 
    }));
    scene.add(stars);
    const sunGroup = new THREE.Group();
    const sunCore = new THREE.Mesh(new THREE.SphereGeometry(22, 64, 64), new THREE.MeshBasicMaterial({ color: 0xFFFFFF }));
    sunGroup.add(sunCore);
    const sunGlow = new THREE.Mesh(new THREE.SphereGeometry(26, 32, 32), new THREE.MeshBasicMaterial({ color: 0xFFAA00, transparent: true, opacity: 0.6 }));
    sunGroup.add(sunGlow);
    const sunOuterGlow = new THREE.Mesh(new THREE.SphereGeometry(40, 32, 32), new THREE.MeshBasicMaterial({ color: 0xFF4400, transparent: true, opacity: 0.2, side: THREE.BackSide }));
    sunGroup.add(sunOuterGlow);
    scene.add(sunGroup);
    sunRef.current = sunGroup;
    PLANETS.forEach(data => {
      const pGroup = new THREE.Group();
      const texture = createPlanetTexture(data.color);
      const pMesh = new THREE.Mesh(new THREE.SphereGeometry(data.size, 48, 48), new THREE.MeshStandardMaterial({ map: texture, color: 0xffffff, roughness: 1, metalness: 0, emissive: data.color, emissiveIntensity: 0.15 }));
      pGroup.add(pMesh);
      if (data.hasRings) {
        const ringGeo = new THREE.RingGeometry(data.size * 1.6, data.size * 2.8, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x887766, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
        const rings = new THREE.Mesh(ringGeo, ringMat);
        rings.rotation.x = Math.PI / 2.1;
        pGroup.add(rings);
      }
      scene.add(pGroup);
      planetsRef.current.set(data.name, pGroup);
      const pts = [];
      for (let i = 0; i <= 200; i++) {
        const a = (i / 200) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * data.distance, 0, Math.sin(a) * data.distance));
      }
      const orbitLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x556688, transparent: true, opacity: 0.4 }));
      scene.add(orbitLine);
      orbitsRef.current.push(orbitLine);
    });
    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;
      if (!pausedRef.current) cumulativeTimeRef.current += deltaTime * timeScaleRef.current;
      PLANETS.forEach(p => {
        const g = planetsRef.current.get(p.name);
        if (g) {
          const orbitTime = cumulativeTimeRef.current * p.speed * 5;
          g.position.x = Math.cos(orbitTime) * p.distance;
          g.position.z = Math.sin(orbitTime) * p.distance;
          g.children[0].rotation.y += 0.005;
          const targetScale = p.size * planetScaleRef.current;
          g.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        }
      });
      if (sunRef.current) {
        const pulse = 1 + Math.sin(currentTime * 0.0025) * 0.04;
        sunRef.current.children[1].scale.setScalar(pulse);
        sunRef.current.children[2].scale.setScalar(pulse * 1.1);
      }
      if (controlsRef.current) controlsRef.current.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();
    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h, true);
    });
    resizeObserver.observe(containerRef.current);
    return () => {
      resizeObserver.disconnect();
      if (containerRef.current && rendererRef.current?.domElement) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  useEffect(() => { if (sunRef.current) sunRef.current.scale.setScalar(sunScale); }, [sunScale]);
  useEffect(() => { orbitsRef.current.forEach(o => o.visible = showOrbits); }, [showOrbits]);

  return (
    <div className="flex h-full w-full bg-[#000002] text-white overflow-hidden font-mono relative">
      <div ref={containerRef} className="flex-1 relative w-full h-full overflow-hidden">
        
        {/* HUD (Top Left) */}
        <div className="absolute left-4 top-4 z-[100] pointer-events-none flex items-center gap-3">
           <div className="w-10 h-10 bg-orange-600/20 rounded-xl flex items-center justify-center border border-orange-500/30 shadow-[0_0_15px_rgba(234,88,12,0.2)]">
             <Sun className="w-6 h-6 text-orange-400" />
           </div>
           <div>
             <h2 className="text-lg font-black italic tracking-tighter">COSMOS_LAB</h2>
             <div className="text-[8px] text-cyan-500 font-bold uppercase tracking-widest opacity-80">
               Density: MAX // Stars: 60K // UI Scaled
             </div>
           </div>
        </div>

        {/* Controls (Right) */}
        {showControls ? (
          <div className="absolute right-4 top-4 bottom-4 w-72 bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 flex flex-col gap-6 shadow-2xl z-[100] animate-in fade-in slide-in-from-right-2">
             <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2 text-cyan-400">
                   <Settings2 className="w-3.5 h-3.5" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Ajustes</span>
                </div>
                <button onClick={() => setShowControls(false)} className="p-1 hover:bg-white/5 rounded text-zinc-500 transition-colors">
                   <Minimize2 className="w-3.5 h-3.5" />
                </button>
             </div>

             <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar pr-1">
                <section>
                   <div className="flex justify-between items-center mb-2">
                      <label className="text-[9px] uppercase font-bold text-zinc-500 flex items-center gap-2">
                         <Zap className="w-3 h-3" /> Velocidad
                      </label>
                      <span className="text-[9px] font-mono text-cyan-400">{timeScale.toFixed(2)}x</span>
                   </div>
                   <input type="range" min="0" max="8" step="0.1" value={timeScale} onChange={(e) => setTimeScale(parseFloat(e.target.value))} className="w-full accent-cyan-500 cursor-pointer" />
                </section>

                <section>
                   <div className="flex justify-between items-center mb-2">
                      <label className="text-[9px] uppercase font-bold text-zinc-500 flex items-center gap-2">
                         <Layers className="w-3 h-3" /> Escala Planetas
                      </label>
                      <span className="text-[9px] font-mono text-emerald-400">{planetScale.toFixed(1)}x</span>
                   </div>
                   <input type="range" min="0.1" max="15" step="0.1" value={planetScale} onChange={(e) => setPlanetScale(parseFloat(e.target.value))} className="w-full accent-emerald-500 cursor-pointer" />
                </section>

                <section>
                   <div className="flex justify-between items-center mb-2">
                      <label className="text-[9px] uppercase font-bold text-zinc-500 flex items-center gap-2">
                         <Sun className="w-3 h-3" /> Escala Sol
                      </label>
                      <span className="text-[9px] font-mono text-orange-400">{sunScale.toFixed(1)}x</span>
                   </div>
                   <input type="range" min="0.2" max="5" step="0.1" value={sunScale} onChange={(e) => setSunScale(parseFloat(e.target.value))} className="w-full accent-orange-500 cursor-pointer" />
                </section>

                <section className="pt-4 border-t border-white/5 space-y-3">
                   <button onClick={() => setShowOrbits(!showOrbits)} className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-[9px] font-bold uppercase transition-all border ${showOrbits ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-zinc-900 border-white/5 text-zinc-500'}`}>
                      {showOrbits ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />} Órbitas: {showOrbits ? 'SI' : 'NO'}
                   </button>
                   <button onClick={() => setPaused(!paused)} className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-[9px] font-bold uppercase transition-all shadow-lg ${paused ? 'bg-emerald-600 text-white shadow-emerald-900/40' : 'bg-white text-black'}`}>
                      {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />} {paused ? 'Reanudar' : 'Pausar'}
                   </button>
                </section>
             </div>
          </div>
        ) : (
          <button onClick={() => setShowControls(true)} className="absolute right-4 top-4 w-10 h-10 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center text-cyan-400 hover:bg-zinc-800 transition-all z-[100] shadow-xl">
            <Settings2 className="w-5 h-5" />
          </button>
        )}

        {/* Hints (Bottom Left) */}
        <div className="absolute bottom-4 left-4 text-[8px] font-bold text-zinc-500 uppercase tracking-widest pointer-events-none flex gap-6 z-[100]">
           <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md border border-white/5">
              <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span> Rotar: Click Izq.
           </div>
           <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md border border-white/5">
              <span className="w-1 h-1 bg-sky-500 rounded-full animate-pulse"></span> Zoom: Rueda
           </div>
        </div>
      </div>

      <style>{`
        input[type='range'] { -webkit-appearance: none; background: rgba(255, 255, 255, 0.05); height: 3px; border-radius: 2px; }
        input[type='range']::-webkit-slider-thumb { -webkit-appearance: none; height: 12px; width: 12px; border-radius: 50%; background: currentColor; cursor: pointer; border: 2px solid #000; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        canvas { outline: none; display: block; }
      `}</style>
    </div>
  );
};

export default SolarSystemApp;
