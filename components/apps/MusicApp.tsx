
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, ListMusic, Music, Loader2 } from 'lucide-react';

const TRACKS = [
  { 
    title: "Night in Kyoto", 
    artist: "Aviv Olivi", 
    duration: "2:45",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" // Audio real de prueba
  },
  { 
    title: "Cyber Dreams", 
    artist: "Mario OS Band", 
    duration: "7:02",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  { 
    title: "Terminal Echoes", 
    artist: "Root User", 
    duration: "5:30",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
];

const MusicApp: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Inicializar audio
  useEffect(() => {
    audioRef.current = new Audio(TRACKS[currentTrackIdx].url);
    audioRef.current.volume = volume;

    const audio = audioRef.current;

    const setAudioData = () => setDuration(audio.duration);
    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const onEnded = () => nextTrack();
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);

    return () => {
      audio.pause();
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
    };
  }, []);

  // Efecto para cambiar de canción
  useEffect(() => {
    if (!audioRef.current) return;
    
    const wasPlaying = isPlaying;
    audioRef.current.src = TRACKS[currentTrackIdx].url;
    audioRef.current.load();
    
    if (wasPlaying) {
      audioRef.current.play().catch(e => console.log("Error playing audio:", e));
    }
  }, [currentTrackIdx]);

  // Sincronizar volumen
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Interacción requerida:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrackIdx((prev) => (prev + 1) % TRACKS.length);
  };

  const prevTrack = () => {
    setCurrentTrackIdx((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) audioRef.current.currentTime = time;
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-zinc-300 select-none">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Vinyl/Cover Art */}
        <div className="relative w-48 h-48 mb-8 group">
          <div className={`absolute inset-0 bg-blue-600 rounded-full blur-3xl opacity-20 transition-opacity duration-1000 ${isPlaying ? 'opacity-40 animate-pulse' : 'opacity-10'}`}></div>
          <div className={`relative w-full h-full bg-zinc-800 rounded-full flex items-center justify-center border-4 border-zinc-700 shadow-2xl overflow-hidden ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.4)_100%)]"></div>
            <Music className={`w-16 h-16 text-blue-500 ${isPlaying ? 'drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'opacity-40'}`} />
            {/* El "agujero" del disco */}
            <div className="w-8 h-8 bg-zinc-900 rounded-full border-2 border-zinc-700 z-10"></div>
          </div>
        </div>

        {/* Info */}
        <div className="text-center mb-8 h-16">
          <h2 className="text-xl font-bold mb-1 text-white tracking-tight">{TRACKS[currentTrackIdx].title}</h2>
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">{TRACKS[currentTrackIdx].artist}</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-sm flex flex-col gap-2 mb-6">
          <div className="flex justify-between text-[10px] text-zinc-500 font-bold font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max={duration || 0} 
            value={currentTime}
            onChange={handleProgressChange}
            className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8">
          <button className="text-zinc-500 hover:text-white transition-colors"><Shuffle className="w-4 h-4" /></button>
          <button onClick={prevTrack} className="text-zinc-300 hover:text-white transition-colors active:scale-90"><SkipBack className="w-6 h-6 fill-current" /></button>
          
          <button 
            onClick={togglePlay}
            disabled={isLoading}
            className="w-16 h-16 bg-white text-zinc-900 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            {isLoading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 ml-1 fill-current" />
            )}
          </button>

          <button onClick={nextTrack} className="text-zinc-300 hover:text-white transition-colors active:scale-90"><SkipForward className="w-6 h-6 fill-current" /></button>
          <button className="text-zinc-500 hover:text-white transition-colors"><Repeat className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Volume & Playlist Footer */}
      <div className="p-4 bg-zinc-950/50 backdrop-blur-md border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3 group">
          <Volume2 className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-zinc-500 hover:accent-blue-500"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[9px] font-mono text-zinc-600 bg-black/40 px-2 py-1 rounded">
            BUFFERING_STABLE_V2
          </div>
          <button className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 transition-colors">
            <ListMusic className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style>{`
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: currentColor;
          cursor: pointer;
          border: 2px solid #18181b;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MusicApp;
