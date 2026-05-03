import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

export interface PopupAnchor {
  bottom: number;
  centerX: number;
}

interface CalendarPopupProps {
  anchor: PopupAnchor;
  onClose: () => void;
}

export function CalendarPopup({ anchor, onClose }: CalendarPopupProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
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

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  // Width of calendar is w-72 = 288px, clamp so it stays on screen
  const width = 288;
  const left = Math.max(8, Math.min(anchor.centerX - width / 2, window.innerWidth - width - 8));

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: 'fixed', bottom: anchor.bottom, left, width }}
      className="bg-[#141414]/95 backdrop-blur-md border border-white/[0.08] rounded-2xl shadow-xl shadow-black/50 p-4 z-[10001]"
    >
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-1.5 hover:bg-white/[0.08] rounded-lg text-white/40 hover:text-white transition-colors"
        >
          <Icons.ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-white/80 font-medium text-sm">
          {monthName} {year}
        </span>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-1.5 hover:bg-white/[0.08] rounded-lg text-white/40 hover:text-white transition-colors"
        >
          <Icons.ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-[10px] text-white/25 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => (
          <div
            key={i}
            className={[
              'h-8 flex items-center justify-center text-xs rounded-lg select-none',
              day === null
                ? ''
                : isToday(day)
                ? 'bg-primary-500 text-white font-semibold'
                : 'text-white/50 hover:bg-white/[0.08] hover:text-white cursor-pointer transition-colors',
            ].join(' ')}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-white/[0.06]">
        <p className="text-white/30 text-[11px] text-center">
          {today.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
    </motion.div>
  );
}
