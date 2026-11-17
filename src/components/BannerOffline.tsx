import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { cores, espaco, familia, fonte, raio, estiloTema } from '@/constants/tema';
import { dataCurta, horaCurta } from '@/lib/datas';

// Aviso de que a lista na tela é a cópia salva no aparelho (sem internet).
export function BannerOffline({ atualizado }: { atualizado: string | null }) {
  let quando = '';
  if (atualizado) {
    const hoje = dataCurta(new Date().toISOString()) === dataCurta(atualizado);
    quando = hoje
      ? ` · última atualização às ${horaCurta(atualizado)}`
      : ` · última atualização em ${dataCurta(atualizado)} às ${horaCurta(atualizado)}`;
  }
  return (
    <View style={estilos.caixa} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <View style={estilos.icone}>
        <Ionicons name="cloud-offline-outline" size={20} color="#FFFFFF" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={estilos.titulo}>{`Sem conexão${quando}`}</Text>
        <Text style={estilos.texto}>Mostrando o último feed salvo neste aparelho.</Text>
      </View>
    </View>
  );
}

const estilos = estiloTema(() => StyleSheet.create({
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    backgroundColor: cores.fundoAviso,
    borderRadius: raio.campo,
    padding: espaco.md,
  },
  icone: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { fontFamily: familia.negrito, fontSize: 14, color: '#FFFFFF' },
  texto: { ...fonte.pequena, color: '#D5DEE1' },
}));
