import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cores, familia } from '@/constants/tema';
import { useLayout } from '@/hooks/useLayout';

type Nome = keyof typeof Ionicons.glyphMap;

// Ícone da aba: preenchido quando o destino está ativo.
function IconeAba({ ativo, inativo, focused, color }: { ativo: Nome; inativo: Nome; focused: boolean; color: ColorValue }) {
  return <Ionicons name={focused ? ativo : inativo} size={24} color={color as string} />;
}

export default function LayoutTabs() {
  const insets = useSafeAreaInsets();
  // No computador a barra continua (o PDF pede os 4 destinos embaixo), mas vira uma
  // pílula centralizada e flutuante, em vez de esticar de ponta a ponta.
  const { computador } = useLayout();
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // quem mostra o cabeçalho (com o ícone de menu) é o Drawer
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSuave,
        tabBarLabelStyle: { fontSize: 12, lineHeight: 16, fontFamily: familia.medio },
        // Altura = conteúdo + área segura (barra de gestos do celular), para nada ficar cortado.
        tabBarStyle: computador
          ? {
              alignSelf: 'center',
              width: 520,
              marginBottom: 16,
              height: 68,
              paddingTop: 6,
              paddingBottom: 6,
              borderRadius: 999,
              borderTopWidth: 0,
              backgroundColor: cores.superficie,
              boxShadow: '0px 8px 24px rgba(15, 76, 92, 0.14)',
            }
          : {
              backgroundColor: cores.superficie,
              borderTopColor: cores.borda,
              height: 68 + insets.bottom,
              paddingTop: 6,
              paddingBottom: insets.bottom + 6,
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
