import { StyleSheet, Text, View } from 'react-native';

import { cores, espaco } from '@/constants/tema';

// Tela de marca em React, exibida enquanto lemos a sessão salva.
// Tem o mesmo fundo da splash nativa, para a troca ser suave.
export function TelaMarca({ aoMontar }: { aoMontar?: () => void }) {
  return (
    <View style={estilos.fundo} onLayout={aoMontar}>
      <Text style={estilos.marca}>CompilaAí</Text>
      <Text style={estilos.legenda}>Projetos, dúvidas e conquistas</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: cores.primaria, alignItems: 'center', justifyContent: 'center', gap: espaco.sm },
  marca: { fontSize: 40, fontWeight: '800', color: cores.sobrePrimaria },
  legenda: { fontSize: 15, color: cores.fundo },
});
