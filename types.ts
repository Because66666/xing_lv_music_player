export interface Track {
  audioUrl: string | null;
  coverUrl: string | null;
  title: string;
  artist?: string;
}

export interface AudioContextState {
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
  source: MediaElementAudioSourceNode | null;
}

export interface Theme {
  id: string;
  primary: string;   // Hex for canvas/js usage
  secondary: string; // Hex for gradients
  accent: string;    // Tailwind class for text/borders
  gradient: string;  // Tailwind class for backgrounds
  shadow: string;    // CSS shadow string
}

export interface PlaylistEntry {
  title: string;
  path: string;
  cover?: string;
}
