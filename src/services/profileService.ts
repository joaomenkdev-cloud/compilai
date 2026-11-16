import { supabase } from '@/lib/supabase';

export type Perfil = { id: string; nome: string; bio: string };

export const NOME_MAXIMO = 50;
export const BIO_MAXIMA = 300;

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

/** Explorar → Pessoas: busca por parte do nome, sem diferenciar maiúsculas. */
export async function buscarPessoas(termo: string): Promise<Perfil[]> {
  const seguro = termo.replace(/[\\%_]/g, (c) => `\\${c}`);
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nome, bio')
    .ilike('nome', `%${seguro}%`)
    .order('nome')
    .limit(30);
  if (error) throw error;
  return data ?? [];
}

/**
 * Salva nome e bio no perfil do ID da sessão. O .select().single() devolve a linha
 * gravada: se o banco (RLS) não deixar alterar, não volta linha e vira erro —
 * assim a tela só confirma "Perfil atualizado" quando o dado foi mesmo salvo.
 */
export async function atualizarPerfil(id: string, nome: string, bio: string): Promise<Perfil> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ nome: nome.trim(), bio: bio.trim() })
    .eq('id', id)
    .select('id, nome, bio')
    .single();
  if (error) throw error;
  return data;
}
