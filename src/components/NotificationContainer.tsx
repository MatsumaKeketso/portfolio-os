import { AnimatePresence, motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotificationStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <Icons.CheckCircle className="w-4 h-4 text-foreground-feedback-success" />;
      case 'error':   return <Icons.XCircle className="w-4 h-4 text-foreground-feedback-error" />;
      case 'warning': return <Icons.AlertTriangle className="w-4 h-4 text-foreground-feedback-warning" />;
      default:        return <Icons.Info className="w-4 h-4 text-foreground-feedback-info" />;
    }
  };

  const getAccentClass = (type: string) => {
    switch (type) {
      case 'success': return 'border-l-[3px] border-l-foreground-feedback-success';
      case 'error':   return 'border-l-[3px] border-l-foreground-feedback-error';
      case 'warning': return 'border-l-[3px] border-l-foreground-feedback-warning';
      default:        return 'border-l-[3px] border-l-foreground-feedback-info';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[15001] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 80, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.92 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto"
          >
            <div className={`relative bg-os-ink-900 border border-white/[0.10] ${getAccentClass(notification.type)} rounded-lg shadow-os-floating p-4 pr-10 min-w-[300px] max-w-[380px]`}>
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">{getIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm font-semibold mb-0.5">{notification.title}</h4>
                  {notification.message && (
                    <p className="text-white/50 text-xs leading-relaxed">{notification.message}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="absolute top-2 right-2 p-1.5 hover:bg-white/[0.08] rounded transition-colors"
                aria-label="Close notification"
              >
                <Icons.X className="w-3.5 h-3.5 text-white/40" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
