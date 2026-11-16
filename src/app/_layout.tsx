import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { TelaMarca } from '@/components/TelaMarca';
import { cores } from '@/constants/tema';
import { AuthProvider, useAuth } from '@/contexts/AuthProvider';

// Mantém a splash nativa na tela até a primeira tela em React estar pronta.
SplashScreen.preventAutoHideAsync();

// Decide quais rotas existem conforme a sessão:
//  - com sessão: só a área (rede); tentar abrir /login redireciona para o Início;
//  - sem sessão: só login e cadastro; a área (rede) fica inacessível.
// Ao sair, o histórico das telas privadas é descartado, então Voltar não as reabre.
function Rotas() {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    // Troca a splash nativa pela tela de marca em React (mesma cor de fundo).
    return <TelaMarca aoMontar={() => SplashScreen.hideAsync()} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.fundo } }}>
      <Stack.Protected guard={!!usuario}>
        <Stack.Screen name="(rede)" />
      </Stack.Protected>
      <Stack.Protected guard={!usuario}>
        <Stack.Screen name="login" />
        <Stack.Screen name="cadastro" />
      </Stack.Protected>
    </Stack>
  );
}

export default function LayoutRaiz() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Rotas />
    </AuthProvider>
  );
}
