import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { cores, espaco, fonte } from '@/constants/tema';

// Estado de carregamento, sempre com texto (não só o "rodinha").
export function Carregando({ texto = 'Carregando…' }: { texto?: string }) {
  return (
    <View style={estilos.caixa} accessibilityRole="progressbar" accessibilityLabel={texto}>
      <ActivityIndicator color={cores.primaria} size="large" />
      <Text style={estilos.texto}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: { padding: espaco.xl, alignItems: 'center', gap: espaco.md },
  texto: { ...fonte.corpo, color: cores.textoSuave },
});
