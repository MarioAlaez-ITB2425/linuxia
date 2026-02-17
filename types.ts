
export type SystemStatus = 'off' | 'booting' | 'login' | 'desktop';

export interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'app' | 'image' | 'text';
  icon?: string;
  appType?: AppType;
  content?: string; // For text files or base64 images
  parentId: string | null; // null for desktop
  x: number;
  y: number;
}

export type AppType = 
  | 'paint' 
  | 'browser' 
  | 'snake' 
  | 'minesweeper' 
  | 'calculator' 
  | 'terminal' 
  | 'notepad' 
  | 'music' 
  | 'settings'
  | 'files' 
  | 'viewer'
  | 'particles'
  | 'minecraft'
  | 'solarsystem'
  | 'doom'
  | 'pacman'
  | 'book'
  | 'raytracing'
  | 'citysim'
  | 'cyberquiz'
  | 'webeditor'
  | 'blackjack'
  | 'tetris'
  | 'cyber2048';

export interface WindowState {
  id: string;
  type: AppType;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  params?: any;
  defaultWidth?: number;
  defaultHeight?: number;
}

export interface User {
  username: string;
  avatar: string;
}
