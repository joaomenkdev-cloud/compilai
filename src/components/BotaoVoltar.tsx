import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { areaToque, cores, espaco } from '@/constants/tema';

// Seta de voltar para o cabeçalho das telas de detalhe (post, pessoa, editar perfil).
// Se não houver histórico (ex.: abriu direto pelo aviso), volta para o início.
export function BotaoVoltar() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      accessibilityRole="button"
      accessibilityLabel="Voltar"
      style={estilos.botao}
    >
      <Ionicons name="arrow-back" size={24} color={cores.primaria} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: {
    width: areaToque,
    height: areaToque,
    marginLeft: espaco.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
