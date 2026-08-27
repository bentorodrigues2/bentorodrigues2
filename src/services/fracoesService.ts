import { supabase } from '../lib/supabaseClient';

export async function createFracao(fracao) {
  return await supabase.from('fracoes').insert(fracao);
}

export async function updateFracao(id_fracao, updates) {
  return await supabase
    .from('fracoes')
    .update(updates)
    .eq('id_fracao', id_fracao);
}

export async function updateProprietario(id_fracao, proprietario) {
  return await supabase
    .from('fracoes')
    .update({ proprietario })
    .eq('id_fracao', id_fracao);
}


