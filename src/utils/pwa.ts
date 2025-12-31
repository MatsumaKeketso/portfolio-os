/**
 * PWA utilities for service worker registration and install prompts
 */

let deferredPrompt: any = null;

/**
 * Register the service worker
 */
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully:', registration.scope);

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60000); // Check every minute

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is ready
              console.log('New version available! Reload to update.');

              // Optionally show update notification
              if (confirm('A new version is available! Reload to update?')) {
                window.location.reload();
              }
            }
          });
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

/**
 * Initialize PWA install prompt listeners
 */
export const initPWAInstallPrompt = (): void => {
  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();

    // Stash the event so it can be triggered later
    deferredPrompt = e;

    console.log('PWA install prompt ready');

    // Optionally show custom install button
    const event = new CustomEvent('pwa-install-available');
    window.dispatchEvent(event);
  });

  // Listen for successful installation
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed successfully');
    deferredPrompt = null;

    // Track installation (analytics)
    const event = new CustomEvent('pwa-installed');
    window.dispatchEvent(event);
  });
};

/**
 * Show the install prompt
 */
export const showInstallPrompt = async (): Promise<boolean> => {
  if (!deferredPrompt) {
    console.log('Install prompt not available');
    return false;
  }

  try {
    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response: ${outcome}`);

    // Clear the deferred prompt
    deferredPrompt = null;

    return outcome === 'accepted';
  } catch (error) {
    console.error('Error showing install prompt:', error);
    return false;
  }
};

/**
 * Check if app is installed
 */
export const isPWAInstalled = (): boolean => {
  // Check if running in standalone mode (installed)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  // Check iOS standalone mode
  const isIOSStandalone = (window.navigator as any).standalone === true;

  return isStandalone || isIOSStandalone;
};

/**
 * Check if install prompt is available
 */
export const canInstallPWA = (): boolean => {
  return deferredPrompt !== null;
};

/**
 * Get device type
 */
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;

  if (width < 768) {
    return 'mobile';
  } else if (width < 1024) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};

/**
 * Check if device supports touch
 */
export const isTouchDevice = (): boolean => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
};
