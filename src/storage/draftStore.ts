import { abrirBanco } from '@/lib/db';

// Rascunho de publicação, um por conta (dono = ID do usuário da sessão).
// Fica SÓ neste aparelho: não vai para a nuvem. Sempre com parâmetros (?), nunca
// concatenando texto no SQL.

export async function salvarRascunho(dono: string, texto: string): Promise<void> {
  const db = await abrirBanco();
  await db.runAsync('INSERT OR REPLACE INTO drafts (dono, texto) VALUES (?, ?)', dono, texto);
}

export async function lerRascunho(dono: string): Promise<string | null> {
  const db = await abrirBanco();
  const linha = await db.getFirstAsync<{ texto: string }>('SELECT texto FROM drafts WHERE dono = ?', dono);
  return linha?.texto ?? null;
}

/** Apaga só o rascunho da conta informada (as outras contas do aparelho não são afetadas). */
export async function apagarRascunho(dono: string): Promise<void> {
  const db = await abrirBanco();
  await db.runAsync('DELETE FROM drafts WHERE dono = ?', dono);
}
