import { ehErroDeRede } from '@/lib/erros';
import { supabase } from '@/lib/supabase';
import { lerFeed, salvarFeed } from '@/storage/feedCache';

/** Publicação já pronta para a tela (com nome do autor e contadores). */
export type Post = {
  id: string;
  texto: string;
  criado_em: string;
  autor_id: string;
  autor_nome: string;
  curtidas: number;
  comentarios: number;
  /** true se a pessoa logada curtiu este post. */
  curtido: boolean;
};

// Formato cru que o Supabase devolve para o select abaixo.
type LinhaPost = {
  id: string;
  texto: string;
  criado_em: string;
  autor_id: string;
  profiles: { nome: string } | null;
  likes: { count: number }[];
  comments: { count: number }[];
};

// "profiles!posts_autor_id_fkey" diz QUAL ligação usar para achar o autor: como likes e
// comments também ligam posts a profiles, só "profiles(nome)" fica ambíguo (erro PGRST201).
const CAMPOS = 'id, texto, criado_em, autor_id, profiles!posts_autor_id_fkey(nome), likes(count), comments(count)';
export const LIMITE_FEED = 30;
export const TEXTO_MAXIMO = 500;

/** Remove os curingas do LIKE para a busca tratar % e _ como texto comum. */
function escaparBusca(termo: string) {
  return termo.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/**
 * Busca publicações (mais recentes primeiro, até 30).
 * - sem filtro: feed de todos (aba Recentes)
 * - autorId: só os posts dessa pessoa (aba Minhas, perfis)
 * - termo: busca por texto (Explorar → Posts)
 * Lança o erro do Supabase em caso de falha (inclusive sem rede).
 */
export async function buscarPosts(
  usuarioId: string,
  filtro: { autorId?: string; termo?: string } = {},
): Promise<Post[]> {
  let consulta = supabase.from('posts').select(CAMPOS).order('criado_em', { ascending: false }).limit(LIMITE_FEED);
  if (filtro.autorId) consulta = consulta.eq('autor_id', filtro.autorId);
  if (filtro.termo) consulta = consulta.ilike('texto', `%${escaparBusca(filtro.termo)}%`);

  const { data, error } = await consulta;
  if (error) throw error;
  const linhas = (data ?? []) as unknown as LinhaPost[];

  // Quais desses posts EU curti? Uma consulta só, pelos IDs carregados.
  const curtidos = await idsCurtidosPor(usuarioId, linhas.map((l) => l.id));

  return linhas.map((l) => ({
    id: l.id,
    texto: l.texto,
    criado_em: l.criado_em,
    autor_id: l.autor_id,
    autor_nome: l.profiles?.nome ?? 'Pessoa',
    curtidas: l.likes[0]?.count ?? 0,
    comentarios: l.comments[0]?.count ?? 0,
    curtido: curtidos.has(l.id),
  }));
}

/** Uma publicação pelo ID (tela de detalhe). null se não existir. */
export async function buscarPost(usuarioId: string, postId: string): Promise<Post | null> {
  const { data, error } = await supabase.from('posts').select(CAMPOS).eq('id', postId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const l = data as unknown as LinhaPost;
  const curtidos = await idsCurtidosPor(usuarioId, [l.id]);
  return {
    id: l.id,
    texto: l.texto,
    criado_em: l.criado_em,
    autor_id: l.autor_id,
    autor_nome: l.profiles?.nome ?? 'Pessoa',
    curtidas: l.likes[0]?.count ?? 0,
    comentarios: l.comments[0]?.count ?? 0,
    curtido: curtidos.has(l.id),
  };
}

async function idsCurtidosPor(usuarioId: string, postIds: string[]): Promise<Set<string>> {
  if (postIds.length === 0) return new Set();
  const { data, error } = await supabase
    .from('likes')
    .select('post_id')
    .eq('autor_id', usuarioId)
    .in('post_id', postIds);
  if (error) throw error;
  return new Set((data ?? []).map((l) => l.post_id as string));
}

/** Envia um post. O banco confere (RLS) que autor_id é mesmo quem está logado. */
export async function publicar(autorId: string, texto: string): Promise<void> {
  const { error } = await supabase.from('posts').insert({ autor_id: autorId, texto: texto.trim() });
  if (error) throw error;
}

export type ResultadoFeed = {
  posts: Post[];
  /** true quando a internet falhou e estes posts vieram do cache do aparelho. */
  offline: boolean;
  /** Quando o feed mostrado foi buscado na nuvem pela última vez (ISO). */
  atualizado: string | null;
};

/**
 * FEED COM PLANO B PARA FALTA DE REDE (decisão da equipe, ver README):
 * 1. busca na nuvem (Supabase) e, deu certo, salva uma cópia no SQLite do aparelho;
 * 2. se a busca falhar POR REDE, cai em lerFeed(dono) e devolve a última cópia salva;
 * 3. se não houver cópia (primeiro uso sem internet) ou o erro não for de rede, repassa o erro.
 */
export async function buscarFeed(usuarioId: string): Promise<ResultadoFeed> {
  try {
    const posts = await buscarPosts(usuarioId);
    await salvarFeed(usuarioId, posts).catch(() => {}); // falha no cache não derruba o feed
    return { posts, offline: false, atualizado: new Date().toISOString() };
  } catch (erro) {
    if (!ehErroDeRede(erro)) throw erro;
    const salvo = await lerFeed(usuarioId);
    if (!salvo) throw erro;
    return { posts: salvo.posts, offline: true, atualizado: salvo.atualizado };
  }
}
