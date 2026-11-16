import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { TopoMarca } from '@/components/TopoMarca';
import { cores, espaco, sombra } from '@/constants/tema';

// Layout das telas públicas (Entrar e Criar conta): topo com a marca e o
// formulário num cartão branco que "sobe" sobre a faixa azul.
export function TelaEntrada({ frase, children }: { frase: string; children: ReactNode }) {
  return (
    <KeyboardAvoidingView style={estilos.fundo} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={estilos.rolagem} keyboardShouldPersistTaps="handled">
        <TopoMarca frase={frase} />
        <View style={estilos.margem}>
          <View style={[estilos.cartao, sombra.card]}>{children}</View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: cores.fundo },
  rolagem: { paddingBottom: espaco.xxl },
  margem: { paddingHorizontal: espaco.lg, marginTop: -espaco.xxl },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: 28,
    padding: espaco.xl,
    gap: espaco.lg,
    // Em telas largas (tablet/web), o formulário não estica de ponta a ponta.
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
});
