import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { cores, espaco, larguraLeitura } from '@/constants/tema';

// Contêiner padrão das telas simples: fundo creme, rolagem e proteção contra o teclado.
// (Telas com FlatList cuidam da própria rolagem.)
export function Tela({ children }: { children: ReactNode }) {
  return (
    <KeyboardAvoidingView
      style={estilos.fundo}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={estilos.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { ...larguraLeitura, padding: espaco.lg, paddingBottom: espaco.xxl, gap: espaco.lg },
});
