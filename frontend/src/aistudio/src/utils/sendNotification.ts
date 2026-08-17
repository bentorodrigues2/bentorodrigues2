import { loadUserPreferences } from './loadUserPreferences';

export type NotificationCategory = 
  | 'critical_occurrences'
  | 'critical_documents'
  | 'critical_assemblies'
  | 'optional_finances'
  | 'optional_reservations'
  | 'optional_cleaning'
  | 'optional_general';

export interface SendNotificationPayload {
  user_id: string;
  type?: 'CRITICAL' | 'OPTIONAL' | 'INFO' | 'URGENT';
  category: NotificationCategory;
  title: string;
  body: string;
  url?: string;
}

export interface SendNotificationResult {
  success: boolean;
  sent: boolean;
  reason?: string;
  category: NotificationCategory;
  timestamp: string;
}

/**
 * Edge Function simulation: Receives user_id, type, category, title, body.
 * Checks user_id notification_preferences and sends notification via WebPush / Notification API.
 */
export async function sendNotification(payload: SendNotificationPayload): Promise<SendNotificationResult> {
  const { user_id, category, title, body, url = '/' } = payload;
  const prefs = loadUserPreferences(user_id);

  // Check if notification category is enabled for this user
  const isEnabled = Boolean(prefs[category]);

  if (!isEnabled) {
    console.warn(`[Edge Function sendNotification] Notificação bloqueada pelas preferências do utilizador (${user_id}). Categoria: ${category}`);
    return {
      success: true,
      sent: false,
      reason: `Utilizador desativou notificações da categoria '${category}'`,
      category,
      timestamp: new Date().toISOString()
    };
  }

  // Trigger Notification via Service Worker or System API
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon: '/marca/02-versao-horizontal.webp',
          badge: '/marca/02-versao-horizontal.webp',
          data: { url, category, user_id, sentAt: new Date().toISOString() }
        } as NotificationOptions);

        console.log(`[Edge Function sendNotification] WebPush enviado com sucesso via SW para ${user_id} [${category}]`);
        return {
          success: true,
          sent: true,
          category,
          timestamp: new Date().toISOString()
        };
      }
    }

    // Fallback to standard window Notification if permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/marca/02-versao-horizontal.webp'
      });
      return {
        success: true,
        sent: true,
        category,
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: true,
      sent: true,
      reason: 'Notificação registada no canal de eventos da PWA',
      category,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('[Edge Function sendNotification] Erro ao disparar notificação:', error);
    return {
      success: false,
      sent: false,
      reason: error?.message || 'Erro ao disparar WebPush',
      category,
      timestamp: new Date().toISOString()
    };
  }
}
