// Converte erros do Supabase/rede em mensagens em português para o usuário.

type ErroComMensagem = { message?: string } | null | undefined;

/** Erro típico de falta de conexão (fetch falhou antes de chegar ao servidor). */
export function ehErroDeRede(erro: ErroComMensagem | unknown): boolean {
  const msg = String((erro as ErroComMensagem)?.message ?? erro ?? '').toLowerCase();
  return (
    msg.includes('network request failed') ||
    msg.includes('failed to fetch') ||
    msg.includes('network error') ||
    msg.includes('fetch failed')
  );
}

export function mensagemDeErro(erro: ErroComMensagem | unknown): string {
  if (ehErroDeRede(erro)) return 'Sem conexão com a internet. Tente de novo quando reconectar.';

  const msg = String((erro as ErroComMensagem)?.message ?? '').toLowerCase();
  if (msg.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (msg.includes('email not confirmed')) return 'Confirme seu e-mail pelo link que enviamos antes de entrar.';
  if (msg.includes('already registered') || msg.includes('already been registered'))
    return 'Este e-mail já tem cadastro. Tente entrar.';
  if (msg.includes('rate limit') || msg.includes('too many'))
    return 'Muitas tentativas. Aguarde um pouco e tente de novo.';
  if (msg.includes('password should be at least')) return 'A senha é curta demais.';
  return 'Algo deu errado. Tente novamente.';
}
