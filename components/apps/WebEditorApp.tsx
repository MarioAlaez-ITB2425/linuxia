
import React, { useState, useEffect, useRef } from 'react';
import { Play, Code2, Layout, FileJson, Save, Trash2, Eye } from 'lucide-react';

const WebEditorApp: React.FC = () => {
  const [html, setHtml] = useState('<h1>Hello MarioOS!</h1>\n<p>Edit me to see the magic.</p>\n<div class="box"></div>');
  const [css, setCss] = useState('body {\n  font-family: sans-serif;\n  background: #0a0a0a;\n  color: white;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  height: 100vh;\n  margin: 0;\n}\n\n.box {\n  width: 100px;\n  height: 100px;\n  background: #3b82f6;\n  border-radius: 20px;\n  animation: rotate 2s infinite linear;\n  margin-top: 20px;\n}\n\n@keyframes rotate {\n  from { transform: rotate(0deg); }\n  to { transform: rotate(360deg); }\n}');
  const [js, setJs] = useState('console.log("Web Studio is running!");\n\ndocument.body.onclick = () => {\n  alert("You clicked the body!");\n};');
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js' | 'preview'>('html');
  const [srcDoc, setSrcDoc] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(`
        <html>
          <head>
            <style>${css}</style>
          </head>
          <body>
            ${html}
            <script>${js}</script>
          </body>
        </html>
      `);
    }, 250);
    return () => clearTimeout(timeout);
  }, [html, css, js]);

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white font-mono">
      <div className="h-12 bg-zinc-900 border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex gap-1 bg-black/40 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('html')}
            className={`px-3 py-1 text-xs rounded-md transition-all ${activeTab === 'html' ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-zinc-400'}`}
          >
            INDEX.HTML
          </button>
          <button 
            onClick={() => setActiveTab('css')}
            className={`px-3 py-1 text-xs rounded-md transition-all ${activeTab === 'css' ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-zinc-400'}`}
          >
            STYLE.CSS
          </button>
          <button 
            onClick={() => setActiveTab('js')}
            className={`px-3 py-1 text-xs rounded-md transition-all ${activeTab === 'js' ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-zinc-400'}`}
          >
            SCRIPT.JS
          </button>
          <div className="w-px bg-white/10 mx-1"></div>
          <button 
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 text-xs rounded-md transition-all flex items-center gap-2 ${activeTab === 'preview' ? 'bg-emerald-600 text-white' : 'hover:bg-white/5 text-zinc-400'}`}
          >
            <Eye className="w-3 h-3" /> PREVIEW
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-white/5 rounded text-zinc-500"><Save className="w-4 h-4" /></button>
          <button className="p-2 hover:bg-rose-500/20 rounded text-rose-500"><Trash2 className="w-4 h-4" /></button>
          <div className="h-4 w-px bg-white/10"></div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">V-Studio Alpha</div>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {activeTab === 'html' && (
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            className="w-full h-full bg-transparent p-6 outline-none resize-none text-blue-300 leading-relaxed"
            spellCheck={false}
          />
        )}
        {activeTab === 'css' && (
          <textarea
            value={css}
            onChange={(e) => setCss(e.target.value)}
            className="w-full h-full bg-transparent p-6 outline-none resize-none text-emerald-300 leading-relaxed"
            spellCheck={false}
          />
        )}
        {activeTab === 'js' && (
          <textarea
            value={js}
            onChange={(e) => setJs(e.target.value)}
            className="w-full h-full bg-transparent p-6 outline-none resize-none text-amber-300 leading-relaxed"
            spellCheck={false}
          />
        )}
        {activeTab === 'preview' && (
          <iframe
            srcDoc={srcDoc}
            title="Preview"
            sandbox="allow-scripts"
            className="w-full h-full bg-white"
          />
        )}
      </div>

      <div className="h-8 bg-zinc-900 border-t border-white/5 flex items-center px-4 justify-between text-[10px] text-zinc-500">
        <div className="flex gap-4">
          <span>UTF-8</span>
          <span>Spaces: 2</span>
          <span>Engine: WebKit-Simulator</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          Live Server: Active
        </div>
      </div>
    </div>
  );
};

export default WebEditorApp;
