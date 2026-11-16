import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { BotaoAvisos } from '@/components/BotaoAvisos';
import { BotaoMenu } from '@/components/BotaoMenu';
import { BotaoVoltar } from '@/components/BotaoVoltar';
import { ConteudoDrawer } from '@/components/ConteudoDrawer';
import { cores, familia } from '@/constants/tema';
import { AvisosProvider } from '@/contexts/AvisosProvider';

// Área protegida: um Drawer (menu lateral) que contém as Tabs como primeiro destino.
// Sem sessão, esta área nem existe: o Stack.Protected do layout raiz manda para /login.
export default function LayoutRede() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AvisosProvider>
        <Drawer
          drawerContent={(props) => <ConteudoDrawer {...props} />}
          // "history": Voltar retorna à tela anterior de verdade
          // (ex.: post → perfil da pessoa → Voltar → post), e não direto para as abas.
          backBehavior="history"
          screenOptions={({ navigation }) => ({
            title: '',
            headerStyle: { backgroundColor: cores.fundo },
            headerShadowVisible: false,
            headerTintColor: cores.primaria,
            headerTitleStyle: { fontFamily: familia.tituloMedio },
            headerLeft: () => <BotaoMenu aoPressionar={() => navigation.toggleDrawer()} />,
            headerRight: () => <BotaoAvisos />,
            drawerStyle: { backgroundColor: cores.fundo, width: 290 },
            // Fundo escurecido atrás do menu aberto, para o menu se destacar.
            overlayColor: 'rgba(10, 53, 64, 0.5)',
          })}
        >
          <Drawer.Screen name="(tabs)" />
          {/* Na própria tela de avisos o sino não faz sentido. */}
          <Drawer.Screen name="notificacoes" options={{ headerRight: () => null }} />
          <Drawer.Screen name="sobre" />
          {/* Telas de detalhe: fora do menu e com seta de voltar no lugar do ícone de menu. */}
          <Drawer.Screen name="editar-perfil" options={{ headerLeft: () => <BotaoVoltar /> }} />
          <Drawer.Screen name="post/[id]" options={{ headerLeft: () => <BotaoVoltar /> }} />
          <Drawer.Screen name="pessoa/[id]" options={{ headerLeft: () => <BotaoVoltar /> }} />
        </Drawer>
      </AvisosProvider>
    </GestureHandlerRootView>
  );
}
