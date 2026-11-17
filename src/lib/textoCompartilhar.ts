// Regra pura (sem dependências do Expo) para dar para testar no node.

/** Texto curto para compartilhar: começo do post (sem blocos de código) + link. */
export function textoParaCompartilhar(autor: string, texto: string, link: string) {
  const limpo = texto.replace(/```[\s\S]*?(```|$)/g, '[código]').replace(/\s+/g, ' ').trim();
  const trecho = limpo.length > 140 ? `${limpo.slice(0, 137)}…` : limpo;
  return `${autor} no CompilaAí: “${trecho}”\n${link}`;
}
