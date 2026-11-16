import { supabase } from '@/lib/supabase';

// Os avisos são criados pelo BANCO (gatilho avisar_autor). O app só lê e marca como lido.

export type Aviso = {
  id: string;
  tipo: 'curtida' | 'comentario';
  criado_em: string;
  lida_em: string | null;
  post_id: string;
  ator_nome: string;
  /** Trecho do post que recebeu a interação. */
  trecho: string;
};

type LinhaAviso = {
  id: string;
  tipo: 'curtida' | 'comentario';
  criado_em: string;
  lida_em: string | null;
  post_id: string;
  // notifications tem duas ligações com profiles (destino e ator): dizemos qual usar.
  ator: { nome: string } | null;
  post: { texto: string } | null;
};

/** Avisos da pessoa logada (a RLS só devolve os que têm destino_id = ela). */
export async function listarAvisos(): Promise<Aviso[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, tipo, criado_em, lida_em, post_id, ator:profiles!notifications_ator_id_fkey(nome), post:posts(texto)')
    .order('criado_em', { ascending: false })
    .limit(50);
  if (error) throw error;
  return ((data ?? []) as unknown as LinhaAviso[]).map((l) => ({
    id: l.id,
    tipo: l.tipo,
    criado_em: l.criado_em,
    lida_em: l.lida_em,
    post_id: l.post_id,
    ator_nome: l.ator?.nome ?? 'Alguém',
    trecho: l.post?.texto ?? '',
  }));
}

/** Quantos avisos ainda não foram lidos (para o contador do menu). */
export async function contarNaoLidos(): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .is('lida_em', null);
  if (error) throw error;
  return count ?? 0;
}

/** Grava lida_em. É a ÚNICA coluna que o app tem permissão de alterar (grant update (lida_em)). */
export async function marcarComoLido(id: string): Promise<string> {
  const agora = new Date().toISOString();
  const { error } = await supabase.from('notifications').update({ lida_em: agora }).eq('id', id);
  if (error) throw error;
  return agora;
}
