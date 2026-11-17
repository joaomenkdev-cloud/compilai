// Validações simples dos formulários. Cada função devolve a mensagem de erro
// (para mostrar junto ao campo) ou null quando está tudo certo.

export const SENHA_MINIMA = 6;

export function validarNome(nome: string): string | null {
  return nome.trim().length === 0 ? 'Informe seu nome.' : null;
}

export function validarEmail(email: string): string | null {
  const valor = email.trim();
  if (valor.length === 0) return 'Informe seu e-mail.';
  // Formato básico: algo@algo.algo (a verificação real é a confirmação do Supabase)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return 'Digite um e-mail válido.';
  return null;
}

export function validarSenha(senha: string): string | null {
  if (senha.length === 0) return 'Informe sua senha.';
  if (senha.length < SENHA_MINIMA) return `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`;
  return null;
}

export function validarConfirmacao(senha: string, confirmacao: string): string | null {
  if (confirmacao.length === 0) return 'Repita a senha.';
  return senha !== confirmacao ? 'As senhas não são iguais.' : null;
}

/** Áreas de atuação: no máximo `maximo` (o banco confere de novo). */
export function validarAreas(areas: string[], maximo = 3): string | null {
  return areas.length > maximo ? `Escolha no máximo ${maximo} áreas.` : null;
}

/** Stacks: sem repetidas e no máximo `maximo` (o banco confere de novo). */
export function validarStacks(stacks: string[], maximo = 15): string | null {
  if (new Set(stacks).size !== stacks.length) return 'Há stacks repetidas.';
  return stacks.length > maximo ? `Escolha no máximo ${maximo} stacks.` : null;
}

/** Liga/desliga um item numa lista de escolhas, respeitando o limite. */
export function alternarItem(lista: string[], item: string, maximo: number): string[] {
  if (lista.includes(item)) return lista.filter((x) => x !== item);
  return lista.length >= maximo ? lista : [...lista, item];
}
