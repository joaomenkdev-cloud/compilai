import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useDrawerStatus, type DrawerContentComponentProps } from 'expo-router/drawer';
import { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { areaToque, cores, espaco, familia, fonte, raio } from '@/constants/tema';
import { useAuth } from '@/contexts/AuthProvider';
import { useAvisos } from '@/contexts/AvisosProvider';

type Rota = '/' | '/notificacoes' | '/sobre';
type Item = {
  rotulo: string;
  icone: keyof typeof Ionicons.glyphMap;
  iconeAtivo: keyof typeof Ionicons.glyphMap;
  rota: Rota;
  /** Número mostrado numa bolinha ao lado do rótulo (só Notificações usa). */
  contador?: number;
};

// Conteúdo próprio do menu lateral: só Comunidade, Notificações, Sobre e Sair.
// (As rotas de detalhe existem no Drawer, mas não aparecem aqui.)
export function ConteudoDrawer({ navigation }: DrawerContentComponentProps) {
  const router = useRouter();
  const caminho = usePathname();
  const { sair, perfil } = useAuth();
  const { naoLidos, recarregar } = useAvisos();
  const insets = useSafeAreaInsets();
  const status = useDrawerStatus();

  // Sempre que o menu abre, confere no banco quantos avisos estão sem ler.
  useEffect(() => {
    if (status === 'open') recarregar();
  }, [status, recarregar]);

  const ir = (rota: Rota) => {
    navigation.closeDrawer();
    router.navigate(rota);
  };

  // Encerra a sessão e troca (replace) a tela por /login: o histórico das telas
  // privadas some, então o botão Voltar não as reabre. Ao desmontar a área (rede),
  // todo o estado em memória das telas é descartado.
  const aoSair = async () => {
    navigation.closeDrawer();
    await sair();
    router.replace('/login');
  };

  const itens: Item[] = [
    { rotulo: 'Comunidade', icone: 'people-outline', iconeAtivo: 'people', rota: '/' },
    {
      rotulo: 'Notificações',
      icone: 'notifications-outline',
      iconeAtivo: 'notifications',
      rota: '/notificacoes',
      contador: naoLidos,
    },
    { rotulo: 'Sobre', icone: 'information-circle-outline', iconeAtivo: 'information-circle', rota: '/sobre' },
  ];

  // "Comunidade" fica ativo em qualquer aba (Início, Explorar, Publicar, Perfil).
  const ativo = (rota: Rota) =>
    rota === '/' ? !['/notificacoes', '/sobre'].includes(caminho) : caminho === rota;

  return (
    <View style={[estilos.caixa, { paddingTop: insets.top + espaco.lg, paddingBottom: insets.bottom + espaco.lg }]}>
      <View style={estilos.marca}>
        <Image source={require('@/assets/images/splash-icon.png')} style={estilos.logo} accessible={false} />
        <Text style={estilos.nomeMarca}>CompilaAí</Text>
      </View>

      {perfil ? (
        <View style={estilos.pessoa}>
          <Avatar nome={perfil.nome} tamanho={48} />
          <View style={{ flex: 1 }}>
            <Text style={estilos.ola}>Olá,</Text>
            <Text style={estilos.nomePessoa} numberOfLines={1}>
              {perfil.nome}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={estilos.lista}>
        {itens.map((item) => {
          const estaAtivo = ativo(item.rota);
          const temContador = (item.contador ?? 0) > 0;
          const rotuloAcessivel = temContador
            ? `${item.rotulo}, ${item.contador} ${item.contador === 1 ? 'não lida' : 'não lidas'}`
            : item.rotulo;
          return (
            <Pressable
              key={item.rotulo}
              onPress={() => ir(item.rota)}
              accessibilityRole="button"
              accessibilityLabel={rotuloAcessivel}
              accessibilityState={{ selected: estaAtivo }}
              style={({ pressed }) => [estilos.item, estaAtivo && estilos.itemAtivo, pressed && estilos.pressionado]}
            >
              <Ionicons
                name={estaAtivo ? item.iconeAtivo : item.icone}
                size={22}
                color={estaAtivo ? cores.primaria : cores.textoSuave}
              />
              <Text style={[estilos.rotuloItem, estaAtivo && estilos.rotuloAtivo]}>{item.rotulo}</Text>
              {temContador ? (
                <View style={estilos.bolinha}>
                  <Text style={estilos.textoBolinha}>{item.contador! > 99 ? '99+' : item.contador}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {/* Sair fica separado e em vermelho: é uma ação de saída, não um destino. */}
      <View style={estilos.rodape}>
        <Pressable
          onPress={aoSair}
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
          style={({ pressed }) => [estilos.item, pressed && estilos.pressionado]}
        >
          <Ionicons name="log-out-outline" size={22} color={cores.erro} />
          <Text style={[estilos.rotuloItem, { color: cores.erro }]}>Sair</Text>
        </Pressable>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: { flex: 1, backgroundColor: cores.fundo, paddingHorizontal: espaco.lg },
  marca: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  logo: { width: 32, height: 32 },
  nomeMarca: { fontFamily: familia.titulo, fontSize: 22, color: cores.primaria },
  pessoa: {
    marginTop: espaco.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    padding: espaco.md,
    borderRadius: raio.card,
    backgroundColor: cores.superficie,
  },
  ola: { ...fonte.pequena, color: cores.textoSuave },
  nomePessoa: { fontFamily: familia.negrito, fontSize: 16, color: cores.texto },
  lista: { marginTop: espaco.xl, gap: espaco.xs, flex: 1 },
  item: {
    minHeight: areaToque + 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    paddingHorizontal: espaco.md,
    borderRadius: raio.campo,
  },
  itemAtivo: { backgroundColor: cores.primariaClara },
  pressionado: { backgroundColor: cores.pilula },
  rotuloItem: { fontFamily: familia.medio, fontSize: 16, color: cores.texto, flex: 1 },
  rotuloAtivo: { fontFamily: familia.negrito, color: cores.primaria },
  bolinha: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    paddingHorizontal: 6,
    backgroundColor: cores.destaqueTexto,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBolinha: { color: cores.sobrePrimaria, fontFamily: familia.negrito, fontSize: 13 },
  rodape: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: cores.borda, paddingTop: espaco.md },
});
