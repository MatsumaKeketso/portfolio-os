import { AnimatePresence, motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useMediaStore } from '../store/mediaStore';
import { audioEngine } from '../lib/audioEngine';
import { useDesktopStore } from '../store/desktopStore';
import { cn } from '../lib/utils';

function trackHue(title: string) {
  return [...title].reduce((h, c) => (h * 31 + c.charCodeAt(0)) & 0xffffff, 0) % 360;
}

export function MiniPlayer() {
  const { status, currentTrack, currentTime, duration, shuffle, repeatMode } = useMediaStore();
  const { apps, windows, openWindow, bringToFront, minimizeWindow } = useDesktopStore();

  const isVisible = status !== 'idle' && currentTrack != null;
  const isPlaying = status === 'playing';
  const pct = duration > 0 ? Math.min(1, currentTime / duration) * 100 : 0;

  const hue = currentTrack ? trackHue(currentTrack.title) : 220;
  const hue2 = (hue + 48) % 360;

  const handleOpenMusic = () => {
    const musicApp = apps.find(a => a.id === 'music');
    const existing = windows.find(w => w.appId === 'music');
    if (existing) {
      if (existing.isMinimized) minimizeWindow(existing.id);
      bringToFront(existing.id);
    } else if (musicApp) {
      openWindow(musicApp);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 32, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 32, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 480, damping: 34 }}
          className="fixed bottom-3 right-4 z-[9999] h-[52px] rounded-2xl overflow-hidden"
          style={{
            border: isPlaying
              ? `1px solid hsl(${hue},42%,38%)`
              : '1px solid var(--os-line-dark)',
            boxShadow: isPlaying
              ? `0 0 28px hsl(${hue},55%,22%), 0 8px 24px rgba(0,0,0,0.45)`
              : '0 4px 20px rgba(0,0,0,0.45)',
          }}
        >
          {/* Gradient layer — the "glorious" part */}
          <motion.div
            className="absolute inset-0"
            animate={{
              backgroundPosition: isPlaying
                ? ['0% 50%', '100% 50%', '0% 50%']
                : '50% 50%',
              filter: isPlaying
                ? 'saturate(1) brightness(1)'
                : 'saturate(0.08) brightness(0.55)',
            }}
            transition={{
              backgroundPosition: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
              filter: { duration: 0.6, ease: 'easeInOut' },
            }}
            style={{
              backgroundImage: `linear-gradient(120deg,
                hsl(${hue},68%,24%) 0%,
                hsl(${hue2},58%,16%) 40%,
                hsl(${(hue + 20) % 360},72%,22%) 80%,
                hsl(${hue},65%,20%) 100%)`,
              backgroundSize: '280% 280%',
            }}
          />

          {/* Dark base — ensures readability, shows through when paused */}
          <div className="absolute inset-0 bg-os-ink-950/80" />

          {/* Content row */}
          <div className="relative z-10 flex items-center gap-1.5 px-2 h-full">

            {/* Artwork swatch — opens Music window */}
            <button
              onClick={handleOpenMusic}
              className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center transition-opacity hover:opacity-80"
              style={{
                background: `hsl(${hue},52%,28%)`,
                boxShadow: isPlaying ? `0 0 10px hsl(${hue},60%,32%)` : 'none',
              }}
              title="Open Music"
            >
              <Icons.Music className="w-3.5 h-3.5 text-white/70" />
            </button>

            {/* Track name */}
            <button
              onClick={handleOpenMusic}
              className="w-[88px] text-left hover:opacity-80 transition-opacity overflow-hidden shrink-0"
            >
              <p className="text-xs font-medium text-white/90 truncate leading-tight">
                {currentTrack!.title}
              </p>
            </button>

            {/* Transport controls */}
            <div className="flex items-center gap-0.5 shrink-0">

              {/* Shuffle */}
              <button
                onClick={() => useMediaStore.getState().toggleShuffle()}
                className={cn(
                  'p-1 rounded-lg transition-colors hover:bg-os-ink-800/60',
                  shuffle ? 'text-fg-brand' : 'text-white/25 hover:text-white/60'
                )}
                title={shuffle ? 'Shuffle on' : 'Shuffle off'}
              >
                <Icons.Shuffle className="w-3 h-3" />
              </button>

              <button
                onClick={audioEngine.prev}
                className="p-1 rounded-lg text-white/35 hover:text-white hover:bg-os-ink-800/60 transition-colors"
                title="Previous"
              >
                <Icons.SkipBack className="w-3 h-3" />
              </button>

              <button
                onClick={isPlaying ? audioEngine.pause : audioEngine.resume}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{
                  background: isPlaying
                    ? `hsl(${hue},62%,46%)`
                    : 'rgba(255,255,255,0.10)',
                  boxShadow: isPlaying
                    ? `0 0 14px hsl(${hue},62%,38%)`
                    : 'none',
                }}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying
                  ? <Icons.Pause className="w-3 h-3 text-white" />
                  : <Icons.Play className="w-3 h-3 text-white ml-px" />
                }
              </button>

              <button
                onClick={audioEngine.next}
                className="p-1 rounded-lg text-white/35 hover:text-white hover:bg-os-ink-800/60 transition-colors"
                title="Next"
              >
                <Icons.SkipForward className="w-3 h-3" />
              </button>

              {/* Repeat */}
              <button
                onClick={() => useMediaStore.getState().cycleRepeat()}
                className={cn(
                  'p-1 rounded-lg transition-colors hover:bg-os-ink-800/60',
                  repeatMode !== 'off' ? 'text-fg-brand' : 'text-white/25 hover:text-white/60'
                )}
                title={repeatMode === 'off' ? 'Repeat off' : repeatMode === 'all' ? 'Repeat all' : 'Repeat one'}
              >
                {repeatMode === 'one'
                  ? <Icons.Repeat1 className="w-3 h-3" />
                  : <Icons.Repeat className="w-3 h-3" />
                }
              </button>

              <button
                onClick={audioEngine.stop}
                className="p-1 rounded-lg text-white/20 hover:text-white/55 hover:bg-os-ink-800/60 transition-colors ml-0.5"
                title="Stop"
              >
                <Icons.X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Progress stripe — pinned to bottom edge */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-os-line-dark-hover">
            <motion.div
              className="h-full"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.25, ease: 'linear' }}
              style={{
                background: isPlaying
                  ? `hsl(${hue}, 75%, 62%)`
                  : 'rgba(255,255,255,0.15)',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
