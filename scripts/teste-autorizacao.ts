/**
 * TESTE 4 · AUTORIZAÇÃO (PDF p.18)
 * "Em sessão B, tente alterar o perfil de A pela API com a chave pública.
 *  Confira em A que os dados continuam iguais."
 *
 * O script entra como B usando SÓ a chave publicável (a mesma do app),
 * acha o perfil de A, tenta mudar nome e bio de A e confere que nada mudou.
 *
 * Como rodar (Node 22.18+ executa TypeScript direto):
 *   node --env-file=.env --env-file=.env.teste scripts/teste-autorizacao.ts
 *
 * .env       → EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 * .env.teste → TESTE_B_EMAIL, TESTE_B_SENHA e TESTE_A_NOME (veja .env.teste.example)
 */
import { createClient } from '@supabase/supabase-js';

function variavel(nome: string): string {
  const valor = process.env[nome];
  if (!valor) throw new Error(`Falta a variável ${nome}. Veja o README (Teste 4).`);
  return valor;
}

async function principal() {
  const supabase = createClient(
    variavel('EXPO_PUBLIC_SUPABASE_URL'),
    variavel('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
    { auth: { persistSession: false } },
  );

  // 1) Entra como B.
  const login = await supabase.auth.signInWithPassword({
    email: variavel('TESTE_B_EMAIL'),
    password: variavel('TESTE_B_SENHA'),
  });
  if (login.error) throw new Error(`Login de B falhou: ${login.error.message}`);
  const idB = login.data.user.id;
  console.log(`✔ Sessão de B iniciada (${login.data.user.email}).`);

  // 2) Acha o perfil de A pelo nome (perfis são públicos para leitura).
  const nomeA = process.env.TESTE_A_NOME ?? 'Bia';
  const busca = await supabase.from('profiles').select('id, nome, bio').ilike('nome', `%${nomeA}%`).neq('id', idB).limit(1);
  if (busca.error) throw busca.error;
  const antes = busca.data[0];
  if (!antes) throw new Error(`Não achei nenhum perfil com "${nomeA}". Crie a conta A primeiro.`);
  console.log(`✔ Perfil de A encontrado: ${antes.nome} — bio: "${antes.bio}"`);

  // 3) Tenta alterar o perfil de A estando logado como B.
  const tentativa = await supabase
    .from('profiles')
    .update({ nome: 'Invadido pelo B', bio: 'B alterou esta bio' })
    .eq('id', antes.id)
    .select('id');
  if (tentativa.error) {
    console.log(`✔ Banco recusou a alteração: ${tentativa.error.message}`);
  } else {
    console.log(`✔ Linhas alteradas pela tentativa de B: ${tentativa.data.length}`);
  }

  // 4) Lê o perfil de A de novo e compara.
  const depois = await supabase.from('profiles').select('id, nome, bio').eq('id', antes.id).single();
  if (depois.error) throw depois.error;
  console.log(`✔ Perfil de A depois: ${depois.data.nome} — bio: "${depois.data.bio}"`);

  const igual = depois.data.nome === antes.nome && depois.data.bio === antes.bio;
  const linhas = tentativa.error ? 0 : tentativa.data.length;
  if (igual && linhas === 0) {
    console.log('\nRESULTADO: PASSOU ✅ — B não conseguiu alterar o perfil de A (RLS: só o dono edita).');
  } else {
    console.log('\nRESULTADO: FALHOU ❌ — o perfil de A foi alterado. Revise as políticas de profiles.');
    process.exitCode = 1;
  }

  await supabase.auth.signOut();
}

principal().catch((e) => {
  console.error('Erro ao rodar o teste:', e instanceof Error ? e.message : e);
  process.exit(1);
});
