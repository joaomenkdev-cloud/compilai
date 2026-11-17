import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { cores, espaco, familia, raio } from '@/constants/tema';

// Barra de busca do cabeçalho (só no computador): leva para Explorar,
// onde a busca de pessoas e posts acontece de verdade.
export function BarraBusca() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.navigate('/explorar')}
      accessibilityRole="search"
      accessibilityLabel="Buscar pessoas e publicações"
      style={({ pressed }) => [estilos.barra, pressed && { opacity: 0.8 }]}
    >
      <Ionicons name="search" size={18} color={cores.textoSuave} />
      <Text style={estilos.texto}>Buscar pessoas e publicações</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  barra: {
    width: 360,
    maxWidth: '100%',
    height: 42,
    borderRadius: raio.pilula,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    paddingHorizontal: espaco.lg,
  },
  texto: { fontFamily: familia.regular, fontSize: 14, color: cores.textoSuave },
});
