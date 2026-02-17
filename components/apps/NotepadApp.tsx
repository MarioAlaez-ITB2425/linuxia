
import React, { useState, useEffect } from 'react';
import { Save, FileText } from 'lucide-react';

interface NotepadAppProps {
  onSave?: (id: string | null, title: string, content: string) => void;
  initialId?: string;
  initialTitle?: string;
  initialContent?: string;
}

const NotepadApp: React.FC<NotepadAppProps> = ({ onSave, initialId, initialTitle, initialContent }) => {
  const [content, setContent] = useState(initialContent || '');
  const [title, setTitle] = useState(initialTitle || 'untitled.txt');
  const [id, setId] = useState<string | null>(initialId || null);

  // Sync state if initial props change (e.g. from external updates)
  useEffect(() => {
    if (initialContent !== undefined) setContent(initialContent);
    if (initialTitle !== undefined) setTitle(initialTitle);
    if (initialId !== undefined) setId(initialId);
  }, [initialId, initialTitle, initialContent]);

  const handleSave = () => {
    if (onSave) {
      onSave(id, title, content);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      <div className="flex items-center justify-between p-2 border-b border-white/5 bg-zinc-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded text-xs text-zinc-400">
            <FileText className="w-3.5 h-3.5" />
            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent border-none outline-none focus:ring-0 w-48 p-0"
              placeholder="Filename..."
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-xs text-white font-medium transition-colors shadow-lg shadow-emerald-900/20"
          >
            <Save className="w-3.5 h-3.5" /> Save
          </button>
        </div>
      </div>
      <textarea 
        autoFocus
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start typing..."
        className="flex-1 bg-transparent p-6 text-zinc-300 outline-none resize-none font-mono text-sm leading-relaxed"
      />
      <div className="px-4 py-1 text-[10px] text-zinc-600 bg-zinc-800/50 uppercase tracking-widest border-t border-white/5">
        UTF-8 | LF | Lines: {content.split('\n').length} | Words: {content.trim().split(/\s+/).filter(x => x).length}
      </div>
    </div>
  );
};

export default NotepadApp;
