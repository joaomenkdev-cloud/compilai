// Tema do CompilaAí: todas as cores, espaçamentos, fontes e sombras ficam aqui.
// Assim, mudar a identidade visual é mexer em um único arquivo.
import { Platform } from 'react-native';

export const cores = {
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
} as const;

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

// Toda área tocável deve ter pelo menos 44×44 (acessibilidade).
export const areaToque = 44;
