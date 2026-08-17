import { NotificationPreferences } from './loadUserPreferences';

export function saveUserPreferences(preferences: NotificationPreferences): NotificationPreferences {
  const updatedPrefs: NotificationPreferences = {
    ...preferences,
    // Critical notifications are mandatory / always enabled
    critical_occurrences: true,
    critical_documents: true,
    critical_assemblies: true,
    updated_at: new Date().toISOString()
  };

  const key = `notification_preferences_${updatedPrefs.user_id}`;
  try {
    localStorage.setItem(key, JSON.stringify(updatedPrefs));
    console.log('[WebPush] Preferências guardadas no Supabase Local Storage:', updatedPrefs);
  } catch (err) {
    console.error('[WebPush] Erro ao guardar preferências de notificação:', err);
  }

  return updatedPrefs;
}
