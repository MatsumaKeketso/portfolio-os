import { AnimatePresence, motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotificationStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Icons.CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <Icons.XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <Icons.AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'info':
      default:
        return <Icons.Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getColorClasses = (type: string) => {
    switch (type) {
      case 'success':
        return 'from-green-900/90 to-emerald-900/90 border-green-500/50';
      case 'error':
        return 'from-red-900/90 to-rose-900/90 border-red-500/50';
      case 'warning':
        return 'from-amber-900/90 to-yellow-900/90 border-amber-500/50';
      case 'info':
      default:
        return 'from-blue-900/90 to-cyan-900/90 border-blue-500/50';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[15001] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto"
          >
            <div
              className={`relative bg-gradient-to-br ${getColorClasses(
                notification.type
              )} backdrop-blur-xl rounded-lg shadow-2xl border p-4 pr-12 min-w-[320px] max-w-[400px]`}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">{getIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold text-sm mb-1">
                    {notification.title}
                  </h4>
                  {notification.message && (
                    <p className="text-gray-200 text-xs leading-relaxed">
                      {notification.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => removeNotification(notification.id)}
                className="absolute top-2 right-2 p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close notification"
              >
                <Icons.X className="w-4 h-4 text-white" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
