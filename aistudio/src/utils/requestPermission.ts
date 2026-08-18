// Request WebPush Notification permission from user
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('[WebPush] Notificações do sistema não são suportadas neste browser.');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('[WebPush] Permissão das notificações:', permission);
    return permission;
  } catch (error) {
    console.error('[WebPush] Erro ao solicitar permissão de notificação:', error);
    return 'denied';
  }
}
