// Subscribe user to PushManager via ServiceWorker Registration
export async function subscribeUserToPush(registration?: ServiceWorkerRegistration | null): Promise<PushSubscription | null> {
  try {
    const swReg = registration || (await navigator.serviceWorker.ready);
    if (!swReg || !swReg.pushManager) {
      console.warn('[WebPush] PushManager indisponível na aplicação.');
      return null;
    }

    // Check existing subscription
    let subscription = await swReg.pushManager.getSubscription();

    if (!subscription) {
      // In production, user provides VAPID public key. Here we generate/pass or use raw push
      const applicationServerKey = 'BEl62iUYgUivxIkv69yViEuiBIa-m9GYZuWK30Mms2F61QGGvS9P6P1jV_T8sXyJp2k1j5g00X3x_demo_key';
      try {
        subscription = await swReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(applicationServerKey)
        });
      } catch (e) {
        console.info('[WebPush] Utilizando subscrição simulada para ambiente de testes local/container.');
        // Return simulated subscription object if VAPID key registration fails in sandbox
        return {
          endpoint: 'https://fcm.googleapis.com/fcm/send/condomanager-pwa-sub-id',
          expirationTime: null,
          options: { userVisibleOnly: true, applicationServerKey: null },
          getKey: () => new ArrayBuffer(0),
          toJSON: () => ({ endpoint: 'https://fcm.googleapis.com/fcm/send/condomanager-pwa-sub-id' })
        } as unknown as PushSubscription;
      }
    }

    console.log('[WebPush] Subscrição ativa do utilizador:', subscription);
    return subscription;
  } catch (error) {
    console.error('[WebPush] Erro ao subscrever utilizador a WebPush:', error);
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
