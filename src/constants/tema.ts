// Tema do CompilaAí: todas as cores, espaçamentos, fontes e sombras ficam aqui.
// Assim, mudar a identidade visual é mexer em um único arquivo.
import { Platform } from 'react-native';

export type Paleta = {
  fundo: string; superficie: string; superficieSuave: string;
  primaria: string; primariaEscura: string; primariaClara: string; sobrePrimaria: string;
  destaque: string; destaqueTexto: string; destaqueClaro: string;
  texto: string; textoSuave: string; borda: string; pilula: string;
  erro: string; erroClaro: string; sucesso: string; sucessoClaro: string;
  sobreposicao: string;
  marca: string; // fundo fixo da identidade (topo das entradas, splash), igual nos dois modos
  fundoAviso: string; // faixa de aviso offline (texto branco por cima)
};

export const paletaClara: Paleta = {
  fundo: '#FAF6EE', // creme claro
  superficie: '#FFFFFF', // cards e campos
  superficieSuave: '#F3EDE1', // fundos secundários (trilho das abas, chips)
  primaria: '#0F4C5C', // azul-petróleo
  primariaEscura: '#0A3540', // topo das telas de entrada
  primariaClara: '#E3EFF1', // fundo de destaque suave (item ativo, chips)
  sobrePrimaria: '#FFFFFF', // texto sobre a cor primária
  destaque: '#E36414', // laranja (marcadores, bordas de destaque)
  destaqueTexto: '#A8420A', // laranja escuro: contraste suficiente para texto pequeno
  destaqueClaro: '#FDEEE4', // fundo laranja bem suave (curtido, não lida)
  texto: '#1B2A30',
  textoSuave: '#56676E',
  borda: '#E6DFD0',
  pilula: '#EDE5D3',
  erro: '#B3261E',
  erroClaro: '#FDECEA',
  sucesso: '#1E7B4A',
  sucessoClaro: '#E8F5EE',
  sobreposicao: 'rgba(10, 53, 64, 0.5)', // fundo escurecido atrás do menu aberto
  marca: '#0F4C5C',
  fundoAviso: '#1B2A30',
};

export const paletaEscura: Paleta = {
  fundo: '#10181B',
  superficie: '#182226',
  superficieSuave: '#1F2C31',
  primaria: '#5FB8CB', // azul-petróleo mais claro, para ter contraste no escuro
  primariaEscura: '#0A3540', // topo das telas de entrada (já é escuro nos dois modos)
  primariaClara: '#1E3B44',
  sobrePrimaria: '#06232B',
  destaque: '#F2802F',
  destaqueTexto: '#F5A26B',
  destaqueClaro: '#3A2619',
  texto: '#EAF0F2',
  textoSuave: '#9CB0B7',
  borda: '#2C3A40',
  pilula: '#27363B',
  erro: '#F2837B',
  erroClaro: '#3D1F1D',
  sucesso: '#5CC389',
  sucessoClaro: '#17301F',
  sobreposicao: 'rgba(0, 0, 0, 0.6)',
  marca: '#0F4C5C',
  fundoAviso: '#2A3A41',
};

export type Esquema = 'claro' | 'escuro';

// `cores` é um objeto único que muda de valores quando o esquema muda (aplicarEsquema).
// O TemaProvider remonta a árvore ao trocar, então toda tela relê as cores novas.
export const cores: Paleta = { ...paletaClara };
let esquemaAtual: Esquema = 'claro';
let versao = 0;

export function aplicarEsquema(esquema: Esquema) {
  if (esquema === esquemaAtual) return;
  esquemaAtual = esquema;
  versao += 1;
  Object.assign(cores, esquema === 'escuro' ? paletaEscura : paletaClara);
}

// Estilos que dependem de `cores`: criados sob demanda e refeitos quando o esquema muda.
// Uso: const estilos = estiloTema(() => StyleSheet.create({ ... })); (igual a antes nos componentes)
export function estiloTema<T extends object>(criar: () => T): T {
  let cache: T | null = null;
  let deVersao = -1;
  const atual = () => {
    if (!cache || deVersao !== versao) {
      cache = criar();
      deVersao = versao;
    }
    return cache;
  };
  return new Proxy({} as T, { get: (_, chave) => (atual() as Record<string | symbol, unknown>)[chave] });
}

// Fontes carregadas no layout raiz (src/app/_layout.tsx).
// Space Grotesk: títulos (cara de tecnologia). DM Sans: texto (muito legível).
export const familia = {
  titulo: 'SpaceGrotesk_700Bold',
  tituloMedio: 'SpaceGrotesk_600SemiBold',
  regular: 'DMSans_400Regular',
  medio: 'DMSans_500Medium',
  negrito: 'DMSans_700Bold',
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
  card: 20,
  campo: 14,
  pilula: 999,
} as const;

export const fonte = {
  sobrancelha: { fontFamily: familia.negrito, fontSize: 12, letterSpacing: 1.2 },
  titulo: { fontFamily: familia.titulo, fontSize: 30, lineHeight: 36 },
  subtitulo: { fontFamily: familia.tituloMedio, fontSize: 18, lineHeight: 24 },
  corpo: { fontFamily: familia.regular, fontSize: 16, lineHeight: 24 },
  pequena: { fontFamily: familia.regular, fontSize: 13, lineHeight: 18 },
  rotulo: { fontFamily: familia.medio, fontSize: 14 },
  botao: { fontFamily: familia.negrito, fontSize: 16 },
} as const;

// Sombra suave e consistente para cards (em vez de borda): dá profundidade sem pesar.
export const sombra = {
  card: Platform.select({
    web: { boxShadow: '0px 4px 16px rgba(15, 76, 92, 0.08)' },
    default: {
      shadowColor: '#0F4C5C',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
  }),
  botao: Platform.select({
    web: { boxShadow: '0px 6px 14px rgba(15, 76, 92, 0.25)' },
    default: {
      shadowColor: '#0F4C5C',
      shadowOpacity: 0.25,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
  }),
} as const;

// Leve "afundar" ao tocar (feedback em até 100 ms, sem mexer no layout).
export const pressionado = { transform: [{ scale: 0.98 }], opacity: 0.92 } as const;

// Largura máxima do conteúdo: em telas grandes nada estica de ponta a ponta
// (linhas de texto longas demais cansam a leitura). No celular, ocupa a tela toda.
export const larguraLeitura = { width: '100%', maxWidth: 680, alignSelf: 'center' } as const;

// Toda área tocável deve ter pelo menos 44×44 (acessibilidade).
export const areaToque = 44;
