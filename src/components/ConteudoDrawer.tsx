import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDrawerStatus, type DrawerContentComponentProps } from 'expo-router/drawer';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { areaToque, cores, espaco, fonte, raio } from '@/constants/tema';
import { useAuth } from '@/contexts/AuthProvider';
import { useAvisos } from '@/contexts/AvisosProvider';

type Item = {
  rotulo: string;
  icone: keyof typeof Ionicons.glyphMap;
  aoPressionar: () => void;
  /** Número mostrado numa bolinha ao lado do rótulo (só Notificações usa). */
  contador?: number;
};

// Conteúdo próprio do menu lateral: só Comunidade, Notificações, Sobre e Sair.
// (As rotas de detalhe existem no Drawer, mas não aparecem aqui.)
export function ConteudoDrawer({ navigation }: DrawerContentComponentProps) {
  const router = useRouter();
  const { sair, perfil } = useAuth();
  const { naoLidos, recarregar } = useAvisos();
  const insets = useSafeAreaInsets();
  const status = useDrawerStatus();

  // Sempre que o menu abre, confere no banco quantos avisos estão sem ler.
  useEffect(() => {
    if (status === 'open') recarregar();
  }, [status, recarregar]);

  const ir = (rota: '/' | '/notificacoes' | '/sobre') => {
    navigation.closeDrawer();
    router.navigate(rota);
  };

  const itens: Item[] = [
    { rotulo: 'Comunidade', icone: 'people-outline', aoPressionar: () => ir('/') },
    {
      rotulo: 'Notificações',
      icone: 'notifications-outline',
      aoPressionar: () => ir('/notificacoes'),
      contador: naoLidos,
    },
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
      <Text style={estilos.legenda}>{perfil ? `Olá, ${perfil.nome}` : 'Projetos, dúvidas e conquistas'}</Text>
      <View style={estilos.lista}>
        {itens.map((item) => {
          const temContador = (item.contador ?? 0) > 0;
          const rotuloAcessivel = temContador
            ? `${item.rotulo}, ${item.contador} ${item.contador === 1 ? 'não lida' : 'não lidas'}`
            : item.rotulo;
          return (
            <Pressable
              key={item.rotulo}
              onPress={item.aoPressionar}
              accessibilityRole="button"
              accessibilityLabel={rotuloAcessivel}
              style={({ pressed }) => [estilos.item, pressed && estilos.pressionado]}
            >
              <Ionicons name={item.icone} size={22} color={cores.primaria} />
              <Text style={estilos.rotuloItem}>{item.rotulo}</Text>
              {temContador ? (
                <View style={estilos.bolinha}>
                  <Text style={estilos.textoBolinha}>{item.contador! > 99 ? '99+' : item.contador}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
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
  rotuloItem: { ...fonte.subtitulo, color: cores.texto, flex: 1 },
  bolinha: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    paddingHorizontal: 6,
    backgroundColor: cores.destaqueTexto,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBolinha: { color: cores.sobrePrimaria, fontWeight: '800', fontSize: 13 },
});
