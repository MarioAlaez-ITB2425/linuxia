
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { User, WindowState, FileItem, AppType } from '../types';
import Taskbar from './Taskbar';
import Window from './Window';
import DesktopIcon from './DesktopIcon';
import ContextMenu from './ContextMenu';

// App Implementations
import PaintApp from './apps/PaintApp';
import BrowserApp from './apps/BrowserApp';
import SnakeApp from './apps/SnakeApp';
import MinesweeperApp from './apps/MinesweeperApp';
import CalculatorApp from './apps/CalculatorApp';
import TerminalApp from './apps/TerminalApp';
import NotepadApp from './apps/NotepadApp';
import MusicApp from './apps/MusicApp';
import SettingsApp from './apps/SettingsApp';
import FolderApp from './apps/FolderApp';
import ImageViewerApp from './apps/ImageViewerApp';
import ParticlesApp from './apps/ParticlesApp';
import MinecraftApp from './apps/MinecraftApp';
import SolarSystemApp from './apps/SolarSystemApp';
import DoomApp from './apps/DoomApp';
import PacmanApp from './apps/PacmanApp';
import BookApp from './apps/BookApp';
import RayTracingApp from './apps/RayTracingApp';
import CitySimApp from './apps/CitySimApp';
import CyberQuizApp from './apps/CyberQuizApp';
import WebEditorApp from './apps/WebEditorApp';
import BlackjackApp from './apps/BlackjackApp';
import TetrisApp from './apps/TetrisApp';
import Cyber2048App from './apps/Cyber2048App';

const WALLPAPERS = [
  'https://picsum.photos/id/10/1920/1080',
  'https://picsum.photos/id/15/1920/1080',
  'https://picsum.photos/id/20/1920/1080'
];

const GRID_CELL_WIDTH = 100;
const GRID_CELL_HEIGHT = 110;

interface DesktopEnvironmentProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onPowerAction: (action: 'shutdown' | 'restart') => void;
}

const INITIAL_FILES: FileItem[] = [
  { id: 'app-webeditor', name: 'Web Studio', type: 'app', appType: 'webeditor', parentId: null, x: 10, y: 10 },
  { id: 'app-tetris', name: 'Matrix Tetris', type: 'app', appType: 'tetris', parentId: null, x: 10, y: 120 },
  { id: 'app-blackjack', name: 'Cyber Jack', type: 'app', appType: 'blackjack', parentId: null, x: 10, y: 230 },
  { id: 'app-2048', name: 'Cyber 2048', type: 'app', appType: 'cyber2048', parentId: null, x: 10, y: 340 },
  { id: 'app-cyberquiz', name: 'CyberQuiz', type: 'app', appType: 'cyberquiz', parentId: null, x: 110, y: 10 },
  { id: 'app-citysim', name: 'MarioCity', type: 'app', appType: 'citysim', parentId: null, x: 110, y: 120 },
  { id: 'app-doom', name: 'Doom 1993', type: 'app', appType: 'doom', parentId: null, x: 110, y: 230 },
  { id: 'app-pacman', name: 'Pacman', type: 'app', appType: 'pacman', parentId: null, x: 110, y: 340 },
];

