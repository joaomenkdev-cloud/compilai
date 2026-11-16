import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from 'react-native';

import { cores, espaco, fonte, raio, sombra } from '@/constants/tema';

// Esqueleto de um cartão (formato do PostCard) que "pulsa" enquanto carrega.
// Mais agradável que só uma rodinha, e o texto continua lá para o leitor de tela.
// Se o aparelho pedir "reduzir movimento", o esqueleto fica parado.
export function Carregando({ texto = 'Carregando…', cartoes = 3 }: { texto?: string; cartoes?: number }) {
  // useState com função: o valor animado é criado uma vez só e não muda entre renderizações.
  const [opacidade] = useState(() => new Animated.Value(0.55));

  useEffect(() => {
    let animacao: Animated.CompositeAnimation | null = null;
    AccessibilityInfo.isReduceMotionEnabled().then((reduzir) => {
      if (reduzir) return;
      animacao = Animated.loop(
        Animated.sequence([
          Animated.timing(opacidade, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(opacidade, { toValue: 0.55, duration: 700, useNativeDriver: true }),
        ]),
      );
      animacao.start();
    });
    return () => animacao?.stop();
  }, [opacidade]);

  return (
    <View style={estilos.caixa} accessibilityRole="progressbar" accessibilityLabel={texto}>
      <Text style={estilos.texto}>{texto}</Text>
      {Array.from({ length: cartoes }, (_, i) => (
        <Animated.View key={i} style={[estilos.cartao, sombra.card, { opacity: opacidade }]}>
          <View style={estilos.linhaTopo}>
            <View style={estilos.circulo} />
            <View style={{ gap: 6, flex: 1 }}>
              <View style={[estilos.barra, { width: '40%' }]} />
              <View style={[estilos.barra, { width: '25%', height: 8 }]} />
            </View>
          </View>
          <View style={[estilos.barra, { width: '95%' }]} />
          <View style={[estilos.barra, { width: '70%' }]} />
        </Animated.View>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: { gap: espaco.md },
  texto: { ...fonte.pequena, color: cores.textoSuave, textAlign: 'center' },
  cartao: { backgroundColor: cores.superficie, borderRadius: raio.card, padding: espaco.lg, gap: espaco.md },
  linhaTopo: { flexDirection: 'row', alignItems: 'center', gap: espaco.md },
  circulo: { width: 44, height: 44, borderRadius: 22, backgroundColor: cores.superficieSuave },
  barra: { height: 12, borderRadius: 6, backgroundColor: cores.superficieSuave },
});
