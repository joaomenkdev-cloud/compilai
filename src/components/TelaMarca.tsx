import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { cores, espaco } from '@/constants/tema';

// Tela de marca em React, exibida enquanto lemos a sessão salva.
// Mesmo fundo e mesma imagem da splash nativa (app.json), para a troca ser suave.
// Usa fonte do sistema de propósito: ela aparece antes das fontes do app carregarem.
export function TelaMarca({ aoMontar }: { aoMontar?: () => void }) {
  return (
    <View
      style={estilos.fundo}
      onLayout={aoMontar}
      accessible
      accessibilityLabel="CompilaAí. Carregando sua sessão."
    >
      <Image source={require('@/assets/images/splash-icon.png')} style={estilos.marca} />
      <Text style={estilos.nome}>CompilaAí</Text>
      <Text style={estilos.legenda}>Projetos, dúvidas e conquistas</Text>
      <ActivityIndicator color={cores.fundo} style={{ marginTop: espaco.lg }} />
    </View>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: cores.primaria, alignItems: 'center', justifyContent: 'center', gap: espaco.sm },
  marca: { width: 120, height: 120, marginBottom: espaco.md },
  nome: { fontSize: 40, fontWeight: '800', color: cores.sobrePrimaria },
  legenda: { fontSize: 15, color: cores.fundo },
});
