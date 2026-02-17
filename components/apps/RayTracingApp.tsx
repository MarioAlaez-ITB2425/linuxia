
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { Camera, Settings2, Sliders, RefreshCw, AlertCircle, Sun } from 'lucide-react';

const RayTracingApp: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [roughness, setRoughness] = useState(0.05);
  const [metalness, setMetalness] = useState(1.0);
  const [clearcoat, setClearcoat] = useState(1.0);
  const [refraction, setRefraction] = useState(0.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const spheresRef = useRef<THREE.Mesh[]>([]);
  const materialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    // Fondo negro puro como solicitó el usuario
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    // Cargamos HDR para reflejos realistas
    const rgbeLoader = new RGBELoader();
    const hdrUrl = 'https://threejs.org/examples/textures/equirectangular/venice_sunset_1k.hdr';
    
    rgbeLoader.load(
      hdrUrl,
      (texture) => {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        // El background sigue siendo negro, solo usamos el HDR para el entorno (reflejos)
        scene.environment = envMap;
        texture.dispose();
        pmremGenerator.dispose();
        setLoading(false);
      },
      undefined,
      (err) => {
        console.error('Error cargando HDR, activando modo estudio:', err);
        setError('HDR Offline. Activando Iluminación de Estudio.');
        setLoading(false);
        pmremGenerator.dispose();

        // Fallback: Iluminación de estudio para reflejos potentes en fondo negro
        const ambient = new THREE.AmbientLight(0xffffff, 0.1);
        scene.add(ambient);
        
        const lights = [
          { pos: [5, 5, 5], color: 0xffffff, int: 50 },
          { pos: [-5, 5, 5], color: 0x00f2ff, int: 30 },
          { pos: [0, -5, 5], color: 0xff0055, int: 20 },
          { pos: [0, 5, -10], color: 0xffffff, int: 40 }
        ];

        lights.forEach(l => {
          const light = new THREE.PointLight(l.color, l.int);
          light.position.set(l.pos[0], l.pos[1], l.pos[2]);
          scene.add(light);
        });
      }
    );

    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 1,
      roughness: 0.05,
      ior: 1.5,
      thickness: 0.5,
      transmission: 0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 1,
      envMapIntensity: 1.5
    });
    materialRef.current = material;

    const sphereGeometry = new THREE.SphereGeometry(2, 128, 128);
    
    const sphere1 = new THREE.Mesh(sphereGeometry, material);
    sphere1.position.set(-2.5, 0, 0);
    scene.add(sphere1);

    const sphere2 = new THREE.Mesh(sphereGeometry, material);
    sphere2.position.set(2.5, 0, 0);
    scene.add(sphere2);

    spheresRef.current = [sphere1, sphere2];

    let requestID: number;
    const animate = () => {
      requestID = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      sphere1.position.y = Math.sin(time) * 0.3;
      sphere2.position.y = Math.cos(time) * 0.3;
      
      sphere1.rotation.y += 0.005;
      sphere2.rotation.y += 0.005;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !camera) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestID);
      pmremGenerator.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      sphereGeometry.dispose();
      material.dispose();
    };
  }, []);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.roughness = roughness;
      materialRef.current.metalness = metalness;
      materialRef.current.clearcoat = clearcoat;
      materialRef.current.transmission = refraction;
      materialRef.current.opacity = 1 - (refraction * 0.5);
      materialRef.current.transparent = refraction > 0;
      materialRef.current.needsUpdate = true;
    }
  }, [roughness, metalness, clearcoat, refraction]);

  return (
    <div className="flex flex-col h-full bg-black text-white font-mono relative overflow-hidden">
      <div ref={containerRef} className="flex-1 w-full h-full cursor-grab active:cursor-grabbing relative bg-black">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-black">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin" />
              <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 animate-pulse">
                Booting RayTracing Engine...
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute bottom-20 left-6 z-40 bg-zinc-900/80 border border-emerald-500/30 backdrop-blur-md px-4 py-2 rounded-lg flex items-center gap-2 text-emerald-400 text-[9px] font-bold uppercase tracking-wider animate-in fade-in slide-in-from-bottom-2">
            <AlertCircle className="w-3 h-3" />
            {error}
          </div>
        )}

        <div className="absolute top-6 left-6 z-10 pointer-events-none select-none">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center border border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.2)]">
               <Camera className="w-6 h-6 text-emerald-400" />
             </div>
             <div>
               <h2 className="text-xl font-black italic tracking-tighter text-emerald-400">PBR_ULTRA_BLACK</h2>
               <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">
                 Mode: Cinematic Dark // Ray Intensity: High
               </div>
             </div>
          </div>
        </div>

        <div className="absolute right-6 top-6 bottom-6 w-80 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl p-6 flex flex-col gap-6 shadow-2xl z-20">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <Settings2 className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Core Parameters</span>
            </div>
            <Sliders className="w-4 h-4 text-zinc-600" />
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar">
            <section>
              <div className="flex justify-between items-center mb-3">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Surface Finish</label>
                <span className="text-[10px] font-mono text-emerald-400">{roughness.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01" value={roughness} 
                onChange={(e) => setRoughness(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </section>

            <section>
              <div className="flex justify-between items-center mb-3">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Metal Density</label>
                <span className="text-[10px] font-mono text-emerald-400">{metalness.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01" value={metalness} 
                onChange={(e) => setMetalness(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </section>

            <section>
              <div className="flex justify-between items-center mb-3">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Clearcoat Gloss</label>
                <span className="text-[10px] font-mono text-emerald-400">{clearcoat.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01" value={clearcoat} 
                onChange={(e) => setClearcoat(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </section>

            <section>
              <div className="flex justify-between items-center mb-3">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Photon Refraction</label>
                <span className="text-[10px] font-mono text-emerald-400">{refraction.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01" value={refraction} 
                onChange={(e) => setRefraction(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </section>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col gap-3">
            <div className="w-full py-4 bg-zinc-900/50 rounded-xl border border-emerald-500/10 flex items-center justify-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Real-Time Core Active</span>
            </div>
            <p className="text-[9px] text-zinc-600 text-center leading-relaxed font-bold">
              Using ACES Filmic Tone Mapping for high-contrast cinematic results.
            </p>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 flex items-center gap-6 pointer-events-none">
          <div className="flex items-center gap-2 bg-zinc-900/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            GPU Accelerated
          </div>
          <div className="flex items-center gap-2 bg-zinc-900/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
             Physical Rendering v2
          </div>
        </div>
      </div>

      <style>{`
        input[type='range'] {
          -webkit-appearance: none;
          background: rgba(255,255,255,0.05);
          height: 3px;
          border-radius: 2px;
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: #34d399;
          cursor: pointer;
          border: 2px solid #000;
          box-shadow: 0 0 10px rgba(52, 211, 153, 0.5);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default RayTracingApp;
