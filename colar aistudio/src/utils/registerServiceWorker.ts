// Register Service Worker for PWA & WebPush Notifications
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('[ServiceWorker] Service Workers não são suportados neste browser.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    console.log('[ServiceWorker] Registado com sucesso. Scope:', registration.scope);
    return registration;
  } catch (error) {
    console.error('[ServiceWorker] Falha ao registar Service Worker:', error);
    return null;
  }
}
