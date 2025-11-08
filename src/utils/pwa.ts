// PWA installation and service worker utilities

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered successfully:', registration.scope);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    });
  }
}

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function initPWAInstallPrompt(callback?: (canInstall: boolean) => void) {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    
    if (callback) {
      callback(true);
    }
  });

  window.addEventListener('appinstalled', () => {
    console.log('✅ Lumi PWA installed successfully!');
    deferredPrompt = null;
  });
}

export async function showInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) {
    console.log('Install prompt not available');
    return false;
  }

  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User ${outcome} the install prompt`);
    deferredPrompt = null;
    
    return outcome === 'accepted';
  } catch (error) {
    console.error('Error showing install prompt:', error);
    return false;
  }
}

export function canInstallPWA(): boolean {
  return deferredPrompt !== null;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  console.log('Notification permission:', permission);
  return permission;
}

// Check if app is running as PWA
export function isPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}

// Get installation status
export function getInstallationStatus(): 'installed' | 'installable' | 'not-installable' {
  if (isPWA()) {
    return 'installed';
  }
  if (canInstallPWA()) {
    return 'installable';
  }
  return 'not-installable';
}
