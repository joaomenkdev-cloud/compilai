import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { areaToque, cores, espaco } from '@/constants/tema';

// Ícone de menu do cabeçalho (abre o menu lateral), com rótulo em português.
export function BotaoMenu({ aoPressionar }: { aoPressionar: () => void }) {
  return (
    <Pressable
      onPress={aoPressionar}
      accessibilityRole="button"
      accessibilityLabel="Abrir menu"
      style={estilos.botao}
    >
      <Ionicons name="menu" size={28} color={cores.primaria} />
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
