import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Button } from './ui/button';

const WELCOME_STORAGE_KEY = 'portfolioOS_welcomeShown';

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Icons.Monitor,
    title: 'Desktop OS Experience',
    description: 'Explore apps with a familiar desktop interface. Drag, resize, and manage windows just like a real OS.',
  },
  {
    icon: Icons.Briefcase,
    title: 'The OS Is The Portfolio',
    description: 'Projects launch as apps. CV, skills, and contact live together in one tabbed surface.',
  },
  {
    icon: Icons.Zap,
    title: 'Interactive & Fast',
    description: 'Built with React and optimized for performance. Works offline as a Progressive Web App.',
  },
  {
    icon: Icons.Lock,
    title: 'Admin Protected',
    description: 'Visitors can explore freely, but only authenticated users can modify settings and content.',
  },
];

const shortcuts = [
  { keys: 'Double-click', action: 'Open desktop icons' },
  { keys: 'Ctrl + Shift + A', action: 'Admin login' },
  { keys: 'Escape', action: 'Close menus' },
  { keys: '?', action: 'Show keyboard shortcuts' },
];

export function WelcomeScreen() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem(WELCOME_STORAGE_KEY);
    if (!hasSeenWelcome) {
      setTimeout(() => setIsOpen(true), 500);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(WELCOME_STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1);
    else handleClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-[20000] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl bg-os-ink-950 rounded-lg border border-white/[0.08] shadow-os-window overflow-hidden"
        >
          {/* Step 0: Welcome */}
          {currentStep === 0 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-os-ink-800 border border-white/[0.08] rounded-xl mb-4">
                  <Icons.Sparkles className="w-8 h-8 text-white/80" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Welcome to Keketso OS</h1>
                <p className="text-white/50 text-sm">A portfolio operating system by Keketso — built by Generative Studio</p>
              </div>

              <div className="h-px bg-white/[0.07] mb-7" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="bg-white/[0.04] border border-white/[0.08] rounded-lg p-4 hover:bg-white/[0.06] transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-os-ink-800 rounded flex items-center justify-center flex-shrink-0 border border-white/[0.08]">
                          <Icon className="w-4 h-4 text-white/60" />
                        </div>
                        <div>
                          <h3 className="text-white text-sm font-semibold mb-1">{feature.title}</h3>
                          <p className="text-white/40 text-xs leading-relaxed">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-white/30 text-xs text-center">Click Next to learn about keyboard shortcuts and navigation</p>
            </div>
          )}

          {/* Step 1: Keyboard Shortcuts */}
          {currentStep === 1 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-os-ink-800 border border-white/[0.08] rounded-xl mb-4">
                  <Icons.Keyboard className="w-7 h-7 text-white/80" />
                </div>
                <h2 className="text-xl font-bold text-white mb-1">Keyboard Shortcuts</h2>
                <p className="text-white/50 text-sm">Master these shortcuts for a faster experience</p>
              </div>

              <div className="h-px bg-white/[0.07] mb-6" />

              <div className="space-y-2 mb-8">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between bg-white/[0.04] border border-white/[0.08] rounded px-4 py-3">
                    <span className="text-white/70 text-sm">{shortcut.action}</span>
                    <kbd className="px-2.5 py-1 bg-os-ink-800 border border-white/[0.12] rounded text-white/80 text-xs font-mono">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>

              <div className="bg-white/[0.04] border border-white/[0.08] rounded p-4">
                <div className="flex items-start gap-3">
                  <Icons.Lightbulb className="w-4 h-4 text-white/40 mt-0.5 flex-shrink-0" />
                  <p className="text-white/50 text-sm">
                    Press <kbd className="px-1.5 py-0.5 bg-os-ink-800 border border-white/[0.12] rounded text-xs font-mono text-white/70">?</kbd> anytime to view all keyboard shortcuts
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Getting Started */}
          {currentStep === 2 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-os-ink-800 border border-white/[0.08] rounded-xl mb-4">
                  <Icons.Rocket className="w-7 h-7 text-white/80" />
                </div>
                <h2 className="text-xl font-bold text-white mb-1">Ready to Explore</h2>
                <p className="text-white/50 text-sm">Here's how to get started</p>
              </div>

              <div className="h-px bg-white/[0.07] mb-6" />

              <div className="space-y-3 mb-8">
                {[
                  { n: '1', title: 'Explore Desktop Icons', body: 'Double-click icons to open apps. Hover for previews. Drag to reorder.' },
                  { n: '2', title: 'Use the Start Menu', body: 'Click the grid icon in the taskbar to browse all available applications.' },
                  { n: '3', title: 'Manage Windows', body: 'Resize, minimize, maximize, and close windows. Multiple apps can run simultaneously.' },
                ].map(({ n, title, body }) => (
                  <div key={n} className="flex items-start gap-4 bg-white/[0.04] border border-white/[0.08] rounded-lg p-4">
                    <div className="w-7 h-7 bg-os-ink-800 border border-white/[0.08] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white/60 text-xs font-bold">{n}</span>
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-semibold mb-1">{title}</h4>
                      <p className="text-white/40 text-xs">{body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white/[0.04] border border-white/[0.08] rounded p-4 text-center">
                <p className="text-white/60 text-sm font-medium mb-1">Have fun exploring!</p>
                <p className="text-white/30 text-xs">This welcome screen won't show again, but you can always access help via keyboard shortcuts.</p>
              </div>
            </div>
          )}

          {/* Navigation footer */}
          <div className="h-px bg-white/[0.07]" />
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((step) => (
                <div
                  key={step}
                  className={`h-1.5 rounded-full transition-all ${step === currentStep ? 'w-6 bg-white/60' : 'w-1.5 bg-white/20'}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleClose} variant="ink-ghost" size="sm">
                Skip Tour
              </Button>
              {currentStep > 0 && (
                <Button onClick={() => setCurrentStep(currentStep - 1)} variant="soft-system-primary" size="sm">
                  Previous
                </Button>
              )}
              <Button onClick={handleNext} variant="ink" size="sm" className="flex items-center gap-1.5">
                {currentStep === 2 ? (
                  <><span>Get Started</span><Icons.Check className="w-3.5 h-3.5" /></>
                ) : (
                  <><span>Next</span><Icons.ChevronRight className="w-3.5 h-3.5" /></>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
