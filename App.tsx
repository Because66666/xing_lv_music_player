import React, { useState, useRef, useEffect, useCallback } from 'react';
const bgImage = new URL('./assets/background.png', import.meta.url).href;
import { VinylDisc } from './components/VinylDisc';
import { Controls } from './components/Controls';
import { Visualizer } from './components/Visualizer';
import { Track, AudioContextState, Theme } from './types';

// Predefined "Cool" Neon Themes
const THEMES: Theme[] = [
  { 
    id: 'cyber-blue', 
    primary: '#06b6d4', // Cyan-500
    secondary: '#3b82f6', // Blue-500
    accent: 'text-cyan-400',
    gradient: 'from-cyan-900/20 to-blue-900/20',
    shadow: 'shadow-cyan-500/50'
  },
  { 
    id: 'neon-pink', 
    primary: '#d946ef', // Fuchsia-500
    secondary: '#8b5cf6', // Violet-500
    accent: 'text-fuchsia-400',
    gradient: 'from-fuchsia-900/20 to-violet-900/20',
    shadow: 'shadow-fuchsia-500/50'
  },
  { 
    id: 'toxic-green', 
    primary: '#84cc16', // Lime-500
    secondary: '#10b981', // Emerald-500
    accent: 'text-lime-400',
    gradient: 'from-lime-900/20 to-emerald-900/20',
    shadow: 'shadow-lime-500/50'
  },
  { 
    id: 'sunset-orange', 
    primary: '#f97316', // Orange-500
    secondary: '#ef4444', // Red-500
    accent: 'text-orange-400',
    gradient: 'from-orange-900/20 to-red-900/20',
    shadow: 'shadow-orange-500/50'
  },
  {
    id: 'electric-purple',
    primary: '#a855f7', // Purple-500
    secondary: '#6366f1', // Indigo-500
    accent: 'text-purple-400',
    gradient: 'from-purple-900/20 to-indigo-900/20',
    shadow: 'shadow-purple-500/50'
  }
];

const App: React.FC = () => {
  const [track, setTrack] = useState<Track>({
    audioUrl: null,
    coverUrl: null,
    title: '星旅播放器',
    artist: '',
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [hideUI, setHideUI] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES[0]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContextState>({
    audioContext: null,
    analyser: null,
    source: null
  });
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  // Randomize theme on load
  useEffect(() => {
    randomizeTheme();
  }, []);

  

  const randomizeTheme = () => {
    const random = THEMES[Math.floor(Math.random() * THEMES.length)];
    setCurrentTheme(random);
  };

  const initAudioContext = useCallback(() => {
    if (!audioRef.current) return;
    if (audioContextRef.current.audioContext) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;

    const source = ctx.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(ctx.destination);

    audioContextRef.current = {
      audioContext: ctx,
      analyser: analyser,
      source: source
    };
    setAnalyserNode(analyser);
  }, []);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (!track.audioUrl) {
        alert("请点击左下角按钮上传音乐文件 (Please upload music)");
        return;
      }
      initAudioContext();
      
      if (audioContextRef.current.audioContext?.state === 'suspended') {
        audioContextRef.current.audioContext.resume();
      }
      
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.key === 'Escape') {
        if (hideUI) {
          e.preventDefault();
          setHideUI(false);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlePlayPause, hideUI]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      
      // Parse Filename
      const fileName = file.name;
      const rawName = fileName.replace(/\.[^/.]+$/, ""); // Remove extension
      
      let artist = "";
      let title = rawName;

      // Robust parsing: Only split if there is a clear " - " separator.
      if (rawName.includes(" - ")) {
        const parts = rawName.split(" - ");
        artist = parts[0].trim();
        title = parts.slice(1).join(" - ").trim();
      }

      setTrack(prev => ({ 
        ...prev, 
        audioUrl: url, 
        title: title || rawName, 
        artist: artist 
      }));
      
      setIsPlaying(false);
      // Change theme on new song for fun
      randomizeTheme();
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTrack(prev => ({ ...prev, coverUrl: url }));
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center bg-black overflow-hidden font-sans selection:bg-white/20">
      
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ 
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(0.45)'
        }}
      ></div>

      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 to-black/80 z-0"></div>
      
      <div className={`absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob bg-gradient-to-r ${currentTheme.gradient}`}></div>
      <div className={`absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob-delayed bg-gradient-to-l ${currentTheme.gradient}`}></div>

      <div 
        className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(${currentTheme.primary} 1px, transparent 1px), linear-gradient(90deg, ${currentTheme.primary} 1px, transparent 1px)`, 
          backgroundSize: '60px 60px' 
        }}
      ></div>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={track.audioUrl ?? undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        crossOrigin="anonymous"
      />

      {/* Visualizer - Behind the vinyl but front of bg */}
      <Visualizer analyser={analyserNode} isPlaying={isPlaying} theme={currentTheme} />

      {/* Main Stage - Centered Content */}
      {/* Increased padding-top to push content down further from screen edge */}
      <div className="z-20 flex flex-col items-center justify-center w-full h-full pt-32 pb-32 relative">
        
        {/* Title Header - Controlled by Cinema Mode (hideUI) */}
        {/* z-40 to sit ON TOP of the vinyl. pointer-events-none to avoid blocking vinyl interaction. */}
        <div 
          className={`
            w-full px-6 text-center flex flex-col items-center z-40 pointer-events-none
            transition-opacity duration-700 ease-in-out
            ${hideUI ? 'opacity-0' : 'opacity-100'}
          `}
        >
           {/* Artist Name */}
           {track.artist && (
             <h2 
                className={`text-lg md:text-xl font-bold tracking-[0.2em] uppercase mb-2 opacity-80`}
                style={{ color: currentTheme.primary, textShadow: `0 0 10px ${currentTheme.primary}80` }}
             >
               {track.artist}
             </h2>
           )}

          {/* Song Title */}
          <h1 
            className="w-full text-white text-3xl md:text-5xl font-black tracking-tighter drop-shadow-2xl uppercase italic truncate"
            style={{ 
              textShadow: `0 0 30px ${currentTheme.primary}40`,
              WebkitTextStroke: '1px rgba(255,255,255,0.1)'
            }}
          >
            {track.title}
          </h1>
          
          {/* Status Indicators */}
          <div className="flex items-center justify-center gap-3 opacity-80 mt-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'animate-pulse' : ''}`} style={{ backgroundColor: currentTheme.primary }}></div>
            <p className={`text-xs font-mono tracking-[0.3em] text-zinc-500`}>XING LV MUSIC PLAYER // SYSTEM READY</p>
            <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'animate-pulse' : ''}`} style={{ backgroundColor: currentTheme.primary }}></div>
          </div>
        </div>

        {/* Vinyl Record Component - Scale based on screen size */}
        {/* Negative margin (-mt-20) pulls the vinyl UP behind the text to create the overlap effect */}
        <div className="scale-90 md:scale-100 transition-transform duration-500 z-10 -mt-16 md:-mt-20">
          <VinylDisc coverUrl={track.coverUrl} isPlaying={isPlaying} theme={currentTheme} />
        </div>
        
      </div>

      {/* UI Controls */}
      <Controls 
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onUploadMusic={handleMusicUpload}
        onUploadCover={handleCoverUpload}
        duration={duration}
        currentTime={currentTime}
        onSeek={handleSeek}
        hideUI={hideUI}
        setHideUI={setHideUI}
        theme={currentTheme}
      />
    </div>
  );
};

export default App;