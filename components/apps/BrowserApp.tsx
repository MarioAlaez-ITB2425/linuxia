
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, ShieldCheck, Search, Globe } from 'lucide-react';

const BrowserApp: React.FC = () => {
  const [url, setUrl] = useState('https://www.google.com/search?igu=1');
  const [input, setInput] = useState('https://www.google.com/search?igu=1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let target = input;
    if (!target.startsWith('http')) target = 'https://' + target;
    setUrl(target);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-zinc-300">
      <div className="flex flex-col gap-2 p-2 bg-zinc-800 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button className="p-1.5 hover:bg-white/5 rounded text-zinc-500"><ChevronLeft className="w-4 h-4" /></button>
            <button className="p-1.5 hover:bg-white/5 rounded text-zinc-500"><ChevronRight className="w-4 h-4" /></button>
            <button className="p-1.5 hover:bg-white/5 rounded"><RotateCw className="w-4 h-4" /></button>
          </div>
          
          <form onSubmit={handleSubmit} className="flex-1 flex items-center relative">
            <div className="absolute left-3 text-emerald-500">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-full pl-9 pr-12 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <div className="absolute right-3 flex items-center gap-2 text-zinc-500">
              <Globe className="w-3.5 h-3.5" />
            </div>
          </form>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">M</div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white">
        <iframe 
          src={url} 
          className="w-full h-full border-none"
          title="Browser View"
        />
      </div>

      <div className="hidden text-rose-500 p-4 text-center">
        Note: Many modern sites block iframe embedding for security reasons. Try using "google.com" or another site that allows embeds.
      </div>
    </div>
  );
};

export default BrowserApp;
