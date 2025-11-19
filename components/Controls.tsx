import React from 'react';
import { Play, Pause, Upload, Image as ImageIcon, Monitor, EyeOff } from 'lucide-react';
import { Theme } from '../types';

interface ControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onUploadMusic: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadCover: (e: React.ChangeEvent<HTMLInputElement>) => void;
  duration: number;
  currentTime: number;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hideUI: boolean;
  setHideUI: (hide: boolean) => void;
  theme: Theme;
}

const formatTime = (time: number) => {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  onPlayPause,
  onUploadMusic,
  onUploadCover,
  duration,
  currentTime,
  onSeek,
  hideUI,
  setHideUI,
  theme
}) => {
  return (
    <div className={`
      absolute bottom-0 w-full pt-12 pb-8 px-8 flex flex-col items-center gap-4 
      bg-gradient-to-t from-black via-black/95 to-transparent z-50
      transition-opacity duration-500
      ${hideUI ? 'opacity-0 pointer-events-none hover:opacity-100 hover:pointer-events-auto' : 'opacity-100'}
    `}>
      
      {/* 1. Progress Bar Section */}
      <div className="w-full max-w-3xl flex items-center gap-4 text-xs font-mono font-bold tracking-widest transition-colors duration-300" style={{ color: theme.primary }}>
        <span className="w-10 text-right opacity-70">{formatTime(currentTime)}</span>
        
        <div className="relative flex-1 h-1 group cursor-pointer">
           {/* Track Background */}
           <div className="absolute top-0 left-0 w-full h-full bg-zinc-800/50 rounded-full overflow-hidden backdrop-blur-sm">
              {/* Filled Part */}
              <div 
                className="h-full transition-all duration-100 ease-linear"
                style={{ 
                  width: `${(currentTime / (duration || 1)) * 100}%`,
                  backgroundColor: theme.primary,
                  boxShadow: `0 0 15px ${theme.primary}`
                }}
              ></div>
           </div>
           
           {/* Interactive Hit Area */}
           <div className="absolute -top-2 -bottom-2 w-full cursor-pointer"></div>

           {/* Input Range (Invisible but functional) */}
           <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={onSeek}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-20"
          />
        </div>
        
        <span className="w-10 text-zinc-500">{formatTime(duration)}</span>
      </div>

      {/* 2. Main Controls Row (Perfectly Centered Play Button) */}
      <div className="relative w-full max-w-4xl flex items-center justify-center mt-2 mb-2">
        
        {/* Left Group: Actions (Absolute to isolate width) */}
        <div className="absolute left-0 flex items-center gap-3">
           {/* Upload Music */}
           <div className="relative group">
            <input 
              type="file" 
              accept="audio/*" 
              onChange={(e) => {
                onUploadMusic(e);
                e.target.value = ''; // Reset input
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <button className="p-3 rounded-full bg-zinc-900/40 text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 transition-all backdrop-blur-md active:scale-95">
              <Upload size={18} />
            </button>
            <span className="absolute -top-10 left-0 text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-zinc-900/90 px-3 py-1.5 rounded border border-zinc-800 pointer-events-none backdrop-blur-md">
              上传音乐
            </span>
          </div>

          {/* Upload Cover */}
          <div className="relative group">
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => {
                onUploadCover(e);
                e.target.value = ''; // Reset input
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <button className="p-3 rounded-full bg-zinc-900/40 text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 transition-all backdrop-blur-md active:scale-95">
              <ImageIcon size={18} />
            </button>
            <span className="absolute -top-10 left-0 text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-zinc-900/90 px-3 py-1.5 rounded border border-zinc-800 pointer-events-none backdrop-blur-md">
              上传封面
            </span>
          </div>
        </div>

        {/* Center: Play/Pause (Centered by Flex Parent) */}
        <button 
          onClick={onPlayPause}
          className="relative group p-4 md:p-6 rounded-full transition-all active:scale-95 hover:scale-105 z-10"
        >
          {/* Glowing Background for Play Button */}
          <div 
            className="absolute inset-0 rounded-full opacity-20 blur-xl group-hover:opacity-50 transition-opacity duration-500"
            style={{ backgroundColor: theme.primary }}
          ></div>
          
          <div 
            className="relative z-10 bg-white text-black rounded-full p-4 md:p-5 shadow-2xl border-2 border-transparent group-hover:border-white/50 transition-colors"
            style={{ boxShadow: `0 0 30px -10px ${theme.primary}` }}
          >
            {isPlaying ? <Pause fill="black" size={28} className="md:w-8 md:h-8" /> : <Play fill="black" className="ml-1 md:w-8 md:h-8" size={28} />}
          </div>
        </button>

        {/* Right Group: Toggles (Absolute to isolate width) */}
        <div className="absolute right-0 flex items-center gap-3">
          <button 
            onClick={() => setHideUI(!hideUI)}
            className={`
              relative group p-3 rounded-full border transition-all backdrop-blur-md active:scale-95
              ${hideUI ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-600'}
            `}
          >
             {hideUI ? <EyeOff size={18} /> : <Monitor size={18} />}
             <span className="absolute -top-10 right-0 text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-zinc-900/90 px-3 py-1.5 rounded border border-zinc-800 pointer-events-none backdrop-blur-md">
              影院模式(按esc退出)
            </span>
          </button>
        </div>
      </div>
      
      {/* 3. Status Text */}
      <div 
        className="h-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.4em] font-bold opacity-50"
        style={{ color: theme.primary }}
      >
        {isPlaying && <span className="block w-1 h-1 rounded-full animate-ping bg-current"></span>}
        {isPlaying ? 'PLAYING' : 'PAUSED'}
        {isPlaying && <span className="block w-1 h-1 rounded-full animate-ping bg-current"></span>}
      </div>
    </div>
  );
};