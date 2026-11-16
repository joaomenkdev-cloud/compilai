// Tema do CompilaAí: todas as cores, espaçamentos e tipografia ficam aqui.
// Assim, mudar a identidade visual é mexer em um único arquivo.

export const cores = {
  fundo: '#FAF6EE', // creme claro
  superficie: '#FFFFFF', // cards e campos
  primaria: '#0F4C5C', // azul-petróleo
  sobrePrimaria: '#FFFFFF', // texto sobre a cor primária
  destaque: '#E36414', // laranja (marcadores, bordas de destaque)
  destaqueTexto: '#A8420A', // laranja escuro: contraste suficiente para texto pequeno
  texto: '#1B2A30',
  textoSuave: '#56676E',
  borda: '#E3DCCB',
  pilula: '#EDE5D3', // fundo das abas internas
  erro: '#B3261E',
  sucesso: '#1E7B4A',
} as const;

export const espaco = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const raio = {
  card: 16,
  campo: 12,
  pilula: 999,
} as const;

export const fonte = {
  sobrancelha: { fontSize: 12, fontWeight: '700', letterSpacing: 1.2 },
  titulo: { fontSize: 28, fontWeight: '800' },
  subtitulo: { fontSize: 18, fontWeight: '700' },
  corpo: { fontSize: 16, fontWeight: '400', lineHeight: 22 },
  pequena: { fontSize: 13, fontWeight: '400' },
  rotulo: { fontSize: 14, fontWeight: '600' },
} as const;

// Toda área tocável deve ter pelo menos 44×44 (acessibilidade).
export const areaToque = 44;
