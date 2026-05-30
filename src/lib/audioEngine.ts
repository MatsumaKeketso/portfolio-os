/**
 * Module-level audio singleton.
 * All play/pause/stop/seek calls go through here so they run synchronously
 * inside user-gesture activation scope (autoplay policy compliance).
 */
import { useMediaStore, Track } from '../store/mediaStore';

let audio: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (audio) return audio;

  audio = new Audio();
  audio.preload = 'auto';

  audio.addEventListener('timeupdate', () => {
    if (audio) useMediaStore.getState().setCurrentTime(audio.currentTime);
  });

  audio.addEventListener('loadedmetadata', () => {
    if (audio) useMediaStore.getState().setDuration(audio.duration);
  });

  audio.addEventListener('ended', () => {
    const store = useMediaStore.getState();
    const { queue, currentTrack, repeatMode, shuffle } = store;

    if (repeatMode === 'one') {
      audio!.currentTime = 0;
      store.setCurrentTime(0);
      audio!.play().catch(() => store.setStatus('paused'));
      return;
    }

    const idx = queue.findIndex(t => t.id === currentTrack?.id);
    let next = shuffle
      ? queue.filter(t => t.id !== currentTrack?.id)[Math.floor(Math.random() * Math.max(1, queue.length - 1))]
      : queue[idx + 1] ?? (repeatMode === 'all' ? queue[0] : undefined);

    if (next) {
      store.play(next);
      audio!.src = next.url;
      audio!.load();
      audio!.play().catch(() => store.setStatus('paused'));
    } else {
      store.stop();
    }
  });

  audio.addEventListener('play', () => useMediaStore.getState().setStatus('playing'));

  audio.addEventListener('pause', () => {
    // Ignore pause events that come from our own stop() call
    if (audio && audio.src && audio.src !== window.location.href) {
      const status = useMediaStore.getState().status;
      if (status === 'playing') useMediaStore.getState().setStatus('paused');
    }
  });

  return audio;
}

export const audioEngine = {
  /** Play a track — call from within a user-gesture handler for autoplay compliance */
  playTrack(track: Track): void {
    const store = useMediaStore.getState();
    store.play(track); // always register so MiniPlayer shows
    if (!track.url) {
      store.setStatus('paused');
      return;
    }
    const a = getAudio();
    if (!a) return;
    if (a.src !== track.url) {
      a.src = track.url;
      a.load();
    }
    a.play().catch(err => {
      console.warn('[audioEngine] play blocked:', err.message);
      store.setStatus('paused');
    });
  },

  /** Resume after pause — call from user-gesture handler */
  resume(): void {
    const a = getAudio();
    if (!a) return;
    const store = useMediaStore.getState();
    const { currentTrack } = store;
    if (!currentTrack) return;
    if (!a.src || a.src === window.location.href) {
      a.src = currentTrack.url;
      a.load();
    }
    store.setStatus('playing');
    a.play().catch(err => {
      console.warn('[audioEngine] resume blocked:', err.message);
      store.setStatus('paused');
    });
  },

  pause(): void {
    getAudio()?.pause();
    useMediaStore.getState().pause();
  },

  stop(): void {
    const a = getAudio();
    if (a) {
      a.pause();
      a.currentTime = 0;
      a.src = '';
    }
    useMediaStore.getState().stop();
  },

  next(): void {
    const store = useMediaStore.getState();
    const { queue, currentTrack, shuffle, repeatMode } = store;
    if (!currentTrack) return;
    const idx = queue.findIndex(t => t.id === currentTrack.id);
    const nextTrack = shuffle
      ? queue.filter(t => t.id !== currentTrack.id)[Math.floor(Math.random() * Math.max(1, queue.length - 1))]
      : queue[idx + 1] ?? (repeatMode === 'all' ? queue[0] : undefined);
    if (nextTrack) {
      const a = getAudio();
      store.play(nextTrack);
      if (a) {
        a.src = nextTrack.url;
        a.load();
        a.play().catch(() => store.setStatus('paused'));
      }
    } else {
      audioEngine.stop();
    }
  },

  prev(): void {
    const a = getAudio();
    const store = useMediaStore.getState();
    if (!store.currentTrack) return;

    if (a && a.currentTime > 3) {
      a.currentTime = 0;
      store.setCurrentTime(0);
      return;
    }

    const { queue, currentTrack } = store;
    const idx = queue.findIndex(t => t.id === currentTrack!.id);
    const prevTrack = queue[idx - 1];
    if (prevTrack && a) {
      store.play(prevTrack);
      a.src = prevTrack.url;
      a.load();
      a.play().catch(() => store.setStatus('paused'));
    }
  },

  seek(time: number): void {
    const a = getAudio();
    if (a) a.currentTime = time;
    useMediaStore.getState().setCurrentTime(time);
  },

  setVolume(volume: number): void {
    const a = getAudio();
    if (a) a.volume = Math.max(0, Math.min(1, volume));
    useMediaStore.getState().setVolume(volume);
  },

  toggleMute(): void {
    const a = getAudio();
    const store = useMediaStore.getState();
    const newMuted = !store.isMuted;
    if (a) a.volume = newMuted ? 0 : Math.max(0, Math.min(1, store.volume));
    store.toggleMute();
  },
};
