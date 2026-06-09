import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Bell, Trash2 } from 'lucide-react';
import { useNotificationStore, Notification } from '../store/notificationStore';
import type { PopupAnchor } from './CalendarPopup';
import { cn } from '../lib/utils';

interface NotificationPanelProps {
  anchor: PopupAnchor;
  onClose: () => void;
}

const TYPE_ICON: Record<Notification['type'], typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const TYPE_COLOR: Record<Notification['type'], string> = {
  success: 'text-fg-success',
  error: 'text-fg-error',
  info: 'text-fg-brand',
  warning: 'text-fg-warning',
};

function relativeTime(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function NotificationPanel({ anchor, onClose }: NotificationPanelProps) {
  const { notifications, removeNotification, clearAll } = useNotificationStore();
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

  const width = 320;
  const left = Math.max(8, Math.min(anchor.centerX - width / 2, window.innerWidth - width - 8));

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: 'fixed', bottom: anchor.bottom, left, width }}
      className="bg-background-chrome/95 backdrop-blur-md border border-os-line-dark rounded-2xl shadow-xl shadow-black/50 z-[10001] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-os-line-dark">
        <div className="flex items-center gap-2">
          <Bell className="w-3.5 h-3.5 text-white/40" />
          <span className="text-xs font-semibold text-white/60">Notifications</span>
          {notifications.length > 0 && (
            <span className="text-[10px] bg-os-ink-800 text-white/55 px-1.5 py-0.5 rounded-full">
              {notifications.length}
            </span>
          )}
        </div>
        {notifications.length > 0 && (
          <button
            onClick={clearAll}
            className="p-1 rounded text-white/30 hover:text-white/60 hover:bg-os-ink-800 transition-colors"
            title="Clear all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="max-h-72 overflow-y-auto">
        <AnimatePresence initial={false}>
          {notifications.length > 0 ? (
            [...notifications].reverse().map((n) => {
              const Icon = TYPE_ICON[n.type];
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className="border-b border-os-line-dark last:border-0"
                >
                  <div className="flex items-start gap-3 px-4 py-3 hover:bg-os-ink-900 transition-colors group">
                    <Icon className={cn('w-4 h-4 mt-px flex-shrink-0', TYPE_COLOR[n.type])} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-white/80 leading-snug">{n.title}</p>
                      {n.message && (
                        <p className="text-[11px] text-white/40 mt-0.5 leading-snug">{n.message}</p>
                      )}
                      <p className="text-[10px] text-white/25 mt-1">{relativeTime(n.createdAt)}</p>
                    </div>
                    <button
                      onClick={() => removeNotification(n.id)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-white/30 hover:text-white/60 transition-all flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <Bell className="w-6 h-6 text-white/10 mb-2" />
              <p className="text-xs text-white/25">No notifications</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
