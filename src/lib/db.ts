import * as SQLite from 'expo-sqlite';

// Banco LOCAL do aparelho (SQLite). Guarda só duas coisas, sempre separadas por
// "dono" (o ID do usuário da sessão), então uma conta nunca lê os dados da outra:
//  - drafts: o rascunho de publicação de cada conta;
//  - feed_cache: a última leitura do feed de cada conta (para ver sem internet).
// Nunca guardamos senha aqui.

let banco: Promise<SQLite.SQLiteDatabase> | null = null;

/** Abre o banco uma única vez (as próximas chamadas reaproveitam a mesma conexão). */
export function abrirBanco(): Promise<SQLite.SQLiteDatabase> {
  if (!banco) {
    banco = (async () => {
      const db = await SQLite.openDatabaseAsync('comunidade.db');
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS drafts (
          dono TEXT PRIMARY KEY, texto TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS feed_cache (
          dono TEXT PRIMARY KEY, itens TEXT NOT NULL, atualizado TEXT NOT NULL
        );
      `);
      return db;
    })();
    // Se falhar, permite tentar abrir de novo na próxima chamada.
    banco.catch(() => {
      banco = null;
    });
  }
  return banco;
}
