import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cores, espaco, familia, fonte } from '@/constants/tema';

// Topo das telas de entrada (Entrar / Criar conta): faixa azul com a marca,
// cantos inferiores arredondados para o formulário "subir" sobre ela.
export function TopoMarca({ frase }: { frase: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[estilos.faixa, { paddingTop: insets.top + espaco.xl }]}>
      {/* Detalhes decorativos (círculos) só para dar textura; o leitor de tela ignora. */}
      <View style={[estilos.bolha, estilos.bolhaGrande]} importantForAccessibility="no-hide-descendants" />
      <View style={[estilos.bolha, estilos.bolhaPequena]} importantForAccessibility="no-hide-descendants" />
      <View style={estilos.linha}>
        <Image source={require('@/assets/images/splash-icon.png')} style={estilos.marca} accessible={false} />
        <Text style={estilos.nome} accessibilityRole="header">
          CompilaAí
        </Text>
      </View>
      <Text style={estilos.frase}>{frase}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  faixa: {
    backgroundColor: cores.primaria,
    paddingHorizontal: espaco.xl,
    paddingBottom: espaco.xxl + espaco.lg,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    gap: espaco.md,
  },
  bolha: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)' },
  bolhaGrande: { width: 220, height: 220, right: -60, top: -40 },
  bolhaPequena: { width: 120, height: 120, right: 90, bottom: -50, backgroundColor: 'rgba(227,100,20,0.12)' },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.md },
  marca: { width: 48, height: 48 },
  nome: { fontFamily: familia.titulo, fontSize: 30, color: cores.sobrePrimaria },
  frase: { ...fonte.corpo, fontSize: 17, color: '#D5E6EA', maxWidth: 320 },
});
