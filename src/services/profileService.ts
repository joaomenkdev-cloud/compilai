import { supabase } from '@/lib/supabase';

export type Perfil = {
  id: string;
  nome: string;
  bio: string;
  /** No que a pessoa trabalha (Front-end, Back-end...). Até 3. */
  areas: string[];
  /** Linguagens e tecnologias (Python, React...). Até 15. */
  stacks: string[];
};

export const NOME_MAXIMO = 50;
export const BIO_MAXIMA = 300;

const CAMPOS = 'id, nome, bio, areas, stacks';

// Perfis criados antes das colunas novas (ou cache antigo) podem vir sem elas.
function completo(p: Partial<Perfil> & { id: string; nome: string }): Perfil {
  return { bio: '', ...p, areas: p.areas ?? [], stacks: p.stacks ?? [] } as Perfil;
}

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
  const { data, error } = await supabase.from('profiles').select(CAMPOS).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? completo(data) : null;
}

/** Explorar → Pessoas: busca por parte do nome, sem diferenciar maiúsculas. */
export async function buscarPessoas(termo: string): Promise<Perfil[]> {
  const seguro = termo.replace(/[\\%_]/g, (c) => `\\${c}`);
  const { data, error } = await supabase
    .from('profiles')
    .select(CAMPOS)
    .ilike('nome', `%${seguro}%`)
    .order('nome')
    .limit(30);
  if (error) throw error;
  return (data ?? []).map(completo);
}

/** "Quem também usa React?": pessoas que têm essa stack no perfil (stacks @> {React}). */
export async function buscarPorStack(stack: string): Promise<Perfil[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(CAMPOS)
    .contains('stacks', [stack])
    .order('nome')
    .limit(30);
  if (error) throw error;
  return (data ?? []).map(completo);
}

/**
 * Salva nome, bio, áreas e stacks no perfil do ID da sessão. O .select().single() devolve
 * a linha gravada: se o banco (RLS) não deixar alterar, não volta linha e vira erro —
 * assim a tela só confirma "Perfil atualizado" quando o dado foi mesmo salvo.
 * O banco também confere os limites (até 3 áreas da lista, até 15 stacks).
 */
export async function atualizarPerfil(
  id: string,
  nome: string,
  bio: string,
  areas?: string[],
  stacks?: string[],
): Promise<Perfil> {
  // Áreas e stacks só entram quando enviadas: quem não passa as listas não as apaga.
  const mudancas: Record<string, unknown> = { nome: nome.trim(), bio: bio.trim() };
  if (areas) mudancas.areas = areas;
  if (stacks) mudancas.stacks = stacks;
  const { data, error } = await supabase
    .from('profiles')
    .update(mudancas)
    .eq('id', id)
    .select(CAMPOS)
    .single();
  if (error) throw error;
  return completo(data);
}

/** Algumas pessoas da comunidade (coluna "Pessoas" do feed no computador), menos quem está logado. */
export async function listarPessoas(excetoId: string, limite = 6): Promise<Perfil[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(CAMPOS)
    .neq('id', excetoId)
    .order('nome')
    .limit(limite);
  if (error) throw error;
  return (data ?? []).map(completo);
}
