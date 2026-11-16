import { supabase } from '@/lib/supabase';

export type Perfil = { id: string; nome: string; bio: string };

/**
 * Cria o perfil no primeiro login. Se ele já existir, NÃO mexe (preserva o que a
 * pessoa editou): INSERT ... ON CONFLICT DO NOTHING (upsert com ignoreDuplicates).
 */
export async function garantirPerfil(id: string, nome: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id, nome }, { onConflict: 'id', ignoreDuplicates: true });
  if (error) throw error;
}

export async function buscarPerfil(id: string): Promise<Perfil | null> {
  const { data, error } = await supabase.from('profiles').select('id, nome, bio').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}
