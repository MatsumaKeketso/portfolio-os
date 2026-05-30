import { create } from 'zustand';
import { FileItem } from '../types';

export interface Track {
  id: string;
  title: string;
  artist?: string;
  url: string;
  file?: FileItem;
  duration?: number;
}

export type PlaybackStatus = 'idle' | 'playing' | 'paused';
export type RepeatMode = 'off' | 'all' | 'one';

interface MediaStore {
  status: PlaybackStatus;
  currentTrack: Track | null;
  queue: Track[];
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  seekTo: number | null;
  shuffle: boolean;
  repeatMode: RepeatMode;

  play: (track: Track, queue?: Track[]) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  clearSeek: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setStatus: (status: PlaybackStatus) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
}

export const useMediaStore = create<MediaStore>((set, get) => ({
  status: 'idle',
  currentTrack: null,
  queue: [],
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  seekTo: null,
  shuffle: false,
  repeatMode: 'off',

  play: (track, queue) =>
    set({ currentTrack: track, queue: queue ?? [track], status: 'playing', currentTime: 0, seekTo: null }),

  pause: () => set({ status: 'paused' }),

  resume: () => {
    if (get().currentTrack) set({ status: 'playing' });
  },

  stop: () => set({ status: 'idle', currentTrack: null, currentTime: 0, seekTo: null }),

  next: () => {
    const { queue, currentTrack } = get();
    if (!currentTrack) return;
    const idx = queue.findIndex(t => t.id === currentTrack.id);
    const next = queue[idx + 1];
    if (next) set({ currentTrack: next, currentTime: 0, status: 'playing', seekTo: null });
    else set({ status: 'idle', currentTime: 0 });
  },

  prev: () => {
    const { queue, currentTrack, currentTime } = get();
    if (!currentTrack) return;
    if (currentTime > 3) { set({ seekTo: 0 }); return; }
    const idx = queue.findIndex(t => t.id === currentTrack.id);
    const prev = queue[idx - 1];
    if (prev) set({ currentTrack: prev, currentTime: 0, status: 'playing', seekTo: null });
  },

  seek: (time) => set({ seekTo: time }),
  clearSeek: () => set({ seekTo: null }),

  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
  toggleMute: () => set(s => ({ isMuted: !s.isMuted })),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setStatus: (status) => set({ status }),
  toggleShuffle: () => set(s => ({ shuffle: !s.shuffle })),
  cycleRepeat: () => set(s => ({
    repeatMode: s.repeatMode === 'off' ? 'all' : s.repeatMode === 'all' ? 'one' : 'off',
  })),
}));
