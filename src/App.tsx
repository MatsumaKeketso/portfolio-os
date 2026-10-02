import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Desktop } from './components/Desktop';
import { LockScreen } from './components/LockScreen';
import { useDesktopStore } from './store/desktopStore';
import { ThemeProvider } from './theme';

function App() {
  const [isReady, setIsReady] = useState(false);
  const isScreenLocked = useDesktopStore((state) => state.isScreenLocked);
  const desktopRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const handleBootComplete = useCallback(() => setIsReady(true), []);
  const isBlocked = isReady && isScreenLocked;

  useLayoutEffect(() => {
    const desktop = desktopRef.current;
    if (!desktop) return;
    if (isBlocked) {
      if (desktop.contains(document.activeElement)) previousFocus.current = document.activeElement as HTMLElement;
      desktop.setAttribute('inert', '');
    } else {
      desktop.removeAttribute('inert');
      if (previousFocus.current?.isConnected) previousFocus.current.focus();
      else if (isReady) desktop.querySelector<HTMLButtonElement>('button')?.focus();
    }
  }, [isBlocked, isReady]);

  return (
    <ThemeProvider>
      <div ref={desktopRef} aria-hidden={isBlocked || undefined}>
        <Desktop onBootComplete={handleBootComplete} />
      </div>
      <AnimatePresence>
        {isBlocked && <LockScreen key="lock-screen" />}
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default App;
