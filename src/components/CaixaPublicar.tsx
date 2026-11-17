import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { cores, espaco, familia, raio, sombra } from '@/constants/tema';
import { useAuth } from '@/contexts/AuthProvider';

// Atalho no topo do feed: "No que você está trabalhando?" → abre Publicar.
// (A publicação em si continua na tela Publicar, com contador e rascunho.)
export function CaixaPublicar() {
  const router = useRouter();
  const { perfil } = useAuth();
  const primeiroNome = perfil?.nome.split(' ')[0];
  // Em telas estreitas o botão vira só o ícone, para sobrar espaço para a frase.
  const estreito = useWindowDimensions().width < 480;

  return (
    <View style={[estilos.caixa, sombra.card]}>
      <Avatar nome={perfil?.nome ?? '?'} tamanho={40} />
      <Pressable
        onPress={() => router.navigate('/publicar')}
        accessibilityRole="button"
        accessibilityLabel="Escrever uma nova publicação"
        style={({ pressed }) => [estilos.campo, pressed && { opacity: 0.8 }]}
      >
        <Text style={estilos.dica} numberOfLines={1}>
          {estreito ? 'No que você está trabalhando?' : primeiroNome ? `No que você está trabalhando, ${primeiroNome}?` : 'No que você está trabalhando?'}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => router.navigate('/publicar')}
        accessibilityRole="button"
        accessibilityLabel="Publicar"
        style={({ pressed }) => [estilos.botao, estreito && estilos.botaoIcone, pressed && { opacity: 0.85 }]}
      >
        <Ionicons name="paper-plane" size={estreito ? 18 : 16} color={cores.sobrePrimaria} />
        {estreito ? null : <Text style={estilos.textoBotao}>Publicar</Text>}
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    backgroundColor: cores.superficie,
    borderRadius: raio.card,
    padding: espaco.md,
  },
  campo: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: espaco.md,
    borderRadius: raio.pilula,
    backgroundColor: cores.superficieSuave,
  },
  dica: { fontFamily: familia.regular, fontSize: 14, color: cores.textoSuave },
  botao: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: espaco.lg,
    borderRadius: raio.pilula,
    backgroundColor: cores.primaria,
  },
  botaoIcone: { width: 44, paddingHorizontal: 0, justifyContent: 'center' },
  textoBotao: { fontFamily: familia.negrito, fontSize: 14, color: cores.sobrePrimaria },
});
