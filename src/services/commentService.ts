import { supabase } from '@/lib/supabase';

export type Comentario = {
  id: string;
  texto: string;
  criado_em: string;
  autor_id: string;
  autor_nome: string;
  /** Preenchido quando o autor editou o comentário. */
  editado_em: string | null;
};

type LinhaComentario = Omit<Comentario, 'autor_nome'> & { profiles: { nome: string } | null };

export const COMENTARIO_MAXIMO = 500;

/** Comentários de um post em ordem cronológica (mais antigo primeiro, como uma conversa). */
export async function listarComentarios(postId: string): Promise<Comentario[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('id, texto, criado_em, editado_em, autor_id, profiles!comments_autor_id_fkey(nome)')
    .eq('post_id', postId)
    .order('criado_em', { ascending: true });
  if (error) throw error;
  return ((data ?? []) as unknown as LinhaComentario[]).map((l) => ({
    id: l.id,
    texto: l.texto,
    criado_em: l.criado_em,
    autor_id: l.autor_id,
    autor_nome: l.profiles?.nome ?? 'Pessoa',
    editado_em: l.editado_em ?? null,
  }));
}

/** Grava o comentário ligado ao post (post_id) e a quem escreveu (autor_id). */
export async function comentar(postId: string, autorId: string, texto: string): Promise<void> {
  const { error } = await supabase.from('comments').insert({ post_id: postId, autor_id: autorId, texto: texto.trim() });
  if (error) throw error;
}

/** Edita o PRÓPRIO comentário (política RLS editar_proprio). 0 linhas alteradas vira erro. */
export async function editarComentario(id: string, texto: string): Promise<void> {
  const { error } = await supabase
    .from('comments')
    .update({ texto: texto.trim(), editado_em: new Date().toISOString() })
    .eq('id', id)
    .select('id')
    .single();
  if (error) throw error;
}

/** Exclui o PRÓPRIO comentário. Se ele era a solução de uma dúvida, a dúvida volta a "aberta". */
export async function excluirComentario(id: string): Promise<void> {
  const { error } = await supabase.from('comments').delete().eq('id', id).select('id').single();
  if (error) throw error;
}
