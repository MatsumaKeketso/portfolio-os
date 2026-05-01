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
      // Delay showing welcome screen slightly for better UX
      setTimeout(() => setIsOpen(true), 500);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(WELCOME_STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[20000] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-3xl flex flex-col mx-auto"
        >
          {/* Top gradient accent line */}
          <div className="w-full h-1 bg-gradient-to-r from-primary-500 via-tertiary-500 to-primary-500 rounded-t" />

          <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-black rounded-b border border-gray-700/50 border-t-0 shadow-2xl overflow-hidden">
            {/* Step 0: Welcome */}
            {currentStep === 0 && (
              <div className="p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-tertiary-600 rounded-full mb-4">
                    <Icons.Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-white mb-3">
                    Welcome to Keketso OS
                  </h1>
                  <p className="text-gray-300 text-lg">
                    A portfolio operating system by Keketso — built by Generative Studio
                  </p>
                </div>

                {/* Gradient divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-8" />

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={index}
                        className="bg-white/5 border border-gray-700/50 rounded-lg p-4 hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-tertiary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                            <p className="text-gray-400 text-sm">{feature.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Continue prompt */}
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-4">
                    Click Next to learn about keyboard shortcuts and navigation
                  </p>
                </div>
              </div>
            )}

            {/* Step 1: Keyboard Shortcuts */}
            {currentStep === 1 && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-tertiary-600 rounded-full mb-4">
                    <Icons.Keyboard className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Keyboard Shortcuts
                  </h2>
                  <p className="text-gray-300">
                    Master these shortcuts for a faster experience
                  </p>
                </div>

                {/* Gradient divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-6" />

                {/* Shortcuts List */}
                <div className="space-y-3 mb-8">
                  {shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white/5 border border-gray-700/50 rounded-lg p-4 hover:bg-white/10 transition-all"
                    >
                      <span className="text-gray-300">{shortcut.action}</span>
                      <kbd className="px-3 py-1.5 bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 rounded text-white text-sm font-mono shadow-md">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                </div>

                {/* Tip */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Icons.Lightbulb className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-blue-300 font-semibold mb-1">Pro Tip</h4>
                      <p className="text-blue-200 text-sm">
                        Press <kbd className="px-2 py-0.5 bg-blue-500/20 rounded text-xs">?</kbd> anytime to view all keyboard shortcuts
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Getting Started */}
            {currentStep === 2 && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-tertiary-600 rounded-full mb-4">
                    <Icons.Rocket className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Ready to Explore!
                  </h2>
                  <p className="text-gray-300">
                    Here's how to get started
                  </p>
                </div>

                {/* Gradient divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-6" />

                {/* Getting Started Steps */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-4 bg-white/5 border border-gray-700/50 rounded-lg p-5">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-tertiary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Explore Desktop Icons</h4>
                      <p className="text-gray-400 text-sm">
                        Double-click icons to open apps. Hover for previews. Drag to reorder.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 bg-white/5 border border-gray-700/50 rounded-lg p-5">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-tertiary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Use the Start Menu</h4>
                      <p className="text-gray-400 text-sm">
                        Click the grid icon in the taskbar to browse all available applications.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 bg-white/5 border border-gray-700/50 rounded-lg p-5">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-tertiary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Manage Windows</h4>
                      <p className="text-gray-400 text-sm">
                        Resize, minimize, maximize, and close windows. Multiple apps can run simultaneously.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Final message */}
                <div className="bg-gradient-to-r from-primary-500/10 to-tertiary-500/10 border border-primary-500/30 rounded-lg p-5 text-center">
                  <p className="text-white font-semibold mb-2">Have fun exploring!</p>
                  <p className="text-gray-300 text-sm">
                    This welcome screen won't show again, but you can always access help via keyboard shortcuts.
                  </p>
                </div>
              </div>
            )}

            {/* Gradient divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

            {/* Navigation */}
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {[0, 1, 2].map((step) => (
                  <div
                    key={step}
                    className={`h-2 rounded-full transition-all ${step === currentStep
                      ? 'w-8 bg-gradient-to-r from-primary-500 to-tertiary-500'
                      : 'w-2 bg-gray-700'
                      }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  size="sm"
                >
                  Skip Tour
                </Button>
                {currentStep > 0 && (
                  <Button
                    onClick={handlePrevious}
                    variant="soft-system-primary"
                    size="sm"
                  >
                    Previous
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  variant="solid-brand-primary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {currentStep === 2 ? (
                    <>
                      Get Started
                      <Icons.Check className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <Icons.ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
