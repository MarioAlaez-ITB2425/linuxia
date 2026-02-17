
import React from 'react';
import { FolderPlus, Image as ImageIcon, Terminal, Edit2, Trash2 } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  targetId?: string;
  onClose: () => void;
  onNewFolder: () => void;
  onWallpaperChange: () => void;
  onRename: () => void;
  onDelete: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, targetId, onNewFolder, onWallpaperChange, onRename, onDelete }) => {
  return (
    <div 
      className="fixed z-[99999] w-56 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      {targetId ? (
        <>
          <button 
            onClick={onRename}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition-colors text-sm text-zinc-300"
          >
            <Edit2 className="w-4 h-4 text-emerald-400" />
            Rename
          </button>
          <button 
            onClick={onDelete}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition-colors text-sm text-zinc-300 text-rose-400"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <div className="h-px bg-white/10 my-1 mx-2"></div>
        </>
      ) : (
        <button 
          onClick={onNewFolder}
          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition-colors text-sm text-zinc-300"
        >
          <FolderPlus className="w-4 h-4 text-sky-400" />
          New Folder
        </button>
      )}
      
      <button 
        onClick={onWallpaperChange}
        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition-colors text-sm text-zinc-300"
      >
        <ImageIcon className="w-4 h-4 text-rose-400" />
        Change Wallpaper
      </button>
      <div className="h-px bg-white/10 my-1 mx-2"></div>
      <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition-colors text-sm text-zinc-300">
        <Terminal className="w-4 h-4 text-emerald-400" />
        Open Terminal here
      </button>
    </div>
  );
};

export default ContextMenu;
