import { supabase } from '../lib/supabaseClient';

export async function signUp(email, password, metadata = {}) {
  return await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata }
  });
}

export async function signIn(email, password) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

