import { ehErroDeRede } from '@/lib/erros';
import { supabase } from '@/lib/supabase';
import { lerFeed, salvarFeed } from '@/storage/feedCache';

/** Tipo da publicação (coluna posts.tipo, validada no banco por um CHECK). */
export type TipoPost = 'projeto' | 'duvida' | 'conquista';
export const TIPOS_POST: { id: TipoPost; rotulo: string }[] = [
  { id: 'projeto', rotulo: 'Projeto' },
  { id: 'duvida', rotulo: 'Dúvida' },
  { id: 'conquista', rotulo: 'Conquista' },
];

/** Publicação já pronta para a tela (com nome do autor e contadores). */
export type Post = {
  id: string;
  texto: string;
  tipo: TipoPost;
  criado_em: string;
  /** Preenchido quando o autor editou o texto. */
  editado_em: string | null;
  autor_id: string;
  autor_nome: string;
  curtidas: number;
  comentarios: number;
  /** true se a pessoa logada curtiu este post. */
  curtido: boolean;
  /** Só em dúvidas: ID do comentário que o autor marcou como solução. */
  resolvido_por: string | null;
};

// Formato cru que o Supabase devolve para o select abaixo.
type LinhaPost = {
  id: string;
  texto: string;
  tipo: TipoPost | null;
  criado_em: string;
  editado_em: string | null;
  autor_id: string;
  resolvido_por: string | null;
  profiles: { nome: string } | null;
  likes: { count: number }[];
  comments: { count: number }[];
};

// "profiles!posts_autor_id_fkey" diz QUAL ligação usar para achar o autor: como likes e
// comments também ligam posts a profiles, só "profiles(nome)" fica ambíguo (erro PGRST201).
// Pelo mesmo motivo, "comments!comments_post_id_fkey": posts.resolvido_por também aponta
// para comments, então existem duas ligações entre as tabelas e precisamos dizer qual contar.
const CAMPOS =
  'id, texto, tipo, criado_em, editado_em, autor_id, resolvido_por, profiles!posts_autor_id_fkey(nome), likes(count), comments!comments_post_id_fkey(count)';
export const LIMITE_FEED = 30;
export const TEXTO_MAXIMO = 500;

/** Remove os curingas do LIKE para a busca tratar % e _ como texto comum. */
function escaparBusca(termo: string) {
  return termo.replace(/[\\%_]/g, (c) => `\\${c}`);
}

function paraPost(l: LinhaPost, curtidos: Set<string>): Post {
  return {
    id: l.id,
    texto: l.texto,
    tipo: l.tipo ?? 'projeto',
    criado_em: l.criado_em,
    editado_em: l.editado_em ?? null,
    autor_id: l.autor_id,
    autor_nome: l.profiles?.nome ?? 'Pessoa',
    curtidas: l.likes[0]?.count ?? 0,
    comentarios: l.comments[0]?.count ?? 0,
    curtido: curtidos.has(l.id),
    resolvido_por: l.resolvido_por ?? null,
  };
}

/**
 * Busca publicações (mais recentes primeiro, até 30).
 * - sem filtro: feed de todos (aba Recentes)
 * - autorId: só os posts dessa pessoa (aba Minhas, perfis)
 * - termo: busca por texto (Explorar → Posts)
 * - tipo: só projetos, dúvidas ou conquistas (filtro do Explorar → Posts)
 * Lança o erro do Supabase em caso de falha (inclusive sem rede).
 */
export async function buscarPosts(
  usuarioId: string,
  filtro: { autorId?: string; termo?: string; tipo?: TipoPost } = {},
): Promise<Post[]> {
  let consulta = supabase.from('posts').select(CAMPOS).order('criado_em', { ascending: false }).limit(LIMITE_FEED);
  if (filtro.autorId) consulta = consulta.eq('autor_id', filtro.autorId);
  if (filtro.termo) consulta = consulta.ilike('texto', `%${escaparBusca(filtro.termo)}%`);
  if (filtro.tipo) consulta = consulta.eq('tipo', filtro.tipo);

  const { data, error } = await consulta;
  if (error) throw error;
  const linhas = (data ?? []) as unknown as LinhaPost[];

  // Quais desses posts EU curti? Uma consulta só, pelos IDs carregados.
  const curtidos = await idsCurtidosPor(usuarioId, linhas.map((l) => l.id));
  return linhas.map((l) => paraPost(l, curtidos));
}

/** Uma publicação pelo ID (tela de detalhe). null se não existir. */
export async function buscarPost(usuarioId: string, postId: string): Promise<Post | null> {
  const { data, error } = await supabase.from('posts').select(CAMPOS).eq('id', postId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const l = data as unknown as LinhaPost;
  const curtidos = await idsCurtidosPor(usuarioId, [l.id]);
  return paraPost(l, curtidos);
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
export async function publicar(autorId: string, texto: string, tipo: TipoPost = 'projeto'): Promise<void> {
  const { error } = await supabase.from('posts').insert({ autor_id: autorId, texto: texto.trim(), tipo });
  if (error) throw error;
}

/**
 * Edita texto e tipo do PRÓPRIO post (a política RLS editar_proprio garante isso).
 * O .select().single() faz a edição de outra pessoa virar erro (0 linhas), em vez de "sucesso" falso.
 * Mudar o tipo para algo que não seja dúvida desfaz a resolução.
 */
export async function editarPost(postId: string, texto: string, tipo: TipoPost): Promise<void> {
  const mudancas: Record<string, unknown> = { texto: texto.trim(), tipo, editado_em: new Date().toISOString() };
  if (tipo !== 'duvida') mudancas.resolvido_por = null;
  const { error } = await supabase.from('posts').update(mudancas).eq('id', postId).select('id').single();
  if (error) throw error;
}

/** Exclui o PRÓPRIO post (curtidas, comentários e avisos dele vão junto, em cascata). */
export async function excluirPost(postId: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', postId).select('id').single();
  if (error) throw error;
}

/**
 * Dúvida resolvida: o autor marca (ou desmarca, com null) o comentário que resolveu.
 * O banco recusa se o post não for dúvida ou se o comentário for de outro post,
 * e avisa quem ajudou (gatilho avisar_resolucao).
 */
export async function marcarResolvido(postId: string, comentarioId: string | null): Promise<void> {
  const { error } = await supabase
    .from('posts')
    .update({ resolvido_por: comentarioId })
    .eq('id', postId)
    .select('id')
    .single();
  if (error) throw error;
}

export type Destaque = {
  id: string;
  texto: string;
  tipo: TipoPost;
  criado_em: string;
  autor_id: string;
  autor_nome: string;
  curtidas: number;
};

/** Os posts mais curtidos dos últimos 7 dias (view destaques_semana, que respeita o RLS). */
export async function buscarDestaques(): Promise<Destaque[]> {
  const { data, error } = await supabase
    .from('destaques_semana')
    .select('id, texto, tipo, criado_em, autor_id, autor_nome, curtidas');
  if (error) throw error;
  return (data ?? []) as Destaque[];
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
    // Cache antigo (de antes dos tipos) pode não ter os campos novos: completa com o padrão.
    const posts = salvo.posts.map((p) => ({
      ...p,
      tipo: p.tipo ?? 'projeto',
      resolvido_por: p.resolvido_por ?? null,
      editado_em: p.editado_em ?? null,
    }));
    return { posts, offline: true, atualizado: salvo.atualizado };
  }
}
