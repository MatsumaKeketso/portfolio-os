import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { showInstallPrompt, isPWAInstalled } from '../utils/pwa';

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (isPWAInstalled()) {
      return;
    }

    // Check if user dismissed the prompt in this session
    const dismissed = sessionStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      return;
    }

    // Listen for install availability
    const handleInstallAvailable = () => {
      setShowPrompt(true);
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
    };
  }, []);

  const handleInstall = async () => {
    const accepted = await showInstallPrompt();

    if (accepted) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (isDismissed || !showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[10002]"
        >
          {/* Top gradient accent line */}
          <div className="w-full h-1 bg-gradient-to-r from-primary-500 via-tertiary-500 to-primary-500 rounded-t" />

          <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-black rounded-b border border-gray-700/50 border-t-0 shadow-2xl p-4">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-tertiary-600 rounded flex items-center justify-center flex-shrink-0">
                <Icons.Download className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold mb-1">
                  Install GenOS
                </h3>
                <p className="text-gray-300 text-sm mb-3">
                  Add to your home screen for a native app experience
                </p>

                {/* Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleInstall}
                    className="flex-1 bg-gradient-to-r from-primary-500 to-tertiary-500 hover:from-primary-600 hover:to-tertiary-600 text-white px-4 py-2 rounded font-semibold text-sm transition-all"
                  >
                    <Icons.Plus className="w-4 h-4 inline mr-1" />
                    Install
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded text-sm transition-all"
                  >
                    Not Now
                  </button>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/20 rounded transition-all flex-shrink-0"
              >
                <Icons.X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Features */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Icons.Zap className="w-3 h-3 text-primary-400" />
                  <span>Fast</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icons.Wifi className="w-3 h-3 text-primary-400" />
                  <span>Offline</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icons.Smartphone className="w-3 h-3 text-primary-400" />
                  <span>Native</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
