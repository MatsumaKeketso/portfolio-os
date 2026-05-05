import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import type { PopupAnchor } from './CalendarPopup';

interface VolumePopupProps {
  anchor: PopupAnchor;
  volume: number;
  onChange: (v: number) => void;
  onClose: () => void;
}

export function VolumePopup({ anchor, volume, onChange, onClose }: VolumePopupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onCloseRef.current();
      }
    };
    const id = setTimeout(() => document.addEventListener('mousedown', handle), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', handle);
    };
  }, []);

  const VolumeIcon =
    volume === 0 ? Icons.VolumeX : volume < 40 ? Icons.Volume1 : Icons.Volume2;

  // Width of volume popup is w-14 = 56px
  const width = 56;
  const left = Math.max(8, Math.min(anchor.centerX - width / 2, window.innerWidth - width - 8));

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: 'fixed', bottom: anchor.bottom, left, width }}
      className="bg-background-chrome/95 backdrop-blur-md border border-white/[0.08] rounded-2xl shadow-xl shadow-black/50 py-4 z-[10001] flex flex-col items-center gap-3"
    >
      <span className="text-white/50 text-[11px] font-medium tabular-nums">
        {volume}
      </span>

      <div className="h-28 flex items-center justify-center overflow-hidden">
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={e => onChange(Number(e.target.value))}
          className="accent-primary-400 cursor-pointer"
          style={{ transform: 'rotate(-90deg)', width: '96px' }}
        />
      </div>

      <button
        onClick={() => onChange(volume === 0 ? 75 : 0)}
        className="p-1.5 hover:bg-white/[0.08] rounded-lg text-white/50 hover:text-white transition-colors"
      >
        <VolumeIcon className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
