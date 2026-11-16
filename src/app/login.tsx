import { Link, useRouter } from 'expo-router';
import { Text } from 'react-native';

import { Botao } from '@/components/Botao';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { Tela } from '@/components/Tela';
import { cores } from '@/constants/tema';

// PLACEHOLDER (Fase 2): o formulário real entra na Fase 3.
export default function Login() {
  const router = useRouter();
  return (
    <Tela>
      <CabecalhoTela secao="Entrar" titulo="Entrar" />
      <Botao titulo="Entrar (provisório)" aoPressionar={() => router.replace('/')} />
      <Link href="/cadastro" accessibilityRole="link" style={{ color: cores.primaria }}>
        <Text>Criar conta</Text>
      </Link>
    </Tela>
  );
}
