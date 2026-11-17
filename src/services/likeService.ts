import { supabase } from '@/lib/supabase';

/**
 * Curte ou descurte: insere ou exclui o par (post_id, autor_id).
 * Depois busca no banco o total real de curtidas, para a tela mostrar
 * o número confirmado (sem "chutar" o contador antes do retorno).
 */
export async function alternarCurtida(
  postId: string,
  usuarioId: string,
  curtidoAgora: boolean,
): Promise<{ curtido: boolean; curtidas: number }> {
  if (curtidoAgora) {
    const { error } = await supabase.from('likes').delete().eq('post_id', postId).eq('autor_id', usuarioId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('likes').insert({ post_id: postId, autor_id: usuarioId });
    // 23505 = já existia (ex.: toque duplo em dois aparelhos). Tratamos como curtido.
    if (error && error.code !== '23505') throw error;
  }

  const { count, error } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);
  if (error) throw error;
  return { curtido: !curtidoAgora, curtidas: count ?? 0 };
}

export type Curtida = { autor_id: string; nome: string; criado_em: string };

/** "Quem curtiu": pessoas que curtiram o post, da curtida mais recente para a mais antiga. */
export async function listarCurtidas(postId: string): Promise<Curtida[]> {
  const { data, error } = await supabase
    .from('likes')
    .select('autor_id, criado_em, profiles(nome)')
    .eq('post_id', postId)
    .order('criado_em', { ascending: false })
    .limit(100);
  if (error) throw error;
  type Linha = { autor_id: string; criado_em: string; profiles: { nome: string } | null };
  return ((data ?? []) as unknown as Linha[]).map((l) => ({
    autor_id: l.autor_id,
    criado_em: l.criado_em,
    nome: l.profiles?.nome ?? 'Pessoa',
  }));
}
