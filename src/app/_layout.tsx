import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { cores } from '@/constants/tema';

// Stack raiz: telas públicas (login, cadastro) + o grupo protegido (rede).
// Na Fase 3 entram aqui o AuthProvider e a splash enquanto a sessão carrega.
export default function LayoutRaiz() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.fundo } }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="cadastro" />
        <Stack.Screen name="(rede)" />
      </Stack>
    </>
  );
}
