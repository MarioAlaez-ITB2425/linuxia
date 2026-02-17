
import React, { useRef, useState, useEffect } from 'react';
import { Download, Eraser, MousePointer2, Palette, Save, Trash2 } from 'lucide-react';

interface PaintAppProps {
  onSave: (dataUrl: string) => void;
  initialImage?: string;
}

const COLORS = ['#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

const PaintApp: React.FC<PaintAppProps> = ({ onSave, initialImage }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

  // Handle canvas sizing and background initialization
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const container = containerRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Save content before resize
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) tempCtx.drawImage(canvas, 0, 0);

      const isNewCanvas = canvas.width === 0;
      
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // If it's a new canvas, fill with white. Otherwise restore previous content.
      if (isNewCanvas) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.drawImage(tempCanvas, 0, 0);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !initialImage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = initialImage;
  }, [initialImage]);

  const startDrawing = (e: React.MouseEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.beginPath();
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = brushSize;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleSave = () => {
    const dataUrl = canvasRef.current?.toDataURL();
    if (dataUrl) onSave(dataUrl);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      <div className="p-2 sm:p-3 border-b border-white/5 flex flex-wrap items-center justify-between gap-2 sm:gap-4 bg-zinc-800/40">
        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-900/50 rounded-lg p-1 border border-white/5">
            <button 
              onClick={() => setTool('pen')}
              className={`p-1.5 sm:p-2 rounded-md ${tool === 'pen' ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-zinc-400'}`}
            >
              <MousePointer2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setTool('eraser')}
              className={`p-1.5 sm:p-2 rounded-md ${tool === 'eraser' ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-zinc-400'}`}
            >
              <Eraser className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-1.5 px-1">
            {COLORS.map(c => (
              <button 
                key={c}
                onClick={() => setColor(c)}
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-transform flex-shrink-0 ${color === c ? 'scale-110 border-white shadow-lg' : 'border-white/10'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end">
          <input 
            type="range" min="1" max="50" value={brushSize} 
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-20 sm:w-32 accent-blue-500"
          />
          <div className="flex items-center gap-2">
            <button onClick={clear} className="p-2 hover:bg-rose-500/20 text-rose-400 rounded transition-colors" title="Clear All">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={handleSave} className="flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs sm:text-sm font-medium transition-colors">
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save</span>
            </button>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-hidden relative bg-white">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onMouseMove={draw}
          className="cursor-crosshair block"
        />
      </div>
    </div>
  );
};

export default PaintApp;
