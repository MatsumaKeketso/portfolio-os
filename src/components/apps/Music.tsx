import * as Icons from 'lucide-react';
import { FileItem } from '../../types';
import { useMediaStore } from '../../store/mediaStore';
import { audioEngine } from '../../lib/audioEngine';
import { AppShell, AppContent, appIconButtonClass } from '../ui/AppShell';
import { cn } from '../../lib/utils';

interface MusicProps {
  file?: FileItem;
}

function formatTime(s: number) {
  if (!isFinite(s) || s <= 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function ArtworkPlaceholder({ title }: { title: string }) {
  const hue = [...title].reduce((h, c) => (h * 31 + c.charCodeAt(0)) & 0xffffff, 0) % 360;
  const hue2 = (hue + 40) % 360;
  return (
    <div
      className="w-full h-full rounded-xl flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, hsl(${hue},60%,22%) 0%, hsl(${hue2},50%,16%) 100%)` }}
    >
      <Icons.Music className="w-16 h-16 opacity-25" style={{ color: `hsl(${hue},80%,75%)` }} />
    </div>
  );
}

function ProgressBar({ current, duration }: { current: number; duration: number }) {
  const pct = duration > 0 ? Math.min(1, current / duration) * 100 : 0;
  return (
    <div
      className="relative h-1 bg-os-line-dark-hover rounded-full cursor-pointer group"
      onClick={e => {
        const bar = e.currentTarget;
        const rect = bar.getBoundingClientRect();
        if (duration > 0) audioEngine.seek(((e.clientX - rect.left) / rect.width) * duration);
      }}
    >
      <div className="h-full bg-brand-600 rounded-full" style={{ width: `${pct}%` }} />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ left: `calc(${pct}% - 6px)` }}
      />
    </div>
  );
}

export function Music({ file }: MusicProps) {
  const { status, currentTrack, currentTime, duration, volume, isMuted } = useMediaStore();

  const displayTrack = currentTrack ?? (file ? { id: file.id, title: file.name.replace(/\.[^.]+$/, ''), url: '' } : null);
  const isPlaying = status === 'playing';
  const hasTrack = displayTrack != null;
  const hasUrl = !!(currentTrack?.url);

  return (
    <AppShell>
      <AppContent className="flex flex-col p-5 gap-5 overflow-hidden select-none">
        {/* Artwork */}
        <div className="aspect-square w-full max-w-[260px] mx-auto rounded-xl overflow-hidden shadow-2xl shadow-black/60">
          {displayTrack ? (
            <ArtworkPlaceholder title={displayTrack.title} />
          ) : (
            <div className="w-full h-full bg-os-ink-950/30 rounded-xl flex items-center justify-center">
              <Icons.Music className="w-16 h-16 text-white/10" />
            </div>
          )}
        </div>

        {/* Track info */}
        <div className="text-center min-h-[40px]">
          {displayTrack ? (
            <p className="font-semibold text-white/90 truncate text-base leading-tight">
              {displayTrack.title}
            </p>
          ) : (
            <p className="text-sm text-white/30">No track loaded</p>
          )}
          {hasTrack && !hasUrl && (
            <p className="text-xs text-fg-warning/70 mt-1">No audio source — re-upload as audio file</p>
          )}
        </div>

        {/* Progress */}
        <div className="flex flex-col gap-1.5">
          <ProgressBar current={currentTime} duration={duration} />
          <div className="flex justify-between text-[11px] text-white/30 tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Transport controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={audioEngine.prev}
            disabled={!hasTrack || !hasUrl}
            className={cn(appIconButtonClass, 'p-2 disabled:opacity-25 disabled:pointer-events-none')}
          >
            <Icons.SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={isPlaying ? audioEngine.pause : audioEngine.resume}
            disabled={!hasTrack || !hasUrl}
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center transition-all',
              // Smart brand CTA: fill from ramp, icon inherits the auto-contrast on-brand color.
              'bg-brand-600 text-fg-on-primary hover:bg-brand-400 active:scale-95 shadow-lg shadow-glow-primary',
              'disabled:opacity-25 disabled:pointer-events-none'
            )}
          >
            {isPlaying
              ? <Icons.Pause className="w-5 h-5" />
              : <Icons.Play className="w-5 h-5 ml-0.5" />
            }
          </button>

          <button
            onClick={audioEngine.next}
            disabled={!hasTrack || !hasUrl}
            className={cn(appIconButtonClass, 'p-2 disabled:opacity-25 disabled:pointer-events-none')}
          >
            <Icons.SkipForward className="w-5 h-5" />
          </button>

          {hasTrack && (
            <button
              onClick={audioEngine.stop}
              className={cn(appIconButtonClass, 'p-2')}
              title="Stop"
            >
              <Icons.Square className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button
            onClick={audioEngine.toggleMute}
            className={cn(appIconButtonClass, 'p-1.5 shrink-0')}
          >
            {isMuted || volume === 0
              ? <Icons.VolumeX className="w-4 h-4" />
              : volume < 0.5
              ? <Icons.Volume1 className="w-4 h-4" />
              : <Icons.Volume2 className="w-4 h-4" />
            }
          </button>
          <input
            type="range" min={0} max={1} step={0.01}
            value={isMuted ? 0 : volume}
            onChange={e => audioEngine.setVolume(Number(e.target.value))}
            className="flex-1 h-1 accent-brand-600 cursor-pointer"
          />
          <span className="text-[11px] text-white/30 tabular-nums w-7 text-right">
            {Math.round((isMuted ? 0 : volume) * 100)}
          </span>
        </div>

        {/* Empty state */}
        {!hasTrack && (
          <div className="flex flex-col items-center justify-center gap-2 text-center pt-2">
            <Icons.FolderOpen className="w-8 h-8 text-white/15" />
            <p className="text-xs text-white/30 leading-relaxed max-w-[180px]">
              Open an audio file from Archive to start playing
            </p>
          </div>
        )}
      </AppContent>
    </AppShell>
  );
}
