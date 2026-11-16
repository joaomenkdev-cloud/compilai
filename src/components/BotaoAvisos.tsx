import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { areaToque, cores, espaco, familia } from '@/constants/tema';
import { useAvisos } from '@/contexts/AvisosProvider';

// Sino no canto do cabeçalho: atalho para Notificações com o total de não lidas.
// O mesmo número aparece no menu lateral (os dois leem o AvisosProvider).
export function BotaoAvisos() {
  const router = useRouter();
  const { naoLidos } = useAvisos();
  const rotulo =
    naoLidos > 0 ? `Notificações, ${naoLidos} ${naoLidos === 1 ? 'não lida' : 'não lidas'}` : 'Notificações';

  return (
    <Pressable
      onPress={() => router.navigate('/notificacoes')}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      style={({ pressed }) => [estilos.botao, pressed && { opacity: 0.6 }]}
    >
      <Ionicons name={naoLidos > 0 ? 'notifications' : 'notifications-outline'} size={24} color={cores.primaria} />
      {naoLidos > 0 ? (
        <View style={estilos.bolinha}>
          <Text style={estilos.numero}>{naoLidos > 9 ? '9+' : naoLidos}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: {
    width: areaToque,
    height: areaToque,
    marginRight: espaco.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bolinha: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: cores.destaqueTexto,
    borderWidth: 2,
    borderColor: cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numero: { color: cores.sobrePrimaria, fontFamily: familia.negrito, fontSize: 10, lineHeight: 12 },
});
