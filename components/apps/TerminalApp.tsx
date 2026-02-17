
import React, { useState, useRef, useEffect } from 'react';
import { User, AppType, FileItem } from '../../types';

interface TerminalAppProps {
  user: User;
  onOpenApp: (type: AppType, params?: any) => void;
  files: FileItem[];
  onCreateFolder: (name: string) => void;
  onDeleteFile: (name: string) => boolean;
}

const TerminalApp: React.FC<TerminalAppProps> = ({ user, onOpenApp, files, onCreateFolder, onDeleteFile }) => {
  const [history, setHistory] = useState<string[]>(['Welcome to MarioOS Kernel v1.0.5-LTS', 'Type "help" to see available commands.']);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Asegurar que el foco se mantenga al abrir la app
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const rawInput = input.trim();
    if (!rawInput) return;

    const parts = rawInput.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    let newHistory = [...history, `${user.username}@mario-os:~$ ${rawInput}`];

    switch (cmd) {
      case 'help':
        newHistory.push('Comandos disponibles:');
        newHistory.push('  ls            - Lista los archivos y carpetas del escritorio.');
        newHistory.push('  mkdir [name]  - Crea una nueva carpeta en el escritorio.');
        newHistory.push('  rm [name]     - Elimina un archivo o carpeta del escritorio.');
        newHistory.push('  nano [file]   - Abre el editor de texto (Notepad).');
        newHistory.push('  clear         - Limpia la pantalla de la terminal.');
        newHistory.push('  whoami        - Muestra el usuario actual.');
        newHistory.push('  date          - Muestra la fecha y hora actual.');
        newHistory.push('  neofetch      - Muestra información del sistema.');
        break;

      case 'ls':
        const desktopFiles = files.filter(f => f.parentId === null);
        if (desktopFiles.length === 0) {
          newHistory.push('(Escritorio vacío)');
        } else {
          const list = desktopFiles.map(f => {
            const type = f.type === 'folder' ? '[DIR] ' : '[FILE]';
            return `${type} ${f.name}`;
          }).join('\n');
          newHistory.push(list);
        }
        break;

      case 'mkdir':
        if (args.length === 0) {
          newHistory.push('mkdir: falta un operando (nombre de carpeta)');
        } else {
          const folderName = args.join(' ');
          onCreateFolder(folderName);
          newHistory.push(`Carpeta '${folderName}' creada exitosamente.`);
        }
        break;

      case 'rm':
        if (args.length === 0) {
          newHistory.push('rm: falta un operando (nombre del archivo/carpeta)');
        } else {
          const targetName = args.join(' ');
          const success = onDeleteFile(targetName);
          if (success) {
            newHistory.push(`'${targetName}' ha sido eliminado.`);
          } else {
            newHistory.push(`rm: no se pudo encontrar '${targetName}' en el escritorio.`);
          }
        }
        break;

      case 'nano':
        const fileName = args.length > 0 ? args.join(' ') : 'untitled.txt';
        const existingFile = files.find(f => f.name.toLowerCase() === fileName.toLowerCase());
        if (existingFile && existingFile.type === 'text') {
           onOpenApp('notepad', existingFile);
        } else {
           onOpenApp('notepad', { name: fileName });
        }
        newHistory.push(`Abriendo editor para: ${fileName}`);
        break;

      case 'clear':
        setHistory([]);
        setInput('');
        return;

      case 'whoami':
        newHistory.push(user.username);
        break;

      case 'date':
        newHistory.push(new Date().toLocaleString());
        break;

      case 'neofetch':
        newHistory.push('      .---.      MarioOS 1.0.5-LTS');
        newHistory.push('     /     \\     -----------------');
        newHistory.push('    | () () |    Host: Linux Simulator');
        newHistory.push('     \\  ^  /     Kernel: 6.5.0-mario');
        newHistory.push('      |||||      Shell: bash 5.2.15');
        newHistory.push('      |||||      UI: GNOME / React');
        newHistory.push('      |||||      Theme: Dark-Modern');
        break;

      default:
        newHistory.push(`sh: ${cmd}: comando no encontrado. Escribe 'help' para ayuda.`);
    }

    setHistory(newHistory);
    setInput('');
  };

  return (
    <div 
      className="h-full bg-zinc-950 p-4 font-mono text-sm overflow-y-auto scrollbar-hide cursor-text"
      onClick={handleContainerClick}
    >
      <div className="space-y-1">
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-all text-emerald-500/90 leading-relaxed">
            {line}
          </div>
        ))}
      </div>
      <form onSubmit={handleCommand} className="flex items-center gap-2 mt-2">
        <span className="text-emerald-600 font-bold whitespace-nowrap">{user.username}@mario-os:~$</span>
        <input 
          ref={inputRef}
          autoFocus
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent outline-none text-emerald-300 border-none p-0 focus:ring-0"
          spellCheck={false}
          autoComplete="off"
        />
      </form>
      <div ref={bottomRef} />
    </div>
  );
};

export default TerminalApp;
