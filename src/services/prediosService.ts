import { supabase } from '../lib/supabaseClient';

export async function createPredio(predio) {
  return await supabase.from('predios').insert(predio);
}

export async function updatePredio(id_predio, updates) {
  return await supabase
    .from('predios')
    .update(updates)
    .eq('id_predio', id_predio);
}

export async function getPredios() {
  return await supabase.from('predios').select('*');
}

