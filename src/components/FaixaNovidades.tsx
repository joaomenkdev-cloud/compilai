import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { areaToque, cores, espaco, estiloTema, familia, sombra } from '@/constants/tema';

// Pílula "2 novas publicações · toque para ver" (chega em tempo real pelo Supabase Realtime).
export function FaixaNovidades({ quantidade, aoPressionar }: { quantidade: number; aoPressionar: () => void }) {
  const texto = quantidade === 1 ? '1 nova publicação' : `${quantidade} novas publicações`;
  return (
    <Pressable
      onPress={aoPressionar}
      accessibilityRole="button"
      accessibilityLabel={`${texto}. Toque para ver`}
      accessibilityLiveRegion="polite"
      style={({ pressed }) => [estilos.faixa, sombra.botao, pressed && { opacity: 0.85 }]}
    >
      <Ionicons name="arrow-up" size={16} color={cores.sobrePrimaria} />
      <Text style={estilos.texto}>{texto} · toque para ver</Text>
    </Pressable>
  );
}

const estilos = estiloTema(() =>
  StyleSheet.create({
    faixa: {
      alignSelf: 'center',
      minHeight: areaToque,
      flexDirection: 'row',
      alignItems: 'center',
      gap: espaco.sm,
      paddingHorizontal: espaco.lg,
      borderRadius: 999,
      backgroundColor: cores.primaria,
    },
    texto: { fontFamily: familia.negrito, fontSize: 14, color: cores.sobrePrimaria },
  }),
);
