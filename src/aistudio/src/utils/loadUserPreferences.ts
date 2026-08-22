export interface NotificationPreferences {
  user_id: string;
  critical_occurrences: boolean;
  critical_documents: boolean;
  critical_assemblies: boolean;
  optional_finances: boolean;
  optional_reservations: boolean;
  optional_cleaning: boolean;
  optional_general: boolean;
  updated_at: string;
}

export function getDefaultNotificationPreferences(userId: string = 'user-default'): NotificationPreferences {
  return {
    user_id: userId,
    critical_occurrences: true,
    critical_documents: true,
    critical_assemblies: true,
    optional_finances: false,
    optional_reservations: false,
    optional_cleaning: false,
    optional_general: false,
    updated_at: new Date().toISOString()
  };
}

export function loadUserPreferences(userId: string = 'user-default'): NotificationPreferences {
  const key = `notification_preferences_${userId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...getDefaultNotificationPreferences(userId),
        ...parsed,
        // Enforce critical notifications as always true
        critical_occurrences: true,
        critical_documents: true,
        critical_assemblies: true
      };
    }
  } catch (err) {
    console.error('[WebPush] Erro ao carregar preferências de notificação:', err);
  }
  return getDefaultNotificationPreferences(userId);
}
