import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cores, familia } from '@/constants/tema';

type Nome = keyof typeof Ionicons.glyphMap;

// Ícone da aba: preenchido quando o destino está ativo.
function IconeAba({ ativo, inativo, focused, color }: { ativo: Nome; inativo: Nome; focused: boolean; color: ColorValue }) {
  return <Ionicons name={focused ? ativo : inativo} size={24} color={color as string} />;
}

export default function LayoutTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // quem mostra o cabeçalho (com o ícone de menu) é o Drawer
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSuave,
        tabBarLabelStyle: { fontSize: 12, fontFamily: familia.medio },
        // Altura = conteúdo + área segura (barra de gestos do celular), para nada ficar cortado.
        tabBarStyle: {
          backgroundColor: cores.superficie,
          borderTopColor: cores.borda,
          height: 62 + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom + 8,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: ({ focused, color }) => <IconeAba ativo="home" inativo="home-outline" focused={focused} color={color} /> }} />
      <Tabs.Screen name="explorar" options={{ title: 'Explorar', tabBarIcon: ({ focused, color }) => <IconeAba ativo="search" inativo="search-outline" focused={focused} color={color} /> }} />
      <Tabs.Screen name="publicar" options={{ title: 'Publicar', tabBarIcon: ({ focused, color }) => <IconeAba ativo="add-circle" inativo="add-circle-outline" focused={focused} color={color} /> }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: ({ focused, color }) => <IconeAba ativo="person" inativo="person-outline" focused={focused} color={color} /> }} />
    </Tabs>
  );
}
