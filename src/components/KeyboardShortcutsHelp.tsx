import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // System
  { keys: ['Ctrl', 'Shift', 'A'], description: 'Toggle Admin Mode', category: 'System' },
  { keys: ['Esc'], description: 'Close Start Menu', category: 'System' },
  { keys: ['?'], description: 'Show/Hide Keyboard Shortcuts', category: 'System' },

  // Window Management
  { keys: ['Alt', 'F4'], description: 'Close Active Window', category: 'Windows' },
  { keys: ['Win', 'D'], description: 'Minimize All Windows', category: 'Windows' },
  { keys: ['Alt', 'Tab'], description: 'Switch Between Windows', category: 'Windows' },

  // Navigation
  { keys: ['Ctrl', 'O'], description: 'Open File Explorer', category: 'Navigation' },
  { keys: ['Ctrl', 'S'], description: 'Save (in apps)', category: 'Navigation' },
  { keys: ['Ctrl', 'N'], description: 'New File (in apps)', category: 'Navigation' },

  // File Explorer
  { keys: ['Ctrl', 'N'], description: 'New File', category: 'File Explorer' },
  { keys: ['Ctrl', 'Shift', 'N'], description: 'New Folder', category: 'File Explorer' },
  { keys: ['Delete'], description: 'Delete Selected File', category: 'File Explorer' },
  { keys: ['F2'], description: 'Rename File', category: 'File Explorer' },

  // Notepad
  { keys: ['Ctrl', 'S'], description: 'Save Note', category: 'Notepad' },
  { keys: ['Ctrl', 'N'], description: 'New Note', category: 'Notepad' },
];

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle with '?' key (Shift + /)
      if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // Don't trigger if user is typing in an input/textarea
        const target = e.target as HTMLElement;
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return;
        }

        e.preventDefault();
        setIsOpen(prev => !prev);
      }

      // Close with Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  return (
    <>
      {/* Help Button - Bottom Right Corner */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-16 right-4 z-[10001] w-12 h-12 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-2xl flex items-center justify-center transition-all hover:scale-110 group"
        title="Keyboard Shortcuts (Press ?)"
      >
        <Icons.Keyboard className="w-6 h-6" />
        <span className="absolute -top-10 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Press ? for shortcuts
        </span>/
      </button>

      {/* Shortcuts Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[15001] flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[85vh] flex flex-col"
            >
              {/* Top gradient accent line */}
              <div className="w-full h-1 bg-gradient-to-r from-primary-500 via-tertiary-500 to-primary-500 rounded-t" />

              <div className="flex-1 bg-gradient-to-b from-gray-900 via-gray-900 to-black rounded-b border border-gray-700/50 border-t-0 shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="shrink-0 px-6 py-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Icons.Keyboard className="w-6 h-6 text-primary-400" />
                      Keyboard Shortcuts
                    </h2>
                    <p className="text-primary-100 text-sm mt-1">
                      Boost your productivity with these shortcuts
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-all"
                  >
                    <Icons.X className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Gradient divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-8">
                    {categories.map((category) => (
                      <div key={category}>
                        <h3 className="text-lg font-semibold text-primary-400 mb-3 flex items-center gap-2">
                          <div className="w-1 h-6 bg-primary-500 rounded" />
                          {category}
                        </h3>
                        <div className="space-y-2">
                          {shortcuts
                            .filter((s) => s.category === category)
                            .map((shortcut, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-all"
                              >
                                <span className="text-white text-sm">
                                  {shortcut.description}
                                </span>
                                <div className="flex items-center gap-1">
                                  {shortcut.keys.map((key, i) => (
                                    <div key={i} className="flex items-center gap-1">
                                      <kbd className="px-2.5 py-1.5 text-xs font-semibold text-white bg-gray-800 border border-gray-600 rounded shadow-sm">
                                        {key}
                                      </kbd>
                                      {i < shortcut.keys.length - 1 && (
                                        <span className="text-gray-500 text-xs">+</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pro Tip */}
                  <div className="mt-8 p-4 bg-primary-500/20 border border-primary-500/30 rounded">
                    <div className="flex items-start gap-3">
                      <Icons.Lightbulb className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white text-sm font-semibold mb-1">Pro Tip</p>
                        <p className="text-primary-100 text-sm">
                          Press <kbd className="px-1.5 py-0.5 mx-1 text-xs font-semibold text-white bg-gray-800 border border-gray-600 rounded">?</kbd>
                          anytime to quickly access this shortcuts guide!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                <div className="shrink-0 px-6 py-3 bg-white/5 flex items-center justify-between">
                  <p className="text-gray-400 text-xs">
                    Tip: Most shortcuts work across all apps
                  </p>
                  <p className="text-gray-500 text-xs">
                    Press <span className="text-primary-400">Esc</span> to close
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
