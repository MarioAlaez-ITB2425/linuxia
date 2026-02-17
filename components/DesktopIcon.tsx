
import React, { useState, useEffect, useRef } from 'react';
import { Folder, Palette, Gamepad2, LayoutPanelLeft, Calculator, Terminal, FileText, Music, Settings, Globe, Image as ImageIcon, Sparkles, Box, Sun, Ghost, CircleUser, Book, Camera, Building2, ShieldQuestion, Code2, Spade, Grid3X3, Hash } from 'lucide-react';
import { FileItem } from '../types';

interface DesktopIconProps {
  file: FileItem;
  isEditing?: boolean;
  onOpen: () => void;
  onDrop?: (e: React.DragEvent, targetFolderId: string) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onRenameComplete?: (newName: string) => void;
}

const getIcon = (type: string, appType?: string) => {
  if (type === 'folder') return <Folder className="w-10 h-10 text-sky-400 fill-sky-400/20" />;
  if (type === 'image') return <ImageIcon className="w-10 h-10 text-rose-400" />;
  
  switch (appType) {
    case 'webeditor': return <Code2 className="w-10 h-10 text-blue-400" />;
    case 'tetris': return <Grid3X3 className="w-10 h-10 text-purple-400" />;
    case 'blackjack': return <Spade className="w-10 h-10 text-rose-500" />;
    case 'cyber2048': return <Hash className="w-10 h-10 text-amber-500" />;
    case 'paint': return <Palette className="w-10 h-10 text-rose-500" />;
    case 'snake': return <Gamepad2 className="w-10 h-10 text-emerald-500" />;
    case 'minesweeper': return <LayoutPanelLeft className="w-10 h-10 text-blue-500" />;
    case 'calculator': return <Calculator className="w-10 h-10 text-amber-500" />;
    case 'terminal': return <Terminal className="w-10 h-10 text-zinc-300" />;
    case 'notepad': return <FileText className="w-10 h-10 text-zinc-400" />;
    case 'music': return <Music className="w-10 h-10 text-purple-500" />;
    case 'settings': return <Settings className="w-10 h-10 text-zinc-500" />;
    case 'browser': return <Globe className="w-10 h-10 text-indigo-500" />;
    case 'particles': return <Sparkles className="w-10 h-10 text-cyan-400" />;
    case 'minecraft': return <Box className="w-10 h-10 text-emerald-600" />;
    case 'solarsystem': return <Sun className="w-10 h-10 text-orange-400" />;
    case 'doom': return <Ghost className="w-10 h-10 text-rose-600" />;
    case 'pacman': return <CircleUser className="w-10 h-10 text-yellow-400" />;
    case 'book': return <Book className="w-10 h-10 text-amber-600" />;
    case 'raytracing': return <Camera className="w-10 h-10 text-emerald-400" />;
    case 'citysim': return <Building2 className="w-10 h-10 text-sky-500" />;
    case 'cyberquiz': return <ShieldQuestion className="w-10 h-10 text-rose-500" />;
    default: return <FileText className="w-10 h-10 text-zinc-400" />;
  }
};

const DesktopIcon: React.FC<DesktopIconProps> = ({ file, isEditing, onOpen, onDrop, onContextMenu, onRenameComplete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tempName, setTempName] = useState(file.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setTempName(file.name);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isEditing, file.name]);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('fileId', file.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (file.type === 'folder') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleDropLocal = (e: React.DragEvent) => {
    if (file.type === 'folder' && onDrop) {
      e.preventDefault();
      e.stopPropagation();
      onDrop(e, file.id);
      setIsHovered(false);
    }
  };

  const handleRenameSubmit = () => {
    if (onRenameComplete && tempName.trim()) {
      onRenameComplete(tempName.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameSubmit();
    if (e.key === 'Escape') setTempName(file.name);
  };

  return (
    <div 
      className="absolute group flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer transition-all active:scale-95 select-none w-20"
      style={{ left: file.x, top: file.y }}
      onDoubleClick={onOpen}
      onContextMenu={onContextMenu}
      draggable={!isEditing}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDropLocal}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`p-1 rounded-xl transition-all duration-300 ${isHovered ? (file.type === 'folder' ? 'bg-blue-500/20 shadow-lg scale-110 ring-2 ring-blue-500/50' : 'bg-white/10 shadow-lg scale-110') : ''}`}>
        {getIcon(file.type, file.appType)}
      </div>
      
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={handleKeyDown}
          className="text-[11px] w-full bg-blue-600 text-white text-center rounded outline-none px-0.5 border-none"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="text-[11px] font-medium text-center break-words w-full text-white drop-shadow-md line-clamp-2 px-1 rounded bg-black/10 group-hover:bg-black/40">
          {file.name}
        </span>
      )}
    </div>
  );
};

export default DesktopIcon;
