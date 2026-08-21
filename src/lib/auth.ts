import { supabase } from './supabaseClient';

export async function login(email, password) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function logout() {
  return await supabase.auth.signOut();
}

export async function getSession() {
  return await supabase.auth.getSession();
}
