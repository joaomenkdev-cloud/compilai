import { mensagemDeErro } from '@/lib/erros';
import { supabase } from '@/lib/supabase';

// Camada de acesso ao Supabase Auth. As telas nunca chamam supabase.auth direto.
// Cada função devolve { erro } com mensagem pronta para exibir (ou null se deu certo).

export async function entrar(email: string, senha: string): Promise<{ erro: string | null }> {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: senha });
    return { erro: error ? mensagemDeErro(error) : null };
  } catch (e) {
    return { erro: mensagemDeErro(e) };
  }
}

export async function cadastrar(
  nome: string,
  email: string,
  senha: string,
): Promise<{ erro: string | null; precisaConfirmarEmail: boolean }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: senha,
      // O nome vai nos metadados; o perfil é criado no primeiro login (ver profileService).
      options: { data: { nome: nome.trim() } },
    });
    if (error) return { erro: mensagemDeErro(error), precisaConfirmarEmail: false };
    // Sem sessão no retorno = o projeto exige confirmação por e-mail.
    return { erro: null, precisaConfirmarEmail: data.session === null };
  } catch (e) {
    return { erro: mensagemDeErro(e), precisaConfirmarEmail: false };
  }
}

export async function sair(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  // Sem internet o servidor não responde e o SDK mantém a sessão. Nesse caso
  // encerramos só neste aparelho (scope 'local'), para o Sair sempre funcionar.
  if (error) await supabase.auth.signOut({ scope: 'local' });
}
