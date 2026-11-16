import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { cores, espaco, fonte, raio } from '@/constants/tema';
import { dataCurta, horaCurta } from '@/lib/datas';

// Aviso de que a lista na tela é a cópia salva no aparelho (sem internet).
export function BannerOffline({ atualizado }: { atualizado: string | null }) {
  let quando = '';
  if (atualizado) {
    const hoje = dataCurta(new Date().toISOString()) === dataCurta(atualizado);
    quando = hoje ? ` · última atualização às ${horaCurta(atualizado)}` : ` · última atualização em ${dataCurta(atualizado)} às ${horaCurta(atualizado)}`;
  }
  return (
    <View style={estilos.caixa} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Ionicons name="cloud-offline-outline" size={20} color={cores.sobrePrimaria} />
      <Text style={estilos.texto}>{`Sem conexão${quando}`}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    backgroundColor: cores.texto,
    borderRadius: raio.campo,
    paddingVertical: espaco.md,
    paddingHorizontal: espaco.lg,
  },
  texto: { ...fonte.rotulo, color: cores.sobrePrimaria, flex: 1 },
});
