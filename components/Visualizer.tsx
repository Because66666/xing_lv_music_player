import React, { useEffect, useRef } from 'react';
import { Theme } from '../types';

interface VisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  theme: Theme;
}

export const Visualizer: React.FC<VisualizerProps> = ({ analyser, isPlaying, theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let animationId: number;

    const renderFrame = () => {
      // Check if canvas is still attached
      if (!canvasRef.current) return;

      if (!isPlaying) {
        // Slow fade out
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Continue loop briefly to clear, but we can just return to save resources if fully cleared
        // For now, we let it fade
      }

      animationId = requestAnimationFrame(renderFrame);
      analyser.getByteFrequencyData(dataArray);

      // Clear with transparency for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Configure Neon Glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = theme.primary;

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      // Draw bars
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] * (window.innerHeight < 600 ? 0.8 : 1.4); 
        
        // Gradient logic 
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, theme.secondary); 
        gradient.addColorStop(1, theme.primary); 

        ctx.fillStyle = gradient;
        
        // Rounded bars at bottom
        ctx.beginPath();
        // Using standard rect for better performance with heavy shadow, or roundRect if supported
        if (ctx.roundRect) {
            ctx.roundRect(x, canvas.height - barHeight, barWidth, barHeight, [10, 10, 0, 0]);
        } else {
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        }
        ctx.fill();

        x += barWidth + 2; // Slight gap
      }
      
      // Reset shadow for next frame (performance)
      ctx.shadowBlur = 0;
    };

    renderFrame();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [analyser, isPlaying, theme]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight * 0.5; // Occupy bottom half
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute bottom-0 left-0 w-full h-1/2 pointer-events-none z-0 opacity-80 mix-blend-screen"
    />
  );
};