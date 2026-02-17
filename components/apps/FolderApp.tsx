
import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, LayoutGrid, List, Search, Star, Clock, Trash2, Folder, Image as ImageIcon, FileText, Globe, Gamepad2, LayoutPanelLeft, Calculator, Terminal, Music, Settings, Palette, Sun, Ghost, CircleUser } from 'lucide-react';
import { FileItem, AppType } from '../../types';

interface FolderAppProps {
  folder: FileItem;
  files: FileItem[];
  editingFileId: string | null;
  onOpenApp: (type: AppType, params?: any) => void;
  onDrop: (e: React.DragEvent, targetFolderId: string) => void;
  onContextMenu: (e: React.MouseEvent, targetId?: string) => void;
  onRenameComplete: (id: string, newName: string) => void;
}

const getIcon = (type: string, appType?: string) => {
  if (type === 'folder') return <Folder className="w-12 h-12 text-sky-400 fill-sky-400/20" />;
  if (type === 'image') return <ImageIcon className="w-12 h-12 text-rose-400" />;
  if (type === 'text') return <FileText className="w-12 h-12 text-zinc-400" />;
  
  switch (appType) {
    case 'paint': return <Palette className="w-12 h-12 text-rose-500" />;
    case 'snake': return <Gamepad2 className="w-12 h-12 text-emerald-500" />;
    case 'minesweeper': return <LayoutPanelLeft className="w-12 h-12 text-blue-500" />;
    case 'calculator': return <Calculator className="w-12 h-12 text-amber-500" />;
    case 'terminal': return <Terminal className="w-12 h-12 text-zinc-300" />;
    case 'notepad': return <FileText className="w-12 h-12 text-zinc-400" />;
    case 'music': return <Music className="w-12 h-12 text-purple-500" />;
    case 'settings': return <Settings className="w-12 h-12 text-zinc-500" />;
    case 'browser': return <Globe className="w-12 h-12 text-indigo-500" />;
    case 'solarsystem': return <Sun className="w-12 h-12 text-orange-400" />;
    case 'doom': return <Ghost className="w-12 h-12 text-rose-600" />;
    case 'pacman': return <CircleUser className="w-12 h-12 text-yellow-400" />;
    default: return <FileText className="w-12 h-12 text-zinc-400" />;
  }
};

const FolderApp: React.FC<FolderAppProps> = ({ folder, files, editingFileId, onOpenApp, onDrop, onContextMenu, onRenameComplete }) => {
  const contents = files.filter(f => f.parentId === folder.id);
  const [tempName, setTempName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const editingFile = contents.find(f => f.id === editingFileId);
    if (editingFile) {
      setTempName(editingFile.name);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [editingFileId, contents]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragStart = (e: React.DragEvent, fileId: string) => {
    e.dataTransfer.setData('fileId', fileId);
  };

  const handleRenameSubmit = (id: string) => {
    if (tempName.trim()) {
      onRenameComplete(id, tempName.trim());
    }
  };

  return (
    <div className="flex h-full bg-zinc-900 text-zinc-300 overflow-hidden">
      {/* Sidebar */}
      <div className="w-48 bg-zinc-950 border-r border-white/5 p-4 flex flex-col gap-2">
        <button className="flex items-center gap-3 px-3 py-2 bg-blue-600/10 text-blue-400 rounded-lg text-sm font-medium"><Star className="w-4 h-4" /> Favorites</button>
        <button className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg text-sm font-medium text-zinc-500"><Clock className="w-4 h-4" /> Recent</button>
        <button className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg text-sm font-medium text-zinc-500"><Trash2 className="w-4 h-4" /> Trash</button>
        <div className="h-px bg-white/5 my-4"></div>
        <div className="text-[10px] text-zinc-600 uppercase tracking-widest px-3 mb-2 font-bold">Devices</div>
        <button className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg text-sm font-medium text-zinc-500"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> System Root</button>
      </div>

      <div className="flex-1 flex-col">
        {/* Toolbar */}
        <div className="h-12 border-b border-white/5 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
            <span>Root</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-300">{folder.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600" />
              <input placeholder="Search files..." className="bg-white/5 border border-white/10 rounded-md pl-7 pr-3 py-1 text-[10px] outline-none" />
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 hover:bg-white/5 rounded"><LayoutGrid className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-white/5 rounded text-zinc-600"><List className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div 
          className="flex-1 p-6 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 auto-rows-max overflow-y-auto"
          onDragOver={handleDragOver}
          onDrop={(e) => onDrop(e, folder.id)}
          onContextMenu={(e) => onContextMenu(e)}
        >
          {contents.map(file => (
            <div 
              key={file.id}
              className="group flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer active:scale-95"
              onDoubleClick={() => {
                if (file.type === 'app' && file.appType) onOpenApp(file.appType, file);
                else if (file.type === 'folder') onOpenApp('files', file);
                else if (file.type === 'image') onOpenApp('viewer', { image: file.content, id: file.id, name: file.name });
                else if (file.type === 'text') onOpenApp('notepad', { content: file.content, name: file.name, id: file.id });
              }}
              onContextMenu={(e) => onContextMenu(e, file.id)}
              draggable={editingFileId !== file.id}
              onDragStart={(e) => handleDragStart(e, file.id)}
            >
              <div className="transition-transform group-hover:scale-110">
                {getIcon(file.type, file.appType)}
              </div>
              
              {editingFileId === file.id ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={() => handleRenameSubmit(file.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSubmit(file.id);
                    if (e.key === 'Escape') setTempName(file.name);
                  }}
                  className="text-[10px] w-full bg-blue-600 text-white text-center rounded outline-none border-none"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="text-[10px] font-medium text-center truncate w-full text-zinc-400 group-hover:text-zinc-200">{file.name}</span>
              )}
            </div>
          ))}

          {contents.length === 0 && (
            <div className="col-span-full h-full flex flex-col items-center justify-center opacity-20 py-20">
              <Folder className="w-20 h-20 mb-4" />
              <p className="font-bold uppercase tracking-widest text-xs">Folder is empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FolderApp;
