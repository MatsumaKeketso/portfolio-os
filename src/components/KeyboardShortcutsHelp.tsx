import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  { keys: ['Ctrl', 'Shift', 'A'], description: 'Toggle Admin Mode', category: 'System' },
  { keys: ['Esc'], description: 'Close Start Menu', category: 'System' },
  { keys: ['?'], description: 'Show/Hide Keyboard Shortcuts', category: 'System' },
  { keys: ['Alt', 'F4'], description: 'Close Active Window', category: 'Windows' },
  { keys: ['Win', 'D'], description: 'Minimize All Windows', category: 'Windows' },
  { keys: ['Alt', 'Tab'], description: 'Switch Between Windows', category: 'Windows' },
  { keys: ['Ctrl', 'O'], description: 'Open File Explorer', category: 'Navigation' },
  { keys: ['Ctrl', 'S'], description: 'Save (in apps)', category: 'Navigation' },
  { keys: ['Ctrl', 'N'], description: 'New File (in apps)', category: 'Navigation' },
  { keys: ['Ctrl', 'N'], description: 'New File', category: 'File Explorer' },
  { keys: ['Ctrl', 'Shift', 'N'], description: 'New Folder', category: 'File Explorer' },
  { keys: ['Delete'], description: 'Delete Selected File', category: 'File Explorer' },
  { keys: ['F2'], description: 'Rename File', category: 'File Explorer' },
  { keys: ['Ctrl', 'S'], description: 'Save Note', category: 'Notepad' },
  { keys: ['Ctrl', 'N'], description: 'New Note', category: 'Notepad' },
];

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-16 right-4 z-[10001] w-10 h-10 rounded-full bg-os-ink-800 border border-white/[0.12] hover:bg-os-ink-700 text-white/60 hover:text-white shadow-os-card flex items-center justify-center transition-all group"
        title="Keyboard Shortcuts (Press ?)"
      >
        <Icons.Keyboard className="w-4 h-4" />
        <span className="absolute -top-9 right-0 bg-os-ink-900 border border-white/[0.08] text-white/70 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Press ? for shortcuts
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[15001] flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-os-ink-950 rounded-lg border border-white/[0.08] shadow-os-window overflow-hidden"
            >
              {/* Header */}
              <div className="shrink-0 px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <Icons.Keyboard className="w-4 h-4 text-white/50" />
                    Keyboard Shortcuts
                  </h2>
                  <p className="text-white/40 text-xs mt-0.5">Boost your productivity with these shortcuts</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/[0.08] rounded transition-colors">
                  <Icons.X className="w-4 h-4 text-white/60" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {categories.map((category) => (
                    <div key={category}>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">
                        {category}
                      </h3>
                      <div className="space-y-1">
                        {shortcuts
                          .filter((s) => s.category === category)
                          .map((shortcut, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between px-3 py-2 bg-white/[0.03] hover:bg-white/[0.06] rounded border border-white/[0.06] transition-colors"
                            >
                              <span className="text-white/70 text-sm">{shortcut.description}</span>
                              <div className="flex items-center gap-1">
                                {shortcut.keys.map((key, i) => (
                                  <div key={i} className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 text-xs font-semibold text-white/80 bg-os-ink-800 border border-white/[0.12] rounded">
                                      {key}
                                    </kbd>
                                    {i < shortcut.keys.length - 1 && (
                                      <span className="text-white/20 text-xs">+</span>
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

                <div className="mt-6 p-4 bg-white/[0.03] border border-white/[0.06] rounded">
                  <div className="flex items-start gap-3">
                    <Icons.Lightbulb className="w-4 h-4 text-white/30 flex-shrink-0 mt-0.5" />
                    <p className="text-white/40 text-sm">
                      Press <kbd className="px-1.5 py-0.5 mx-0.5 text-xs font-semibold text-white/70 bg-os-ink-800 border border-white/[0.12] rounded">?</kbd>
                      anytime to quickly access this shortcuts guide
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="h-px bg-white/[0.07]" />
              <div className="shrink-0 px-6 py-3 bg-white/[0.02] flex items-center justify-between">
                <p className="text-white/30 text-xs">Most shortcuts work across all apps</p>
                <p className="text-white/30 text-xs">Press <span className="text-white/50">Esc</span> to close</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
