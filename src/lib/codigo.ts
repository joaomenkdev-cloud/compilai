// Separa o texto de um post em pedaços de TEXTO comum e de CÓDIGO.
// Código é o que estiver entre ``` (três crases), como no GitHub/WhatsApp:
//
//   Olha meu componente:
//   ```tsx
//   <Botao titulo="Oi" />
//   ```
//
// A primeira palavra logo depois das crases (ex.: tsx, js, sql) vira a "linguagem".
// Se a pessoa esquecer de fechar as crases, o resto do texto é tratado como código.

export type Pedaco =
  | { tipo: 'texto'; conteudo: string }
  | { tipo: 'codigo'; conteudo: string; linguagem: string | null };

const CERCA = '```';

export function separarCodigo(texto: string): Pedaco[] {
  const pedacos: Pedaco[] = [];
  let resto = texto;

  while (resto.length > 0) {
    const inicio = resto.indexOf(CERCA);
    if (inicio === -1) {
      empurrarTexto(pedacos, resto);
      break;
    }
    empurrarTexto(pedacos, resto.slice(0, inicio));

    const depois = resto.slice(inicio + CERCA.length);
    const fim = depois.indexOf(CERCA);
    const bloco = fim === -1 ? depois : depois.slice(0, fim);
    resto = fim === -1 ? '' : depois.slice(fim + CERCA.length);

    // Linguagem: palavra colada às crases, na mesma linha (```tsx).
    const quebra = bloco.indexOf('\n');
    const primeiraLinha = (quebra === -1 ? bloco : bloco.slice(0, quebra)).trim();
    const temLinguagem = quebra !== -1 && /^[\w+#.-]{1,20}$/.test(primeiraLinha);
    const codigo = (temLinguagem ? bloco.slice(quebra + 1) : bloco).replace(/^\n+|\n+$/g, '');

    if (codigo.trim().length > 0) {
      pedacos.push({ tipo: 'codigo', conteudo: codigo, linguagem: temLinguagem ? primeiraLinha.toLowerCase() : null });
    }
  }

  return pedacos;
}

function empurrarTexto(pedacos: Pedaco[], conteudo: string) {
  const limpo = conteudo.replace(/^\n+|\n+$/g, '');
  if (limpo.trim().length > 0) pedacos.push({ tipo: 'texto', conteudo: limpo });
}

/** true se o texto tem pelo menos um bloco de código. */
export function temCodigo(texto: string): boolean {
  return separarCodigo(texto).some((p) => p.tipo === 'codigo');
}
