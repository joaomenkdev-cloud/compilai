import { Ionicons } from '@expo/vector-icons';
import type { DrawerContentComponentProps } from 'expo-router/drawer';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthProvider';

import { areaToque, cores, espaco, fonte, raio } from '@/constants/tema';

type Item = {
  rotulo: string;
  icone: keyof typeof Ionicons.glyphMap;
  aoPressionar: () => void;
};

// Conteúdo próprio do menu lateral: só Comunidade, Notificações, Sobre e Sair.
// (As rotas de detalhe existem no Drawer, mas não aparecem aqui.)
export function ConteudoDrawer({ navigation }: DrawerContentComponentProps) {
  const router = useRouter();
  const { sair } = useAuth();
  const insets = useSafeAreaInsets();

  const ir = (rota: '/' | '/notificacoes' | '/sobre') => {
    navigation.closeDrawer();
    router.navigate(rota);
  };

  const itens: Item[] = [
    { rotulo: 'Comunidade', icone: 'people-outline', aoPressionar: () => ir('/') },
    { rotulo: 'Notificações', icone: 'notifications-outline', aoPressionar: () => ir('/notificacoes') },
    { rotulo: 'Sobre', icone: 'information-circle-outline', aoPressionar: () => ir('/sobre') },
    {
      rotulo: 'Sair',
      icone: 'log-out-outline',
      // Encerra a sessão e troca (replace) a tela por /login: o histórico das telas
      // privadas some, então o botão Voltar não as reabre. Ao desmontar a área (rede),
      // todo o estado em memória das telas é descartado.
      aoPressionar: async () => {
        navigation.closeDrawer();
        await sair();
        router.replace('/login');
      },
    },
  ];

  return (
    <View style={[estilos.caixa, { paddingTop: insets.top + espaco.xl }]}>
      <Text style={estilos.marca}>CompilaAí</Text>
      <Text style={estilos.legenda}>Projetos, dúvidas e conquistas</Text>
      <View style={estilos.lista}>
        {itens.map((item) => (
          <Pressable
            key={item.rotulo}
            onPress={item.aoPressionar}
            accessibilityRole="button"
            accessibilityLabel={item.rotulo}
            style={({ pressed }) => [estilos.item, pressed && estilos.pressionado]}
          >
            <Ionicons name={item.icone} size={22} color={cores.primaria} />
            <Text style={estilos.rotuloItem}>{item.rotulo}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: { flex: 1, backgroundColor: cores.fundo, paddingHorizontal: espaco.lg },
  marca: { fontSize: 26, fontWeight: '800', color: cores.primaria },
  legenda: { ...fonte.pequena, color: cores.textoSuave, marginTop: espaco.xs },
  lista: { marginTop: espaco.xl, gap: espaco.xs },
  item: {
    minHeight: areaToque + 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    paddingHorizontal: espaco.md,
    borderRadius: raio.campo,
  },
  pressionado: { backgroundColor: cores.pilula },
  rotuloItem: { ...fonte.subtitulo, color: cores.texto },
});
