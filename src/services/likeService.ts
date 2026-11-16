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
