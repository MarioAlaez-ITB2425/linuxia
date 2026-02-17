
import React, { useState, useEffect } from 'react';
import { Menu, Search, Power, Settings, RefreshCw, Cpu, Monitor, Palette, Globe, Gamepad2, LayoutPanelLeft, Calculator, Terminal, FileText, Music, Sparkles, Box, Sun, Ghost, CircleUser, Book, Camera, Building2, ShieldQuestion, Code2, Spade, Grid3X3, Hash } from 'lucide-react';
import { WindowState, User, AppType } from '../types';

interface TaskbarProps {
  windows: WindowState[];
  onFocusWindow: (id: string) => void;
  onOpenApp: (type: AppType, params?: any) => void;
  onPowerAction: (action: 'shutdown' | 'restart') => void;
  user: User;
}

const ALL_APPS: { type: AppType, name: string, icon: any, color: string }[] = [
  { type: 'webeditor', name: 'Web Studio', icon: Code2, color: 'text-blue-400' },
  { type: 'tetris', name: 'Matrix Tetris', icon: Grid3X3, color: 'text-purple-400' },
  { type: 'blackjack', name: 'Cyber Jack', icon: Spade, color: 'text-rose-500' },
  { type: 'cyber2048', name: 'Cyber 2048', icon: Hash, color: 'text-amber-500' },
  { type: 'cyberquiz', name: 'CyberQuiz', icon: ShieldQuestion, color: 'text-rose-500' },
  { type: 'citysim', name: 'MarioCity', icon: Building2, color: 'text-sky-400' },
  { type: 'raytracing', name: 'Ray Tracing', icon: Camera, color: 'text-emerald-400' },
  { type: 'book', name: 'Manel: La Llamada', icon: Book, color: 'text-amber-600' },
  { type: 'solarsystem', name: 'Cosmos 3D', icon: Sun, color: 'text-orange-400' },
  { type: 'pacman', name: 'Pac-Man', icon: CircleUser, color: 'text-yellow-400' },
  { type: 'doom', name: 'Doom 1993', icon: Ghost, color: 'text-rose-600' },
  { type: 'browser', name: 'Web Browser', icon: Globe, color: 'text-indigo-400' },
  { type: 'paint', name: 'Paint', icon: Palette, color: 'text-pink-400' },
  { type: 'snake', name: 'Snake', icon: Gamepad2, color: 'text-emerald-400' },
  { type: 'minesweeper', name: 'Minesweeper', icon: LayoutPanelLeft, color: 'text-blue-400' },
  { type: 'particles', name: 'Particles', icon: Sparkles, color: 'text-cyan-400' },
  { type: 'minecraft', name: 'MarioCraft', icon: Box, color: 'text-emerald-600' },
  { type: 'calculator', name: 'Calculator', icon: Calculator, color: 'text-amber-400' },
  { type: 'terminal', name: 'Terminal', icon: Terminal, color: 'text-zinc-300' },
  { type: 'notepad', name: 'Text Editor', icon: FileText, color: 'text-zinc-400' },
  { type: 'music', name: 'Music', icon: Music, color: 'text-purple-400' },
  { type: 'settings', name: 'Settings', icon: Settings, color: 'text-zinc-500' },
];

const Taskbar: React.FC<TaskbarProps> = ({ windows, onFocusWindow, onOpenApp, onPowerAction, user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredApps = ALL_APPS.filter(app => 
    app.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-12 w-full bg-zinc-900/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-between px-2 z-[9999]">
      <div className="flex items-center gap-1">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-2 rounded-md hover:bg-white/10 transition-colors ${isMenuOpen ? 'bg-white/10 text-blue-400' : 'text-zinc-400'}`}
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="h-6 w-px bg-white/10 mx-1"></div>

        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {windows.map(win => (
            <button 
              key={win.id}
              onClick={() => onFocusWindow(win.id)}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 max-w-[150px] transition-all whitespace-nowrap overflow-hidden ${
                !win.isMinimized && win.zIndex >= 10 ? 'bg-white/15 border border-white/10' : 'hover:bg-white/5 opacity-60'
              }`}
            >
              <span className={`text-xs font-medium truncate ${!win.isMinimized ? 'text-white' : 'text-zinc-400'}`}>{win.title}</span>
              {win.isMinimized && <div className="w-1 h-1 bg-zinc-500 rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 px-3">
        <div className="flex flex-col items-end">
          <span className="text-xs font-medium text-zinc-300 leading-none">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-[10px] text-zinc-500">
            {time.toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {isMenuOpen && (
        <>
          <div className="fixed inset-0 z-[-1]" onClick={() => setIsMenuOpen(false)}></div>
          <div className="absolute bottom-14 left-2 w-96 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="p-6 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={user.avatar} className="w-12 h-12 rounded-full border-2 border-white/10" alt="User" />
                <div>
                  <div className="font-bold text-lg">{user.username}</div>
                  <div className="text-xs text-zinc-400">Online</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onPowerAction('restart')} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-blue-400" title="Restart">
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button onClick={() => onPowerAction('shutdown')} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-rose-400" title="Shutdown">
                  <Power className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-4 py-3">
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-zinc-500" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Search apps..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[400px] px-4 py-2 grid grid-cols-2 gap-2 pb-6">
              {filteredApps.map(app => (
                <button 
                  key={app.type}
                  onClick={() => { onOpenApp(app.type); setIsMenuOpen(false); }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group text-left"
                >
                  <div className={`p-2 rounded-lg bg-zinc-800 transition-transform group-active:scale-90 ${app.color}`}>
                    <app.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-zinc-300">{app.name}</span>
                </button>
              ))}
            </div>

            <div className="p-4 bg-white/5 border-t border-white/5 flex justify-between text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              <div className="flex items-center gap-1"><Cpu className="w-3 h-3" /> Mario-CPU 3.2GHz</div>
              <div className="flex items-center gap-1"><Monitor className="w-3 h-3" /> v1.0.5 Release</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Taskbar;
