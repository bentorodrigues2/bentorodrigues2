import { supabase } from '../lib/supabaseClient';

export async function getProfile(userId) {
  return await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
}

export async function updateProfile(userId, updates) {
  return await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
}


