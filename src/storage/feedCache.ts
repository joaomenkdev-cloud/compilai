import { abrirBanco } from '@/lib/db';
import type { Post } from '@/services/postService';

// Última leitura do feed de cada conta, para mostrar sem internet.

export type FeedSalvo = { posts: Post[]; atualizado: string };

export async function salvarFeed(dono: string, posts: Post[]): Promise<void> {
  const db = await abrirBanco();
  await db.runAsync(
    'INSERT OR REPLACE INTO feed_cache (dono, itens, atualizado) VALUES (?, ?, ?)',
    dono,
    JSON.stringify(posts),
    new Date().toISOString(),
  );
}

/** null quando esta conta ainda não tem nenhum feed salvo no aparelho. */
export async function lerFeed(dono: string): Promise<FeedSalvo | null> {
  const db = await abrirBanco();
  const linha = await db.getFirstAsync<{ itens: string; atualizado: string }>(
    'SELECT itens, atualizado FROM feed_cache WHERE dono = ?',
    dono,
  );
  if (!linha) return null;
  try {
    return { posts: JSON.parse(linha.itens) as Post[], atualizado: linha.atualizado };
  } catch {
    return null; // conteúdo corrompido: age como se não houvesse cache
  }
}
