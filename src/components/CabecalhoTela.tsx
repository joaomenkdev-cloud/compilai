import { StyleSheet, Text, View } from 'react-native';

import { cores, espaco, fonte } from '@/constants/tema';

type Props = {
  /** Seção da tela, ex.: "INÍCIO". Aparece como "COMPILAAÍ / INÍCIO". */
  secao: string;
  titulo: string;
};

// Cabeçalho padrão das telas: "sobrancelha" pequena + título grande.
export function CabecalhoTela({ secao, titulo }: Props) {
  return (
    <View style={estilos.caixa}>
      <Text style={estilos.sobrancelha}>{`COMPILAAÍ / ${secao.toUpperCase()}`}</Text>
      <Text style={estilos.titulo} accessibilityRole="header">
        {titulo}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: { gap: espaco.xs, marginBottom: espaco.lg },
  sobrancelha: { ...fonte.sobrancelha, color: cores.destaqueTexto },
  titulo: { ...fonte.titulo, color: cores.primaria },
});
