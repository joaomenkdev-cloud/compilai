import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { useFonts } from 'expo-font';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { Botao } from '@/components/Botao';
import { EstadoErro } from '@/components/EstadoErro';
import { TelaMarca } from '@/components/TelaMarca';
import { cores, espaco } from '@/constants/tema';
import { AuthProvider, useAuth } from '@/contexts/AuthProvider';
import { abrirBanco } from '@/lib/db';

// Mantém a splash nativa na tela até a primeira tela em React estar pronta.
SplashScreen.preventAutoHideAsync();

// Abre o SQLite do aparelho uma vez, logo ao iniciar (rascunho + cache do feed).
abrirBanco().catch(() => {});

// Decide quais rotas existem conforme a sessão:
//  - com sessão: só a área (rede); tentar abrir /login redireciona para o Início;
//  - sem sessão: só login e cadastro; a área (rede) fica inacessível.
// Ao sair, o histórico das telas privadas é descartado, então Voltar não as reabre.
function Rotas() {
  const { usuario, carregando } = useAuth();
  // Fontes do tema (Space Grotesk nos títulos, DM Sans no texto). Vêm junto com o app,
  // então carregam mesmo sem internet. Se falharem, seguimos com a fonte do sistema.
  const [fontesProntas, erroFontes] = useFonts({
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  if (carregando || (!fontesProntas && !erroFontes)) {
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

// Se alguma tela quebrar com um erro inesperado, o Expo Router mostra isto
// (em vez de fechar o app), com a opção de tentar de novo.
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <View style={{ flex: 1, backgroundColor: cores.fundo, padding: espaco.xl, justifyContent: 'center', gap: espaco.lg }}>
      <EstadoErro mensagem="Algo inesperado aconteceu nesta tela. Tente de novo; se continuar, feche e abra o app." />
      <Botao titulo="Tentar de novo" icone="refresh" aoPressionar={retry} />
    </View>
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
