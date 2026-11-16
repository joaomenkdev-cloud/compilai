import { supabase } from '@/lib/supabase';

export type Comentario = {
  id: string;
  texto: string;
  criado_em: string;
  autor_id: string;
  autor_nome: string;
};

type LinhaComentario = Omit<Comentario, 'autor_nome'> & { profiles: { nome: string } | null };

export const COMENTARIO_MAXIMO = 500;

/** Comentários de um post em ordem cronológica (mais antigo primeiro, como uma conversa). */
export async function listarComentarios(postId: string): Promise<Comentario[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('id, texto, criado_em, autor_id, profiles!comments_autor_id_fkey(nome)')
    .eq('post_id', postId)
    .order('criado_em', { ascending: true });
  if (error) throw error;
  return ((data ?? []) as unknown as LinhaComentario[]).map((l) => ({
    id: l.id,
    texto: l.texto,
    criado_em: l.criado_em,
    autor_id: l.autor_id,
    autor_nome: l.profiles?.nome ?? 'Pessoa',
  }));
}

/** Grava o comentário ligado ao post (post_id) e a quem escreveu (autor_id). */
export async function comentar(postId: string, autorId: string, texto: string): Promise<void> {
  const { error } = await supabase.from('comments').insert({ post_id: postId, autor_id: autorId, texto: texto.trim() });
  if (error) throw error;
}
