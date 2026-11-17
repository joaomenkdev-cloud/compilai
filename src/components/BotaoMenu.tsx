import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { areaToque, cores, espaco, estiloTema } from '@/constants/tema';

// Ícone de menu do cabeçalho (abre o menu lateral), com rótulo em português.
export function BotaoMenu({ aoPressionar, rotulo = 'Abrir menu' }: { aoPressionar: () => void; rotulo?: string }) {
  return (
    <Pressable
      onPress={aoPressionar}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      style={estilos.botao}
    >
      <Ionicons name="menu" size={28} color={cores.primaria} />
    </Pressable>
  );
}

const estilos = estiloTema(() => StyleSheet.create({
  botao: {
    width: areaToque,
    height: areaToque,
    marginLeft: espaco.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
