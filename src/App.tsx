import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Desktop } from './components/Desktop';
import { LockScreen } from './components/LockScreen';
import { useDesktopStore } from './store/desktopStore';
import { ThemeProvider } from './theme';
import { WindowLab } from './components/WindowLab';

function App() {
  const [isReady, setIsReady] = useState(false);
  const [path, setPath] = useState(window.location.pathname);
  const inLab = path === '/window-lab';
  const [desktopVisited, setDesktopVisited] = useState(!inLab);
  useEffect(() => {
    const onNavigate = () => {
      setPath(window.location.pathname);
      if (window.location.pathname !== '/window-lab') setDesktopVisited(true);
    };
    window.addEventListener('popstate', onNavigate);
    return () => window.removeEventListener('popstate', onNavigate);
  }, []);
  const isScreenLocked = useDesktopStore((state) => state.isScreenLocked);
  const desktopRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const handleBootComplete = useCallback(() => setIsReady(true), []);
  const isBlocked = isReady && isScreenLocked;

  useLayoutEffect(() => {
    const desktop = desktopRef.current;
    if (!desktop) return;
    if (isBlocked || inLab) {
      if (desktop.contains(document.activeElement)) previousFocus.current = document.activeElement as HTMLElement;
      desktop.setAttribute('inert', '');
    } else {
      desktop.removeAttribute('inert');
      if (previousFocus.current?.isConnected) previousFocus.current.focus();
      else if (isReady) desktop.querySelector<HTMLButtonElement>('button')?.focus();
    }
  }, [isBlocked, isReady, inLab, desktopVisited]);

  return (
    <ThemeProvider>
      {desktopVisited && <div ref={desktopRef} aria-hidden={isBlocked || inLab || undefined} style={{ display: inLab ? 'none' : undefined, visibility: isBlocked ? 'hidden' : undefined }}>
        <Desktop onBootComplete={handleBootComplete} />
      </div>}
      {inLab && <WindowLab />}
      <AnimatePresence>
        {isBlocked && !inLab && <LockScreen key="lock-screen" />}
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default App;
