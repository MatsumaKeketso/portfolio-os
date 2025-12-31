import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker, initPWAInstallPrompt } from './utils/pwa';

// Register PWA service worker
if (import.meta.env.PROD) {
  registerServiceWorker();
  initPWAInstallPrompt();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