const DesktopEnvironment: React.FC<DesktopEnvironmentProps> = ({ user, onUpdateUser, onPowerAction }) => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);
  const [wallpaper, setWallpaper] = useState(WALLPAPERS[0]);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, targetId?: string } | null>(null);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(10);
  const desktopRef = useRef<HTMLDivElement>(null);

  const openApp = useCallback((type: AppType, params?: any) => {
    setWindows(prev => {
      const windowId = (type === 'files' || type === 'paint' || type === 'viewer' || type === 'notepad') && params?.id 
        ? `window-${type}-${params.id}` 
        : `window-${type}`;

      const existing = prev.find(w => w.id === windowId);
      
      if (existing) {
        return prev.map(w => w.id === windowId 
          ? { ...w, isOpen: true, isMinimized: false, zIndex: maxZIndex + 1, params: { ...w.params, ...params } } 
          : w
        );
      }

      let defaultWidth = 800;
      let defaultHeight = 550;

      switch(type) {
        case 'webeditor':
          defaultWidth = 1100;
          defaultHeight = 700;
          break;
        case 'tetris':
          defaultWidth = 450;
          defaultHeight = 700;
          break;
        case 'blackjack':
          defaultWidth = 800;
          defaultHeight = 600;
          break;
        case 'cyber2048':
          defaultWidth = 500;
          defaultHeight = 700;
          break;
        case 'calculator':
          defaultWidth = 340;
          defaultHeight = 550;
          break;
        case 'paint':
        case 'browser':
        case 'viewer':
          defaultWidth = 900;
          defaultHeight = 650;
          break;
        case 'terminal':
          defaultWidth = 700;
          defaultHeight = 450;
          break;
        case 'minesweeper':
          defaultWidth = 400;
          defaultHeight = 550;
          break;
        case 'pacman':
          defaultWidth = 500;
          defaultHeight = 650;
          break;
        case 'book':
          defaultWidth = 850;
          defaultHeight = 600;
          break;
        case 'cyberquiz':
          defaultWidth = 1000;
          defaultHeight = 700;
          break;
        case 'citysim':
          defaultWidth = 1100;
          defaultHeight = 750;
          break;
        case 'raytracing':
        case 'solarsystem':
        case 'particles':
        case 'minecraft':
        case 'doom':
          defaultWidth = 1000;
          defaultHeight = 700;
          break;
      }

      return [...prev, {
        id: windowId,
        type,
        title: params?.name || type.charAt(0).toUpperCase() + type.slice(1),
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        zIndex: maxZIndex + 1,
        params,
        defaultWidth,
        defaultHeight
      }];
    });
    setMaxZIndex(z => z + 1);
  }, [maxZIndex]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  const toggleMinimize = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: !w.isMinimized } : w));
  }, []);

  const toggleMaximize = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: maxZIndex + 1, isMinimized: false } : w));
    setMaxZIndex(z => z + 1);
  }, [maxZIndex]);

  const handleContextMenu = (e: React.MouseEvent, targetId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (targetId) {
      const targetFile = files.find(f => f.id === targetId);
      if (targetFile?.type === 'app') {
        return;
      }
    }
    
    setContextMenu({ x: e.clientX, y: e.clientY, targetId });
  };

  const findNextAvailablePos = useCallback(() => {
    const desktopWidth = window.innerWidth;
    const desktopHeight = window.innerHeight - 48;
    
    const cols = Math.floor(desktopWidth / GRID_CELL_WIDTH);
    const rows = Math.floor(desktopHeight / GRID_CELL_HEIGHT);

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = c * GRID_CELL_WIDTH + 10;
        const y = r * GRID_CELL_HEIGHT + 10;
        const isOccupied = files.some(f => f.parentId === null && f.x === x && f.y === y);
        if (!isOccupied) return { x, y };
      }
    }
    return { x: 10, y: 10 };
  }, [files]);

  const createFolder = (name: string = 'New Folder') => {
    let x, y;
    if (contextMenu) {
      const rect = desktopRef.current?.getBoundingClientRect();
      const relativeX = contextMenu.x - (rect?.left || 0);
      const relativeY = contextMenu.y - (rect?.top || 0);
      const snappedX = Math.floor(relativeX / GRID_CELL_WIDTH) * GRID_CELL_WIDTH + 10;
      const snappedY = Math.floor(relativeY / GRID_CELL_HEIGHT) * GRID_CELL_HEIGHT + 10;
      const isOccupied = files.some(f => f.parentId === null && f.x === snappedX && f.y === snappedY);
      if (isOccupied) {
        const nextPos = findNextAvailablePos();
        x = nextPos.x; y = nextPos.y;
      } else {
        x = snappedX; y = snappedY;
      }
    } else {
      const nextPos = findNextAvailablePos();
      x = nextPos.x; y = nextPos.y;
    }

    const newFolder: FileItem = {
      id: `folder-${Date.now()}`,
      name: name,
      type: 'folder',
      parentId: null,
      x, y
    };
    setFiles(prev => [...prev, newFolder]);
    setContextMenu(null);
  };

  const renameFile = (id: string, newName: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
    setWindows(prev => prev.map(w => {
      if (w.params?.id === id) {
        return { ...w, title: newName, params: { ...w.params, name: newName } };
      }
      return w;
    }));
    setEditingFileId(null);
  };

  const deleteFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setWindows(prev => prev.filter(w => w.params?.id !== id));
    setContextMenu(null);
  };

  const deleteFileByName = (name: string) => {
    const fileToDelete = files.find(f => f.name.toLowerCase() === name.toLowerCase() && f.parentId === null);
    if (fileToDelete) {
      deleteFile(fileToDelete.id);
      return true;
    }
    return false;
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    const fileId = e.dataTransfer.getData('fileId');
    if (!fileId) return;
    if (fileId === targetFolderId) return;

    setFiles(prev => prev.map(f => {
      if (f.id === fileId) {
        if (targetFolderId === null) {
          const rect = desktopRef.current?.getBoundingClientRect();
          const rawX = e.clientX - (rect?.left || 0) - 40;
          const rawY = e.clientY - (rect?.top || 0) - 40;
          const snappedX = Math.round(rawX / GRID_CELL_WIDTH) * GRID_CELL_WIDTH + 10;
          const snappedY = Math.round(rawY / GRID_CELL_HEIGHT) * GRID_CELL_HEIGHT + 10;
          return { ...f, parentId: null, x: Math.max(10, snappedX), y: Math.max(10, snappedY) };
        }
        return { ...f, parentId: targetFolderId };
      }
      return f;
    }));
  };

  const saveDrawing = (dataUrl: string) => {
    const newFile: FileItem = {
      id: `file-${Date.now()}`,
      name: `Drawing ${new Date().toLocaleTimeString()}`,
      type: 'image',
      content: dataUrl,
      parentId: null,
      x: 210, y: 10
    };
    setFiles(prev => [...prev, newFile]);
  };

  const saveTextFile = (id: string | null, title: string, content: string) => {
    if (id) {
      setFiles(prev => prev.map(f => f.id === id ? { ...f, name: title, content } : f));
      setWindows(prev => prev.map(w => {
        if (w.params?.id === id) return { ...w, title: title, params: { ...w.params, name: title, content } };
        return w;
      }));
    } else {
      const newId = `text-${Date.now()}`;
      const newFile: FileItem = {
        id: newId,
        name: title.endsWith('.txt') ? title : `${title}.txt`,
        type: 'text',
        content: content,
        parentId: null,
        x: 210, y: 120
      };
      setFiles(prev => [...prev, newFile]);
    }
  };

  return (
    <div 
      ref={desktopRef}
      className="w-full h-full flex flex-col bg-cover bg-center overflow-hidden transition-all duration-700"
      style={{ backgroundImage: `url(${wallpaper})` }}
      onContextMenu={(e) => handleContextMenu(e)}
      onClick={() => {
        setContextMenu(null);
        setEditingFileId(null);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleDrop(e, null)}
    >
      <div className="flex-1 relative">
        {files.filter(f => f.parentId === null).map(file => (
          <DesktopIcon 
            key={file.id} 
            file={file} 
            isEditing={editingFileId === file.id}
            onOpen={() => {
              if (file.type === 'app' && file.appType) openApp(file.appType, file);
              else if (file.type === 'folder') openApp('files', file);
              else if (file.type === 'image') openApp('viewer', { image: file.content, id: file.id, name: file.name });
              else if (file.type === 'text') openApp('notepad', { content: file.content, name: file.name, id: file.id });
            }}
            onDrop={handleDrop}
            onContextMenu={(e) => handleContextMenu(e, file.id)}
            onRenameComplete={(newName) => renameFile(file.id, newName)}
          />
        ))}

        {windows.map(win => (
          <Window 
            key={win.id} 
            window={win} 
            onClose={() => closeWindow(win.id)}
            onMinimize={() => toggleMinimize(win.id)}
            onMaximize={() => toggleMaximize(win.id)}
            onFocus={() => focusWindow(win.id)}
          >
            {win.type === 'paint' && <PaintApp onSave={saveDrawing} initialImage={win.params?.image} />}
            {win.type === 'browser' && <BrowserApp />}
            {win.type === 'snake' && <SnakeApp />}
            {win.type === 'minesweeper' && <MinesweeperApp />}
            {win.type === 'calculator' && <CalculatorApp />}
            {win.type === 'terminal' && (
              <TerminalApp 
                user={user} 
                onOpenApp={openApp} 
                files={files} 
                onCreateFolder={createFolder} 
                onDeleteFile={deleteFileByName} 
              />
            )}
            {win.type === 'notepad' && (
              <NotepadApp 
                onSave={saveTextFile} 
                initialId={win.params?.id}
                initialContent={win.params?.content} 
                initialTitle={win.params?.name} 
              />
            )}
            {win.type === 'music' && <MusicApp />}
            {win.type === 'viewer' && <ImageViewerApp image={win.params?.image} />}
            {win.type === 'particles' && <ParticlesApp />}
            {win.type === 'minecraft' && <MinecraftApp />}
            {win.type === 'solarsystem' && <SolarSystemApp />}
            {win.type === 'doom' && <DoomApp />}
            {win.type === 'pacman' && <PacmanApp />}
            {win.type === 'book' && <BookApp />}
            {win.type === 'raytracing' && <RayTracingApp />}
            {win.type === 'citysim' && <CitySimApp />}
            {win.type === 'cyberquiz' && <CyberQuizApp />}
            {win.type === 'webeditor' && <WebEditorApp />}
            {win.type === 'blackjack' && <BlackjackApp />}
            {win.type === 'tetris' && <TetrisApp />}
            {win.type === 'cyber2048' && <Cyber2048App />}
            {win.type === 'settings' && (
              <SettingsApp 
                user={user}
                onUpdateUser={onUpdateUser}
                currentWallpaper={wallpaper} 
                setWallpaper={setWallpaper} 
                wallpapers={WALLPAPERS} 
              />
            )}
            {win.type === 'files' && (
              <FolderApp 
                folder={win.params} 
                files={files} 
                editingFileId={editingFileId}
                onOpenApp={openApp} 
                onDrop={handleDrop}
                onContextMenu={handleContextMenu}
                onRenameComplete={renameFile}
              />
            )}
          </Window>
        ))}
      </div>

      <Taskbar 
        windows={windows} 
        onFocusWindow={focusWindow}
        onOpenApp={openApp}
        onPowerAction={onPowerAction}
        user={user}
      />

      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          targetId={contextMenu.targetId}
          onClose={() => setContextMenu(null)}
          onNewFolder={() => createFolder()}
          onWallpaperChange={() => openApp('settings')}
          onRename={() => {
            if (contextMenu.targetId) setEditingFileId(contextMenu.targetId);
            setContextMenu(null);
          }}
          onDelete={() => {
            if (contextMenu.targetId) deleteFile(contextMenu.targetId);
          }}
        />
      )}
    </div>
  );
};

export default DesktopEnvironment;
