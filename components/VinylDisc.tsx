import React from 'react';
import { Theme } from '../types';

interface VinylDiscProps {
  coverUrl: string | null;
  isPlaying: boolean;
  theme: Theme;
}

export const VinylDisc: React.FC<VinylDiscProps> = ({ coverUrl, isPlaying, theme }) => {
  return (
    <div className="relative flex items-center justify-center w-[300px] h-[300px] md:w-[500px] md:h-[500px] transition-all duration-700 ease-in-out">
      {/* Dynamic Colored Glow behind the record */}
      <div 
        className={`absolute inset-0 rounded-full blur-3xl transition-all duration-1000 ease-in-out`}
        style={{ 
          backgroundColor: theme.primary, 
          opacity: isPlaying ? 0.4 : 0.1,
          transform: isPlaying ? 'scale(1.1)' : 'scale(0.9)' 
        }}
      ></div>

      {/* Record Container (Static wrapper for shadow) */}
      <div className="relative w-full h-full rounded-full shadow-2xl" 
           style={{ boxShadow: `0 0 60px -10px ${theme.secondary}40` }}>
           
          {/* ROTATING PART: The actual disc and label */}
          <div 
            className={`
              relative w-full h-full rounded-full 
              bg-vinyl-black border-4 
              flex items-center justify-center
              animate-spin-slow
            `}
            style={{ 
                borderColor: '#18181b',
                animationPlayState: isPlaying ? 'running' : 'paused',
            }}
          >
            {/* Disc Artwork Fill */}
            {coverUrl && (
              <div
                className="absolute inset-1 rounded-full overflow-hidden z-0"
                style={{
                  backgroundImage: `url(${coverUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              ></div>
            )}
            {/* Vinyl Grooves Texture */}
            <div className="absolute inset-1 rounded-full bg-vinyl-gradient opacity-70 z-10"></div>
            
            {/* Center Label / Album Art */}
            <div className="relative w-1/3 h-1/3 rounded-full overflow-hidden border-8 border-zinc-900 z-20 bg-zinc-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                <div 
                  className="w-full h-full flex items-center justify-center bg-zinc-900 text-white/20"
                  style={{ background: `radial-gradient(circle, ${theme.secondary} 0%, #000 100%)` }}
                >
                  <div className="w-2 h-2 rounded-full bg-black opacity-50"></div>
                </div>
            </div>
            
            {/* Spindle Hole */}
            <div className="absolute w-4 h-4 bg-black rounded-full z-30 border border-zinc-700 shadow-inner"></div>
          </div>

          {/* STATIC PART: Light Reflections (Sheen) - These now stay fixed while record spins */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none z-40"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-bl from-transparent via-transparent to-white/5 pointer-events-none z-40"></div>
      </div>
    </div>
  );
};