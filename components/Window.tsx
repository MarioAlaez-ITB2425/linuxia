
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { X, Minus, Square, Maximize2 } from 'lucide-react';
import { WindowState } from '../types';

interface WindowProps {
  window: WindowState;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  children: React.ReactNode;
}

const Window: React.FC<WindowProps> = ({ window: win, onClose, onMinimize, onMaximize, onFocus, children }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const offset = useRef({ x: 0, y: 0 });
  const taskbarHeight = 48;

  useLayoutEffect(() => {
    if (!isInitialized) {
      const screenW = window.innerWidth;
      const screenH = window.innerHeight - taskbarHeight;
      
      // Calculamos dimensiones ajustadas a la pantalla actual (con un margen de seguridad)
      const margin = 40;
      const finalWidth = Math.min(win.defaultWidth || 800, screenW - margin);
      const finalHeight = Math.min(win.defaultHeight || 550, screenH - margin);
      
      // Centrado exacto
      const initialX = (screenW - finalWidth) / 2;
      const initialY = (screenH - finalHeight) / 2;
      
      // Lógica de escalonamiento (stagger) pero controlada para no salir de pantalla
      const lastPart = win.id.split('-').pop() || '0';
      const numericId = parseInt(lastPart);
      const staggerBase = isNaN(numericId) ? 0 : (numericId % 5) * 25;
      
      // Aplicar posición y tamaño iniciales con clamping
      const posX = Math.max(10, Math.min(initialX + staggerBase, screenW - finalWidth - 10));
      const posY = Math.max(10, Math.min(initialY + staggerBase, screenH - finalHeight - 10));

      setSize({ width: finalWidth, height: finalHeight });
      setPos({ x: posX, y: posY });
      setIsInitialized(true);
    }
  }, [win.defaultWidth, win.defaultHeight, isInitialized, win.id]);

  const handleMouseDown = (e: React.MouseEvent) => {
    onFocus();

    if (win.isMaximized) return;

    const target = e.target as HTMLElement;
    const isButton = target.closest('button');
    
    if (target.closest('.window-drag-handle') && !isButton) {
      setIsDragging(true);
      offset.current = {
        x: e.clientX - pos.x,
        y: e.clientY - pos.y
      };
      e.preventDefault();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const screenW = window.innerWidth;
      const screenH = window.innerHeight - taskbarHeight;
      
      // Limitar el arrastre para que la barra de título no desaparezca
      const newX = Math.max(-size.width + 100, Math.min(e.clientX - offset.current.x, screenW - 100));
      const newY = Math.max(0, Math.min(e.clientY - offset.current.y, screenH - 40));

      setPos({ x: newX, y: newY });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, size, taskbarHeight]);

  if (win.isMinimized || !isInitialized) return null;

  const style: React.CSSProperties = win.isMaximized 
    ? { top: 0, left: 0, right: 0, bottom: 0, zIndex: win.zIndex, position: 'absolute' }
    : { 
        top: pos.y, 
        left: pos.x, 
        width: `${size.width}px`, 
        height: `${size.height}px`, 
        zIndex: win.zIndex,
        position: 'absolute'
      };

  return (
    <div 
      className={`flex flex-col bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden transition-[border-radius] duration-200 ${win.isMaximized ? '' : 'rounded-lg'}`}
      style={style}
      onMouseDown={() => onFocus()}
      onContextMenu={(e) => {
        e.stopPropagation();
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
      }}
    >
      {/* Barra de Título */}
      <div 
        className="window-drag-handle h-10 bg-zinc-800/50 backdrop-blur flex items-center justify-between px-4 cursor-default select-none flex-shrink-0"
        onMouseDown={handleMouseDown}
        onDoubleClick={onMaximize}
      >
        <div className="flex items-center gap-2 truncate pointer-events-none">
          <span className="text-xs font-medium text-zinc-300 truncate">{win.title}</span>
        </div>
        
        <div className="flex items-center gap-1.5 ml-4">
          <button 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            className="p-1.5 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onMaximize(); }}
            className="p-1.5 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors"
          >
            {win.isMaximized ? <Square className="w-3 h-3" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="p-1.5 hover:bg-rose-500/80 rounded-md text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-hidden relative bg-zinc-900">
        {children}
      </div>

      {isDragging && <div className="absolute inset-0 z-[9999] cursor-move"></div>}
    </div>
  );
};

export default Window;
