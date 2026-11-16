import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { BotaoVoltar } from '@/components/BotaoVoltar';
import { ConteudoDrawer } from '@/components/ConteudoDrawer';
import { cores } from '@/constants/tema';

// Área protegida: um Drawer (menu lateral) que contém as Tabs como primeiro destino.
// Na Fase 3 este layout passa a redirecionar para /login quando não há sessão.
export default function LayoutRede() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <ConteudoDrawer {...props} />}
        screenOptions={{
          title: '',
          headerStyle: { backgroundColor: cores.fundo },
          headerShadowVisible: false,
          headerTintColor: cores.primaria,
          drawerStyle: { backgroundColor: cores.fundo, width: 290 },
        }}
      >
        <Drawer.Screen name="(tabs)" />
        <Drawer.Screen name="notificacoes" />
        <Drawer.Screen name="sobre" />
        {/* Telas de detalhe: fora do menu e com seta de voltar no lugar do ícone de menu. */}
        <Drawer.Screen name="editar-perfil" options={{ headerLeft: () => <BotaoVoltar /> }} />
        <Drawer.Screen name="post/[id]" options={{ headerLeft: () => <BotaoVoltar /> }} />
        <Drawer.Screen name="pessoa/[id]" options={{ headerLeft: () => <BotaoVoltar /> }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}
