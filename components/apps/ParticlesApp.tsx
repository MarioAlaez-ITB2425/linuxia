
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Box, Circle, Heart, Hexagon, Layers, RotateCw, Settings2, Dna, Wind, Zap, Disc } from 'lucide-react';

type ShapeType = 'sphere' | 'cube' | 'torus' | 'heart' | 'plane' | 'pyramid' | 'dna' | 'knot' | 'galaxy' | 'atomo';

const ParticlesApp: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shape, setShape] = useState<ShapeType>('sphere');
  const [color, setColor] = useState('#00f2ff');
  const [size, setSize] = useState(0.04);
  const [speed, setSpeed] = useState(0.05);
  const [isRotating, setIsRotating] = useState(true);
  const [particleCount] = useState(5000);

  const isRotatingRef = useRef(isRotating);
  const speedRef = useRef(speed);

  useEffect(() => {
    isRotatingRef.current = isRotating;
  }, [isRotating]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const targetPositionsRef = useRef<Float32Array | null>(null);

  const targetRotationRef = useRef({ x: 0, y: 0 });
  const currentRotationRef = useRef({ x: 0, y: 0 });

  const generateShapePositions = (type: ShapeType, count: number) => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      let x = 0, y = 0, z = 0;
      
      switch (type) {
        case 'sphere':
          const phi = Math.acos(-1 + (2 * i) / count);
          const theta = Math.sqrt(count * Math.PI) * phi;
          x = 2 * Math.cos(theta) * Math.sin(phi);
          y = 2 * Math.sin(theta) * Math.sin(phi);
          z = 2 * Math.cos(phi);
          break;
        case 'cube':
          x = (Math.random() - 0.5) * 4;
          y = (Math.random() - 0.5) * 4;
          z = (Math.random() - 0.5) * 4;
          break;
        case 'torus':
          const t = Math.random() * Math.PI * 2;
          const p = Math.random() * Math.PI * 2;
          const R = 2;
          const r = 0.5;
          x = (R + r * Math.cos(p)) * Math.cos(t);
          y = (R + r * Math.cos(p)) * Math.sin(t);
          z = r * Math.sin(p);
          break;
        case 'heart':
          const angle = Math.random() * Math.PI * 2;
          const r_heart = 0.15;
          x = r_heart * (16 * Math.pow(Math.sin(angle), 3));
          y = r_heart * (13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));
          z = (Math.random() - 0.5) * 0.5;
          break;
        case 'plane':
          x = (Math.random() - 0.5) * 6;
          y = (Math.random() - 0.5) * 6;
          z = 0;
          break;
        case 'pyramid':
          const baseSize = 4;
          const height = 4;
          const rand = Math.random();
          if (rand < 0.2) {
             x = (Math.random() - 0.5) * baseSize;
             z = (Math.random() - 0.5) * baseSize;
             y = -height/2;
          } else {
             const side = Math.floor(Math.random() * 4);
             const h = Math.random();
             const w = (Math.random() - 0.5) * baseSize * (1 - h);
             y = -height/2 + h * height;
             if (side === 0) { x = baseSize/2 * (1-h); z = w; }
             else if (side === 1) { x = -baseSize/2 * (1-h); z = w; }
             else if (side === 2) { z = baseSize/2 * (1-h); x = w; }
             else { z = -baseSize/2 * (1-h); x = w; }
          }
          break;
        case 'dna':
          const t_dna = (i / count) * Math.PI * 10;
          const side = i % 2 === 0 ? 1 : -1;
          x = Math.cos(t_dna) * side * 1.5;
          z = Math.sin(t_dna) * side * 1.5;
          y = t_dna - (Math.PI * 5);
          break;
        case 'knot':
          const t_knot = (i / count) * Math.PI * 2;
          x = Math.sin(t_knot) + 2 * Math.sin(2 * t_knot);
          y = Math.cos(t_knot) - 2 * Math.cos(2 * t_knot);
          z = -Math.sin(3 * t_knot);
          break;
        case 'galaxy':
          const r_gal = Math.sqrt(Math.random()) * 4;
          const a_gal = Math.random() * Math.PI * 2 + (r_gal * 2);
          x = Math.cos(a_gal) * r_gal;
          z = Math.sin(a_gal) * r_gal;
          y = (Math.random() - 0.5) * (1 / (r_gal + 0.1));
          break;
        case 'atomo':
          const phi_s = Math.acos(-1 + (2 * i) / count);
          const theta_s = Math.sqrt(count * Math.PI) * phi_s;
          const rad = (i % 10 === 0) ? 3.5 : 1.5;
          x = rad * Math.cos(theta_s) * Math.sin(phi_s);
          y = rad * Math.sin(theta_s) * Math.sin(phi_s);
          z = rad * Math.cos(phi_s);
          break;
      }
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    return positions;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 8;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const geometry = new THREE.BufferGeometry();
    const initialPositions = generateShapePositions('sphere', particleCount);
    geometry.setAttribute('position', new THREE.BufferAttribute(initialPositions.slice(), 3));
    targetPositionsRef.current = initialPositions;

    const material = new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size: size,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    pointsRef.current = points;

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (pointsRef.current && targetPositionsRef.current) {
        const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
        const targets = targetPositionsRef.current;

        const currentSpeed = speedRef.current;
        for (let i = 0; i < positions.length; i++) {
          positions[i] += (targets[i] - positions[i]) * currentSpeed;
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;

        if (isRotatingRef.current) {
          pointsRef.current.rotation.y += 0.005;
        }

        currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.1;
        currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.1;
        
        pointsRef.current.rotation.x += currentRotationRef.current.x;
        pointsRef.current.rotation.y += currentRotationRef.current.y;

        targetRotationRef.current.x *= 0.95;
        targetRotationRef.current.y *= 0.95;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (pointsRef.current) {
      targetPositionsRef.current = generateShapePositions(shape, particleCount);
    }
  }, [shape, particleCount]);

  useEffect(() => {
    if (pointsRef.current) {
      (pointsRef.current.material as THREE.PointsMaterial).color.set(color);
      (pointsRef.current.material as THREE.PointsMaterial).size = size;
    }
  }, [color, size]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startY = e.clientY;
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      targetRotationRef.current.y = deltaX * 0.001;
      targetRotationRef.current.x = deltaY * 0.001;
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="flex flex-col h-full bg-black text-white overflow-hidden select-none">
      <div 
        ref={containerRef} 
        className="flex-1 cursor-grab active:cursor-grabbing relative"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute top-6 left-6 z-10">
          <h2 className="text-2xl font-black italic tracking-tighter text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">PARTICLE_CLOUD v2.5</h2>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mt-1">Advanced Geometry Engine</p>
        </div>

        <div 
          className="absolute right-6 top-6 bottom-6 w-72 bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col gap-6 overflow-y-auto no-scrollbar shadow-2xl z-20"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 mb-2 text-zinc-400">
            <Settings2 className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Configuration</span>
          </div>

          <section>
            <label className="text-[10px] uppercase font-bold text-zinc-500 mb-3 block">Geometric Primitive</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'sphere', icon: Circle },
                { id: 'cube', icon: Box },
                { id: 'torus', icon: RotateCw },
                { id: 'heart', icon: Heart },
                { id: 'pyramid', icon: Hexagon },
                { id: 'dna', icon: Dna },
                { id: 'knot', icon: Wind },
                { id: 'galaxy', icon: Disc },
                { id: 'atomo', icon: Zap }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setShape(s.id as ShapeType)}
                  className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${shape === s.id ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(34,211,238,0.4)]' : 'bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400'}`}
                >
                  <s.icon className="w-5 h-5" />
                  <span className="text-[8px] font-bold uppercase">{s.id}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] uppercase font-bold text-zinc-500">Particle Size</label>
              <span className="text-[10px] font-mono text-cyan-400">{size.toFixed(2)}</span>
            </div>
            <input 
              type="range" min="0.01" max="0.15" step="0.01" value={size} 
              onChange={(e) => setSize(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </section>

          <section>
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] uppercase font-bold text-zinc-500">Flow Speed</label>
              <span className="text-[10px] font-mono text-cyan-400">{(speed * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" min="0.01" max="0.2" step="0.01" value={speed} 
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </section>

          <section>
            <label className="text-[10px] uppercase font-bold text-zinc-500 mb-3 block">Color Spectrum</label>
            <div className="flex flex-wrap gap-2">
              {['#00f2ff', '#ff0055', '#7000ff', '#00ff40', '#ffcc00', '#ffffff'].map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  style={{ backgroundColor: c, boxShadow: color === c ? `0 0 15px ${c}` : 'none' }}
                />
              ))}
            </div>
          </section>

          <div className="mt-auto pt-6 border-t border-white/5 space-y-3">
             <button 
              onClick={() => setIsRotating(!isRotating)}
              className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase transition-all ${isRotating ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(34,211,238,0.4)]' : 'bg-zinc-800 text-zinc-400'}`}
             >
                <RotateCw className={`w-4 h-4 ${isRotating ? 'animate-spin-slow' : ''}`} />
                Auto-Orbit {isRotating ? 'ON' : 'OFF'}
             </button>
             <p className="text-[9px] text-zinc-600 text-center leading-relaxed">
               Interact with sliders without affecting the camera. Drag outside the menu to manually rotate.
             </p>
          </div>
        </div>
      </div>
      
      <div className="h-10 bg-zinc-950 border-t border-white/5 flex items-center justify-between px-6">
        <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest font-bold text-zinc-600">
          <span>Vertices: {particleCount.toLocaleString()}</span>
          <span>Buffer: Float32</span>
          <span>Engine: WebGL v2</span>
        </div>
        <div className="text-[9px] font-mono text-cyan-900 uppercase">System_Stable // Geo_Core_Active</div>
      </div>

      <style>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input[type='range'] {
          -webkit-appearance: none;
          background: rgba(255,255,255,0.05);
          height: 4px;
          border-radius: 2px;
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #00f2ff;
          box-shadow: 0 0 10px rgba(0, 242, 255, 0.5);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default ParticlesApp;
