import { useWindowDimensions } from 'react-native';

// Pontos de quebra do layout (largura da janela, em pixels).
// Celular/tablet em pé: abas embaixo + menu lateral que abre e fecha.
// Computador (≥ 1024): menu fixo à esquerda e sem abas embaixo.
// Tela larga (≥ 1240): feed no centro + coluna da comunidade à direita.
export const LARGURA_COMPUTADOR = 1024;
export const LARGURA_TRES_COLUNAS = 1240;

export function useLayout() {
  const { width } = useWindowDimensions();
  return {
    computador: width >= LARGURA_COMPUTADOR,
    tresColunas: width >= LARGURA_TRES_COLUNAS,
  };
}
