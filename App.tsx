import React, { useState, useRef, useEffect, useCallback } from 'react';
const bgImage = new URL('./assets/background.png', import.meta.url).href;
import { VinylDisc } from './components/VinylDisc';
import { Controls } from './components/Controls';
import { Visualizer } from './components/Visualizer';
import { Track, AudioContextState, Theme, PlaylistEntry } from './types';

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
  const [playlist, setPlaylist] = useState<PlaylistEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [autoPlayPending, setAutoPlayPending] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContextState>({
    audioContext: null,
    analyser: null,
    source: null
  });
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const lastBlobUrlRef = useRef<string | null>(null);


  /**
   * 检测是否处于 Electron 应用环境
   */
  const isElectronEnv = () => {
    try {
      return typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('electron');
    } catch {
      return false;
    }
  };

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
      setIsPlaying(false);
      return;
    }
    if (!track.audioUrl) {
      if (playlist.length > 0) {
        const first = playlist[0];
        const fileUrl = toFileUrl(first.path);
        const coverUrl = first.cover ? toFileUrl(first.cover) : track.coverUrl;
        setCurrentIndex(0);
        setTrack(prev => ({
          ...prev,
          audioUrl: fileUrl,
          coverUrl: coverUrl ?? null,
          title: first.title || prev.title,
          artist: ''
        }));
        setAutoPlayPending(true);
        setIsPlaying(true);
        return;
      } else {
        alert("请点击左下角按钮上传音乐或导入歌单");
        return;
      }
    }
    initAudioContext();
    if (audioContextRef.current.audioContext?.state === 'suspended') {
      audioContextRef.current.audioContext.resume();
    }
    const p = audioRef.current.play();
    if (p && typeof (p as any).catch === 'function') {
      (p as any).catch(() => {});
    }
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      if (autoPlayPending) {
        initAudioContext();
        if (audioContextRef.current.audioContext?.state === 'suspended') {
          audioContextRef.current.audioContext.resume();
        }
        const playPromise = audioRef.current.play();
        if (playPromise && typeof (playPromise as any).catch === 'function') {
          (playPromise as any).catch(() => {});
        }
        setIsPlaying(true);
        setAutoPlayPending(false);
      }
    }
  };

  const handleEnded = () => {
    if (playlist.length > 0) {
      const nextIndex = (currentIndex + 1) % playlist.length;
      const next = playlist[nextIndex];
      setCurrentIndex(nextIndex);
      const nextTrack: Track = {
        audioUrl: toFileUrl(next.path),
        coverUrl: next.cover ? toFileUrl(next.cover) : null,
        title: next.title || 'UNTITLED',
        artist: ''
      };
      setTrack(nextTrack);
      setCurrentTime(0);
      setAutoPlayPending(true);
      setIsPlaying(true);
      randomizeTheme();
      return;
    }
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
    
  /**
   * 处理单曲文件上传
   */
  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (lastBlobUrlRef.current) {
        URL.revokeObjectURL(lastBlobUrlRef.current);
      }
      lastBlobUrlRef.current = url;
      
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
      setAutoPlayPending(true);
      setIsPlaying(true);
      randomizeTheme();
    }
  };

  /**
   * 处理歌单 JSON 上传
   */
  const handlePlaylistUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!isElectronEnv()) {
        alert('歌单模式需要在应用程序下使用');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const json = JSON.parse(ev.target?.result as string) as PlaylistEntry[];
          if (!Array.isArray(json)) {
            alert('歌单文件格式错误，应为数组');
            return;
          }
          setPlaylist(json);
          if (json.length > 0) {
            const first = json[0];
            const nextTrack: Track = {
              audioUrl: toFileUrl(first.path),
              coverUrl: first.cover ? toFileUrl(first.cover) : null,
              title: first.title || 'UNTITLED',
              artist: ''
            };
            setCurrentIndex(0);
            setTrack(nextTrack);
            setAutoPlayPending(true);
            setIsPlaying(true);
            randomizeTheme();
          }
        } catch (err) {
          alert('无法解析歌单 JSON 文件');
        }
      };
      reader.readAsText(file);
    }
  };

  /**
   * 合并的上传入口：根据后缀分发到音乐或歌单
   */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    const isJson = name.endsWith('.json') || file.type === 'application/json';
    if (isJson) {
      if (!isElectronEnv()) {
        alert('歌单模式需要在应用程序下使用');
        return;
      }
      handlePlaylistUpload(e);
    } else {
      // 复用音乐上传逻辑
      handleMusicUpload(e);
    }
  };

  /**
   * 处理封面图片上传
   */
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
        className="absolute top-0 left-0 w-full" 
        style={{ height: 36, WebkitAppRegion: 'drag', zIndex: 100 }}
      ></div>
      
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
        onUploadFile={handleFileUpload}
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
  const toFileUrl = (p: string) => {
    if (!p) return '';
    if (p.startsWith('file://')) return p;
    const normalized = p.replace(/\\/g, '/').replace(/%/g, '%25');
    if (/^[A-Za-z]:\//.test(normalized)) {
      return `file:///${encodeURI(normalized)}`;
    }
    return encodeURI(normalized);
  };